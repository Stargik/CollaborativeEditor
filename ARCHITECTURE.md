# Architecture Overview

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **SignalR Client** - Real-time communication
- **HTML5 Canvas** - Drawing surface

### Backend
- **.NET 8.0** - Server framework
- **ASP.NET Core** - Web framework
- **SignalR** - Real-time communication hub
- **C#** - Programming language

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            React Application (Port 3000)              │  │
│  │                                                        │  │
│  │  ┌────────────┐  ┌──────────┐  ┌─────────────────┐  │  │
│  │  │   Canvas   │  │ Toolbar  │  │  Properties     │  │  │
│  │  │ Component  │  │Component │  │     Panel       │  │  │
│  │  └────────────┘  └──────────┘  └─────────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │      useWebSocket Hook (SignalR Client)      │    │  │
│  │  └──────────────┬───────────────────────────────┘    │  │
│  └─────────────────┼────────────────────────────────────┘  │
└────────────────────┼───────────────────────────────────────┘
                     │
                     │ SignalR Connection
                     │ (WebSocket/SSE/Long Polling)
                     │
┌────────────────────┼───────────────────────────────────────┐
│                    ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      ASP.NET Core Server (Port 5000)                 │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │           DiagramHub (SignalR Hub)           │    │  │
│  │  │                                               │    │  │
│  │  │  Methods:                                     │    │  │
│  │  │  - UserUpdate()                               │    │  │
│  │  │  - AddShape()                                 │    │  │
│  │  │  - UpdateShape()                              │    │  │
│  │  │  - DeleteShape()                              │    │  │
│  │  │  - ClearAll()                                 │    │  │
│  │  └──────────────┬───────────────────────────────┘    │  │
│  │                 │                                      │  │
│  │  ┌──────────────▼───────────────────────────────┐    │  │
│  │  │      In-Memory Storage                       │    │  │
│  │  │  - ConnectedUsers (ConcurrentDictionary)     │    │  │
│  │  │  - Shapes (ConcurrentDictionary)             │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Connects
1. User opens browser → React app loads
2. `useWebSocket` hook initializes SignalR connection
3. Connection established → `UserUpdate` sent to server
4. Server stores user info and sends `sync` with all shapes
5. User sees existing shapes and active users

### Drawing a Shape
1. User draws on canvas → Shape created locally
2. `handleAddShape` called → Shape added to local state
3. `sendMessage` invokes `AddShape` on server
4. Server stores shape and broadcasts to other clients
5. Other clients receive `ReceiveMessage` event → Update their canvas

### Updating a Shape
1. User drags/edits shape → Local state updated immediately
2. `handleUpdateShape` called → Visual feedback instant
3. `sendMessage` invokes `UpdateShape` on server
4. Server updates shape and broadcasts to others
5. Other clients receive update → Sync their view

### User Disconnects
1. Connection closes (browser closed, network issue)
2. Server detects disconnection in `OnDisconnectedAsync`
3. Server removes user from `ConnectedUsers`
4. Server broadcasts `UserLeft` event
5. Other clients update their user list

## SignalR Connection

SignalR automatically negotiates the best transport:
1. **WebSockets** (preferred) - bidirectional, low latency
2. **Server-Sent Events** - server → client streaming
3. **Long Polling** - fallback for older browsers

## State Management

### Frontend State
- **Local State** (React useState):
  - Current tool, colors
  - Selected shape
  - Shapes array
  - Users map
  
### Backend State
- **In-Memory** (ConcurrentDictionary):
  - Connected users (UserId → UserInfo)
  - All shapes (ShapeId → Shape)

### Synchronization
- New users receive full state on connect (`sync` action)
- Changes are broadcast to all other clients
- No database persistence (could be added for production)

## Scalability Considerations

For production deployment:

1. **Database Integration**
   - Add Entity Framework Core
   - Persist shapes to SQL Server/PostgreSQL
   - Store user sessions

2. **Redis Backplane**
   - Enable multi-server SignalR
   - Share state across instances
   - Handle load balancing

3. **Authentication**
   - Add ASP.NET Identity
   - Secure SignalR hub with [Authorize]
   - JWT tokens for API

4. **Monitoring**
   - Application Insights
   - Health checks
   - Performance metrics

## Security

Current implementation is for development only:

- ✅ CORS configured for localhost
- ❌ No authentication/authorization
- ❌ No input validation
- ❌ No rate limiting
- ❌ No data encryption beyond HTTPS

**Do not deploy this to production without adding proper security!**

## Performance

- **Concurrent Users**: Limited by memory (hundreds)
- **Shapes per Diagram**: Limited by browser canvas (thousands)
- **Message Rate**: SignalR handles 100k+ messages/second
- **Latency**: <100ms for local network

## Development

### Adding New Shape Types

1. Add type to `Tool` type in `Frontend/src/types/index.ts`
2. Add drawing logic in `Frontend/src/components/Canvas.tsx` → `drawShape()`
3. Add creation logic in `Frontend/src/components/Canvas.tsx` → `createShape()`
4. Add toolbar button in `Frontend/src/components/Toolbar.tsx`
5. Backend automatically handles (schema-agnostic)

### Adding New Features

1. **Undo/Redo**: Implement action history in frontend
2. **Export/Import**: Add JSON serialization endpoints
3. **Permissions**: Add owner/viewer roles per shape
4. **Comments**: Add text annotations with threads
5. **Templates**: Store and load preset diagrams
