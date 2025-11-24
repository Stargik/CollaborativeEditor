using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollaborativeEditor.Data;
using CollaborativeEditor.Services;

namespace CollaborativeEditor.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly RoomStateService _roomStateService;
    private readonly IDbContextFactory<ApplicationDbContext> _contextFactory;
    private readonly ILogger<RoomsController> _logger;

    public RoomsController(
        RoomStateService roomStateService,
        IDbContextFactory<ApplicationDbContext> contextFactory,
        ILogger<RoomsController> logger)
    {
        _roomStateService = roomStateService;
        _contextFactory = contextFactory;
        _logger = logger;
    }

    /// <summary>
    /// Get all rooms with their metadata
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllRooms()
    {
        try
        {
            var roomNames = await _roomStateService.GetAllRoomNamesAsync();
            
            var rooms = new List<object>();
            await using var context = await _contextFactory.CreateDbContextAsync();
            
            foreach (var roomName in roomNames)
            {
                var roomState = await context.RoomStates.FindAsync(roomName);
                if (roomState != null)
                {
                    rooms.Add(new
                    {
                        id = roomState.Id,
                        stateSize = roomState.YjsState?.Length ?? 0,
                        lastModified = roomState.LastModified,
                        metadata = roomState.Metadata
                    });
                }
            }
            
            _logger.LogInformation($"Returning {rooms.Count} rooms");
            return Ok(rooms);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting rooms list");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get a specific room by name
    /// </summary>
    [HttpGet("{roomName}")]
    public async Task<IActionResult> GetRoom(string roomName)
    {
        try
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            var roomState = await context.RoomStates.FindAsync(roomName);
            
            if (roomState == null)
            {
                return NotFound(new { error = "Room not found" });
            }
            
            return Ok(new
            {
                id = roomState.Id,
                stateSize = roomState.YjsState?.Length ?? 0,
                lastModified = roomState.LastModified,
                metadata = roomState.Metadata
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting room {roomName}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Delete a room
    /// </summary>
    [HttpDelete("{roomName}")]
    public async Task<IActionResult> DeleteRoom(string roomName)
    {
        try
        {
            // Check if room exists first
            await using var context = await _contextFactory.CreateDbContextAsync();
            var roomState = await context.RoomStates.FindAsync(roomName);
            
            if (roomState == null)
            {
                return NotFound(new { error = "Room not found" });
            }
            
            await _roomStateService.DeleteRoomStateAsync(roomName);
            _logger.LogInformation($"Deleted room: {roomName}");
            return Ok(new { message = "Room deleted successfully", roomName });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting room {roomName}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Clean up old rooms
    /// </summary>
    [HttpPost("cleanup")]
    public async Task<IActionResult> CleanupOldRooms([FromQuery] int daysOld = 30)
    {
        try
        {
            var deletedCount = await _roomStateService.CleanupOldRoomsAsync(TimeSpan.FromDays(daysOld));
            _logger.LogInformation($"Cleaned up {deletedCount} old rooms (older than {daysOld} days)");
            return Ok(new { message = "Cleanup completed", deletedCount, daysOld });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cleanup");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
