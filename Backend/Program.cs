using CollaborativeEditor.Hubs;

var builder = WebApplication.CreateBuilder(args);

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

// Map SignalR hubs with CORS
app.MapHub<DiagramHub>("/diagramHub").RequireCors("AllowAll");  // Old hub (kept for backward compatibility)
app.MapHub<YjsHub>("/yjsHub").RequireCors("AllowAll");           // New Yjs CRDT hub (dumb pipe)

app.Run();
