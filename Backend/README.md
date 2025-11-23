# Collaborative Diagram Editor - Backend

ASP.NET Core backend with SignalR for real-time collaboration.

## Prerequisites

- .NET 8.0 SDK or later

## Getting Started

### 1. Restore Dependencies

```bash
cd Backend
dotnet restore
```

### 2. Run the Server

```bash
dotnet run
```

The server will start on `http://localhost:5000`

## Project Structure

```
Backend/
├── Program.cs              # Application entry point and configuration
├── Backend.csproj          # Project file with dependencies
├── appsettings.json        # Application configuration
├── Hubs/
│   └── DiagramHub.cs       # SignalR hub for real-time communication
└── Properties/
    └── launchSettings.json # Launch configuration
```

## SignalR Hub Endpoints

The `DiagramHub` provides the following methods:

### Client to Server Methods

- **UserUpdate(UserUpdateMessage)** - Register/update user information
- **AddShape(ShapeMessage)** - Add a new shape to the diagram
- **UpdateShape(ShapeMessage)** - Update an existing shape
- **DeleteShape(ShapeMessage)** - Delete a shape
- **ClearAll(ClearMessage)** - Clear all shapes from the diagram

### Server to Client Events

- **ReceiveMessage** - Receives updates from other users (add, update, delete, clear, sync, user_update)
- **UserLeft** - Notifies when a user disconnects

## Features

- Real-time collaboration using SignalR
- Automatic reconnection handling
- User presence tracking
- Shape synchronization across all connected clients
- CORS enabled for local development

## Data Models

### Shape
```csharp
{
  Id: string,
  Type: string,
  X: double,
  Y: double,
  Width?: double,
  Height?: double,
  Radius?: double,
  EndX?: double,
  EndY?: double,
  Text?: string,
  FontSize?: int,
  FillColor: string,
  StrokeColor: string,
  UserId: string
}
```

### UserInfo
```csharp
{
  UserId: string,
  Username: string,
  ConnectionId: string
}
```

## Development

The backend uses in-memory storage (ConcurrentDictionary) for shapes and user information. In a production environment, you would want to:

1. Add a database for persistence
2. Implement proper error handling and logging
3. Add authentication and authorization
4. Scale with Redis backplane for multiple server instances

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, update the port in `appsettings.json`:

```json
{
  "Urls": "http://localhost:YOUR_PORT"
}
```

Also update the frontend's `useWebSocket.ts` to match the new port.

### CORS Issues

Make sure the frontend URL is included in the CORS policy in `Program.cs`.
