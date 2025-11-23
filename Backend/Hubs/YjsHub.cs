using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace CollaborativeEditor.Hubs
{
    /// <summary>
    /// SignalR Hub for Yjs synchronization
    /// This is a "dumb pipe" - it just relays binary Yjs messages between clients
    /// All CRDT logic is handled client-side by Yjs
    /// </summary>
    public class YjsHub : Hub
    {
        // Track which clients are in which rooms
        private static readonly ConcurrentDictionary<string, HashSet<string>> _rooms = new();
        private static readonly object _roomLock = new();

        /// <summary>
        /// Join a collaboration room
        /// </summary>
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

            Console.WriteLine($"Client {Context.ConnectionId} joined room: {roomName}");
            
            // Notify others in the room
            await Clients.OthersInGroup(roomName).SendAsync("UserJoined", Context.ConnectionId);
        }

        /// <summary>
        /// Leave a collaboration room
        /// </summary>
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

            Console.WriteLine($"Client {Context.ConnectionId} left room: {roomName}");
            
            // Notify others in the room
            await Clients.OthersInGroup(roomName).SendAsync("UserLeft", Context.ConnectionId);
        }

        /// <summary>
        /// Relay Yjs sync message to other clients in the room
        /// This is the core "dumb pipe" functionality - just forward the message
        /// Message is sent as base64 string for JSON protocol compatibility
        /// </summary>
        public async Task SyncMessage(string roomName, string message)
        {
            try
            {
                Console.WriteLine($"SyncMessage received: roomName={roomName}, messageLength={message?.Length ?? 0}");
                
                if (string.IsNullOrEmpty(message))
                {
                    Console.WriteLine("Warning: Empty or null message received");
                    return;
                }
                
                // Simply relay the base64 string to all other clients in the room
                // No processing, no state management - pure relay
                await Clients.OthersInGroup(roomName).SendAsync("ReceiveSyncMessage", message);
                
                Console.WriteLine($"SyncMessage relayed successfully to room {roomName}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SyncMessage: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        /// <summary>
        /// Broadcast awareness update (cursor position, user info, etc.)
        /// </summary>
        public async Task AwarenessUpdate(string roomName, string awarenessData)
        {
            await Clients.OthersInGroup(roomName).SendAsync("ReceiveAwarenessUpdate", awarenessData);
        }

        /// <summary>
        /// Handle client disconnect
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Remove from all rooms
            lock (_roomLock)
            {
                foreach (var room in _rooms)
                {
                    if (room.Value.Contains(Context.ConnectionId))
                    {
                        room.Value.Remove(Context.ConnectionId);
                        
                        // Notify others
                        Clients.OthersInGroup(room.Key).SendAsync("UserLeft", Context.ConnectionId);
                    }
                }
                
                // Clean up empty rooms
                var emptyRooms = _rooms.Where(r => r.Value.Count == 0).Select(r => r.Key).ToList();
                foreach (var emptyRoom in emptyRooms)
                {
                    _rooms.TryRemove(emptyRoom, out _);
                }
            }

            Console.WriteLine($"Client {Context.ConnectionId} disconnected");
            
            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Get list of users in a room
        /// </summary>
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
