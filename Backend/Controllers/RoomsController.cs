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

    public RoomsController(
        RoomStateService roomStateService,
        IDbContextFactory<ApplicationDbContext> contextFactory)
    {
        _roomStateService = roomStateService;
        _contextFactory = contextFactory;
    }

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
            
            return Ok(rooms);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

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
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("{roomName}")]
    public async Task<IActionResult> DeleteRoom(string roomName)
    {
        try
        {

            await using var context = await _contextFactory.CreateDbContextAsync();
            var roomState = await context.RoomStates.FindAsync(roomName);
            
            if (roomState == null)
            {
                return NotFound(new { error = "Room not found" });
            }
            
            await _roomStateService.DeleteRoomStateAsync(roomName);
            return Ok(new { message = "Room deleted successfully", roomName });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("cleanup")]
    public async Task<IActionResult> CleanupOldRooms([FromQuery] int daysOld = 30)
    {
        try
        {
            var deletedCount = await _roomStateService.CleanupOldRoomsAsync(TimeSpan.FromDays(daysOld));
            return Ok(new { message = "Cleanup completed", deletedCount, daysOld });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
