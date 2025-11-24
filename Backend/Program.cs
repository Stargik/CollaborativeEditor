using CollaborativeEditor.Hubs;
using CollaborativeEditor.Data;
using CollaborativeEditor.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add SQLite database
builder.Services.AddDbContextFactory<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=collaborative_editor.db"));

// Add services
builder.Services.AddSingleton<RoomStateService>();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add SignalR with configuration for binary data
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 1024 * 1024; // 1MB max message size
});

// Add CORS - must be permissive for SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true) // Allow any origin in development
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware order is critical for CORS with SignalR:
// UseRouting() -> UseCors() -> UseAuthorization() -> Endpoints
app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();

// Map SignalR hub with CORS
app.MapHub<YjsHub>("/yjsHub").RequireCors("AllowAll");  // Yjs CRDT hub (dumb pipe)

app.Run();
