using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using CollaborativeEditor.Services;

namespace CollaborativeEditor.Hubs
{
    /// <summary>
    /// SignalR Hub for Yjs synchronization with persistence
    /// Relays binary Yjs messages between clients and can save state to SQLite
    /// All CRDT logic is handled client-side by Yjs
    /// </summary>
    public class YjsHub : Hub
    {
        // Track which clients are in which rooms
        private static readonly ConcurrentDictionary<string, HashSet<string>> _rooms = new();
        private static readonly object _roomLock = new();
        
        // Store accumulated state per room in memory
        private static readonly ConcurrentDictionary<string, byte[]> _roomStates = new();
        
        private readonly RoomStateService _roomStateService;
        private readonly ILogger<YjsHub> _logger;

        public YjsHub(RoomStateService roomStateService, ILogger<YjsHub> logger)
        {
            _roomStateService = roomStateService;
            _logger = logger;
        }

        /// <summary>
        /// Join a collaboration room and receive persisted state
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

            _logger.LogInformation($"Client {Context.ConnectionId} joined room: {roomName}");
            
            // Load persisted state if available
            var persistedState = await _roomStateService.LoadRoomStateAsync(roomName);
            if (persistedState != null && persistedState.Length > 0)
            {
                // Initialize room state with persisted data (only if not already present)
                _roomStates.TryAdd(roomName, persistedState);
                
                // Send persisted state to the joining client as base64
                var base64State = Convert.ToBase64String(persistedState);
                await Clients.Caller.SendAsync("LoadPersistedState", base64State);
                _logger.LogInformation($"Sent persisted state to client {Context.ConnectionId} for room {roomName}, size: {persistedState.Length} bytes");
            }
            else
            {
                // Initialize empty state for the room
                _roomStates.TryAdd(roomName, Array.Empty<byte>());
                _logger.LogInformation($"No persisted state found for room {roomName}, starting fresh");
            }
            
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
        /// Stores updates in memory for manual save
        /// </summary>
        public async Task SyncMessage(string roomName, string message)
        {
            try
            {
                _logger.LogDebug($"SyncMessage received: roomName={roomName}, messageLength={message?.Length ?? 0}");
                
                if (string.IsNullOrEmpty(message))
                {
                    _logger.LogWarning("Empty or null message received");
                    return;
                }
                
                // Decode the base64 message to binary
                var binaryUpdate = Convert.FromBase64String(message);
                
                // Store/merge the update in memory by concatenating
                // Yjs can handle multiple concatenated updates when applying them
                _roomStates.AddOrUpdate(roomName, binaryUpdate, (key, existing) =>
                {
                    var merged = new byte[existing.Length + binaryUpdate.Length];
                    existing.CopyTo(merged, 0);
                    binaryUpdate.CopyTo(merged, existing.Length);
                    return merged;
                });
                
                // Relay the base64 string to all other clients in the room
                await Clients.OthersInGroup(roomName).SendAsync("ReceiveSyncMessage", message);
                
                _logger.LogDebug($"SyncMessage relayed to room {roomName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in SyncMessage");
                throw;
            }
        }

        /// <summary>
        /// Receive full document state from client for saving
        /// This is called by the client with the full Yjs document state
        /// </summary>
        public async Task SaveFullState(string roomName, string fullStateBase64)
        {
            try
            {
                if (string.IsNullOrEmpty(fullStateBase64))
                {
                    _logger.LogWarning($"Empty state received for save in room {roomName}");
                    await Clients.Caller.SendAsync("SaveCompleted", new { roomName, success = false, error = "Empty state" });
                    return;
                }

                var fullState = Convert.FromBase64String(fullStateBase64);
                
                // Save to database
                await _roomStateService.SaveRoomStateAsync(roomName, fullState);
                _logger.LogInformation($"✓ Saved full state for room {roomName}, size: {fullState.Length} bytes");
                
                // Update in-memory state to match what was saved
                _roomStates[roomName] = fullState;
                
                // Notify all clients in the room that save was successful
                await Clients.Group(roomName).SendAsync("SaveCompleted", new { roomName, success = true, timestamp = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error saving full state for room {roomName}");
                await Clients.Caller.SendAsync("SaveCompleted", new { roomName, success = false, error = ex.Message });
            }
        }

        /// <summary>
        /// Manually save the current room state to database (deprecated - use SaveFullState instead)
        /// </summary>
        [Obsolete("Use SaveFullState instead - this method uses concatenated updates which don't work correctly")]
        public async Task<bool> SaveRoomState(string roomName)
        {
            try
            {
                if (_roomStates.TryGetValue(roomName, out var currentState) && currentState.Length > 0)
                {
                    await _roomStateService.SaveRoomStateAsync(roomName, currentState);
                    _logger.LogInformation($"✓ Manual save: State persisted for room {roomName}, size: {currentState.Length} bytes");
                    
                    // Clear the in-memory accumulated updates since we just saved the full state
                    // New updates after this will be added on top of this saved state
                    _roomStates[roomName] = currentState;
                    
                    // Notify all clients in the room that save was successful
                    await Clients.Group(roomName).SendAsync("SaveCompleted", new { roomName, success = true, timestamp = DateTime.UtcNow });
                    return true;
                }
                else
                {
                    _logger.LogWarning($"No state found for room {roomName} to save");
                    await Clients.Caller.SendAsync("SaveCompleted", new { roomName, success = false, error = "No state to save" });
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error saving state for room {roomName}");
                await Clients.Caller.SendAsync("SaveCompleted", new { roomName, success = false, error = ex.Message });
                return false;
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
