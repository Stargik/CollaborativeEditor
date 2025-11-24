using CollaborativeEditor.Data;
using CollaborativeEditor.Models;
using Microsoft.EntityFrameworkCore;

namespace CollaborativeEditor.Services
{
    public class RoomStateService
    {
        private readonly IDbContextFactory<ApplicationDbContext> _contextFactory;
        private readonly ILogger<RoomStateService> _logger;

        public RoomStateService(
            IDbContextFactory<ApplicationDbContext> contextFactory,
            ILogger<RoomStateService> logger)
        {
            _contextFactory = contextFactory;
            _logger = logger;
        }

        public async Task<byte[]?> LoadRoomStateAsync(string roomName)
        {
            try
            {
                await using var context = await _contextFactory.CreateDbContextAsync();
                var roomState = await context.RoomStates.FindAsync(roomName);
                
                if (roomState != null)
                {
                    _logger.LogInformation($"Loaded state for room {roomName}, size: {roomState.YjsState.Length} bytes");
                    return roomState.YjsState;
                }
                
                _logger.LogInformation($"No existing state found for room {roomName}");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error loading state for room {roomName}");
                return null;
            }
        }

        public async Task SaveRoomStateAsync(string roomName, byte[] yjsState, string? metadata = null)
        {
            try
            {
                await using var context = await _contextFactory.CreateDbContextAsync();
                
                var roomState = await context.RoomStates.FindAsync(roomName);
                
                if (roomState != null)
                {

                    roomState.YjsState = yjsState;
                    roomState.LastModified = DateTime.UtcNow;
                    if (metadata != null)
                    {
                        roomState.Metadata = metadata;
                    }
                }
                else
                {

                    roomState = new RoomState
                    {
                        Id = roomName,
                        YjsState = yjsState,
                        LastModified = DateTime.UtcNow,
                        Metadata = metadata
                    };
                    context.RoomStates.Add(roomState);
                }

                await context.SaveChangesAsync();
                _logger.LogInformation($"✓ Saved state for room {roomName}, size: {yjsState.Length} bytes");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error saving state for room {roomName}");
                throw;
            }
        }

        public async Task DeleteRoomStateAsync(string roomName)
        {
            try
            {
                await using var context = await _contextFactory.CreateDbContextAsync();
                var roomState = await context.RoomStates.FindAsync(roomName);
                
                if (roomState != null)
                {
                    context.RoomStates.Remove(roomState);
                    await context.SaveChangesAsync();
                    _logger.LogInformation($"Deleted state for room {roomName}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting state for room {roomName}");
                throw;
            }
        }

        public async Task<List<string>> GetAllRoomNamesAsync()
        {
            try
            {
                await using var context = await _contextFactory.CreateDbContextAsync();
                return await context.RoomStates.Select(r => r.Id).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting room names");
                return new List<string>();
            }
        }

        public async Task<int> CleanupOldRoomsAsync(TimeSpan olderThan)
        {
            try
            {
                await using var context = await _contextFactory.CreateDbContextAsync();
                var cutoffDate = DateTime.UtcNow - olderThan;
                
                var oldRooms = await context.RoomStates
                    .Where(r => r.LastModified < cutoffDate)
                    .ToListAsync();
                
                if (oldRooms.Any())
                {
                    context.RoomStates.RemoveRange(oldRooms);
                    await context.SaveChangesAsync();
                    _logger.LogInformation($"Cleaned up {oldRooms.Count} old rooms");
                    return oldRooms.Count;
                }
                
                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old rooms");
                return 0;
            }
        }
    }
}
