using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using CollaborativeEditor.Services;

namespace CollaborativeEditor.Hubs
{
    public class YjsHub : Hub
    {
        private static readonly ConcurrentDictionary<string, HashSet<string>> _rooms = new();
        private static readonly object _roomLock = new();
        private static readonly ConcurrentDictionary<string, byte[]> _roomStates = new();
        
        private readonly RoomStateService _roomStateService;

        public YjsHub(RoomStateService roomStateService)
        {
            _roomStateService = roomStateService;
        }        
        public async Task JoinRoom(string roomName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            
            lock (_roomLock)
            {
                if (!_rooms.ContainsKey(roomName))
                {
                    _rooms[roomName] = new HashSet<string>();
                }
                _rooms[roomName].Add(Context.ConnectionId);
            }

            var persistedState = await _roomStateService.LoadRoomStateAsync(roomName);
            if (persistedState != null && persistedState.Length > 0)
            {
                _roomStates.TryAdd(roomName, persistedState);
                var base64State = Convert.ToBase64String(persistedState);
                await Clients.Caller.SendAsync("LoadPersistedState", base64State);
            }
            else
            {
                _roomStates.TryAdd(roomName, Array.Empty<byte>());
            }
            
            await Clients.OthersInGroup(roomName).SendAsync("UserJoined", Context.ConnectionId);
        }

        public async Task LeaveRoom(string roomName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
            
            lock (_roomLock)
            {
                if (_rooms.ContainsKey(roomName))
                {
                    _rooms[roomName].Remove(Context.ConnectionId);
                    if (_rooms[roomName].Count == 0)
                    {
                        _rooms.TryRemove(roomName, out _);
                    }
                }
            }
            await Clients.OthersInGroup(roomName).SendAsync("UserLeft", Context.ConnectionId);
        }

        public async Task SyncMessage(string roomName, string message)
        {
            try
            {
                if (string.IsNullOrEmpty(message))
                {
                    return;
                }
                
                var binaryUpdate = Convert.FromBase64String(message);
                
                _roomStates.AddOrUpdate(roomName, binaryUpdate, (key, existing) =>
                {
                    var merged = new byte[existing.Length + binaryUpdate.Length];
                    existing.CopyTo(merged, 0);
                    binaryUpdate.CopyTo(merged, existing.Length);
                    return merged;
                });
                
                await Clients.OthersInGroup(roomName).SendAsync("ReceiveSyncMessage", message);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task SaveFullState(string roomName, string fullStateBase64)
        {
            try
            {
                if (string.IsNullOrEmpty(fullStateBase64))
                {
                    await Clients.Caller.SendAsync("SaveCompleted", new { roomName, success = false, error = "Empty state" });
                    return;
                }

                var fullState = Convert.FromBase64String(fullStateBase64);
                
                await _roomStateService.SaveRoomStateAsync(roomName, fullState);
                
                _roomStates[roomName] = fullState;
                await Clients.Group(roomName).SendAsync("SaveCompleted", new { roomName, success = true, timestamp = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("SaveCompleted", new { roomName, success = false, error = ex.Message });
            }
        }

        public async Task AwarenessUpdate(string roomName, string awarenessData)
        {
            await Clients.OthersInGroup(roomName).SendAsync("ReceiveAwarenessUpdate", awarenessData);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            lock (_roomLock)
            {
                foreach (var room in _rooms)
                {
                    if (room.Value.Contains(Context.ConnectionId))
                    {
                        room.Value.Remove(Context.ConnectionId);
                        Clients.OthersInGroup(room.Key).SendAsync("UserLeft", Context.ConnectionId);
                    }
                }
                
                var emptyRooms = _rooms.Where(r => r.Value.Count == 0).Select(r => r.Key).ToList();
                foreach (var emptyRoom in emptyRooms)
                {
                    _rooms.TryRemove(emptyRoom, out _);
                }
            }

            Console.WriteLine($"Client {Context.ConnectionId} disconnected");
            
            await base.OnDisconnectedAsync(exception);
        }

        public List<string> GetRoomUsers(string roomName)
        {
            if (_rooms.TryGetValue(roomName, out var users))
            {
                return users.ToList();
            }
            return new List<string>();
        }
    }
}
