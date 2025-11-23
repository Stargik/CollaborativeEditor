using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace CollaborativeEditor.Hubs
{
    public class DiagramHub : Hub
    {
        private static readonly ConcurrentDictionary<string, UserInfo> ConnectedUsers = new();
        private static readonly ConcurrentDictionary<string, Shape> Shapes = new();

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Find and remove the disconnected user
            var disconnectedUser = ConnectedUsers.FirstOrDefault(u => u.Value.ConnectionId == Context.ConnectionId);
            if (!string.IsNullOrEmpty(disconnectedUser.Key))
            {
                ConnectedUsers.TryRemove(disconnectedUser.Key, out _);
                
                // Notify all clients about user leaving
                await Clients.Others.SendAsync("UserLeft", new
                {
                    action = "user_left",
                    userId = disconnectedUser.Key,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                });
            }

            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task UserUpdate(UserUpdateMessage message)
        {
            try
            {
                var userInfo = new UserInfo
                {
                    UserId = message.UserId,
                    Username = message.Username,
                    ConnectionId = Context.ConnectionId
                };

                ConnectedUsers.AddOrUpdate(message.UserId, userInfo, (key, old) => userInfo);

                // Send sync data to the new user
                await Clients.Caller.SendAsync("ReceiveMessage", new
                {
                    action = "sync",
                    shapes = Shapes.Values.ToList(),
                    users = ConnectedUsers.ToDictionary(u => u.Key, u => u.Value.Username),
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                });

                // Notify others about the new user
                await Clients.Others.SendAsync("ReceiveMessage", new
                {
                    action = "user_update",
                    userId = message.UserId,
                    username = message.Username,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                });

                Console.WriteLine($"User updated: {message.Username} ({message.UserId})");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UserUpdate: {ex.Message}");
            }
        }

        public async Task AddShape(ShapeMessage message)
        {
            try
            {
                if (message.Shape != null)
                {
                    Shapes.TryAdd(message.Shape.Id, message.Shape);
                    
                    await Clients.Others.SendAsync("ReceiveMessage", new
                    {
                        action = "add",
                        shape = message.Shape,
                        userId = message.UserId,
                        username = message.Username,
                        timestamp = message.Timestamp
                    });

                    Console.WriteLine($"Shape added: {message.Shape.Id} by {message.Username}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddShape: {ex.Message}");
            }
        }

        public async Task UpdateShape(ShapeMessage message)
        {
            try
            {
                if (message.Shape != null)
                {
                    Shapes.AddOrUpdate(message.Shape.Id, message.Shape, (key, old) => message.Shape);
                    
                    await Clients.Others.SendAsync("ReceiveMessage", new
                    {
                        action = "update",
                        shape = message.Shape,
                        userId = message.UserId,
                        username = message.Username,
                        timestamp = message.Timestamp
                    });

                    Console.WriteLine($"Shape updated: {message.Shape.Id} by {message.Username}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateShape: {ex.Message}");
            }
        }

        public async Task DeleteShape(ShapeMessage message)
        {
            try
            {
                if (message.Shape != null)
                {
                    Shapes.TryRemove(message.Shape.Id, out _);
                    
                    await Clients.Others.SendAsync("ReceiveMessage", new
                    {
                        action = "delete",
                        shape = message.Shape,
                        userId = message.UserId,
                        username = message.Username,
                        timestamp = message.Timestamp
                    });

                    Console.WriteLine($"Shape deleted: {message.Shape.Id} by {message.Username}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteShape: {ex.Message}");
            }
        }

        public async Task ClearAll(ClearMessage message)
        {
            try
            {
                Shapes.Clear();
                
                await Clients.Others.SendAsync("ReceiveMessage", new
                {
                    action = "clear",
                    userId = message.UserId,
                    username = message.Username,
                    timestamp = message.Timestamp
                });

                Console.WriteLine($"All shapes cleared by {message.Username}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ClearAll: {ex.Message}");
            }
        }
    }

    // Models
    public class UserInfo
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string ConnectionId { get; set; } = string.Empty;
    }

    public class Shape
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public double X { get; set; }
        public double Y { get; set; }
        public double? Width { get; set; }
        public double? Height { get; set; }
        public double? Radius { get; set; }
        public double? EndX { get; set; }
        public double? EndY { get; set; }
        public string? Text { get; set; }
        public int? FontSize { get; set; }
        public string FillColor { get; set; } = string.Empty;
        public string StrokeColor { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
    }

    public class UserUpdateMessage
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public long Timestamp { get; set; }
    }

    public class ShapeMessage
    {
        public string Action { get; set; } = string.Empty;
        public Shape? Shape { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public long Timestamp { get; set; }
    }

    public class ClearMessage
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public long Timestamp { get; set; }
    }
}
