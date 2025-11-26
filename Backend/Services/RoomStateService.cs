using CollaborativeEditor.Data;
using CollaborativeEditor.Models;
using Microsoft.EntityFrameworkCore;

namespace CollaborativeEditor.Services
{
public class RoomStateService
{
    private readonly IDbContextFactory<ApplicationDbContext> _contextFactory;    public RoomStateService(
        IDbContextFactory<ApplicationDbContext> contextFactory)
    {
        _contextFactory = contextFactory;
    }        public async Task<byte[]?> LoadRoomStateAsync(string roomName)
        {
            try
            {
                await using var context = await _contextFactory.CreateDbContextAsync();
                var roomState = await context.RoomStates.FindAsync(roomName);
                
                if (roomState != null)
                {
                    return roomState.YjsState;
                }
                
                return null;
            }
            catch
            {
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
            }
            catch
            {
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
                }
            }
            catch
            {
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
            catch
            {
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
                    return oldRooms.Count;
                }
                
                return 0;
            }
            catch
            {
                return 0;
            }
        }
    }
}
