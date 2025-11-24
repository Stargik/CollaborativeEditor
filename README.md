# Collaborative Diagram Editor



A real-time collaborative diagram editor built with ASP.NET Core SignalR and React, implementing the "Thick Client, Dumb Pipe" architecture using Yjs CRDT library.



## OverviewA real-time collaborative diagram editor using **React Flow** + **Yjs (CRDT)** + **.NET SignalR** for enterprise-grade collaborative editing.



This application enables multiple users to simultaneously create and edit diagrams with automatic conflict resolution. The system uses Conflict-free Replicated Data Types (CRDTs) via Yjs to ensure eventual consistency without requiring complex server-side synchronization logic.



## Architecture: "Thick Client, Dumb Pipe" with .NET SignalRA real-time collaborative diagram editor built with **React Flow** + **Yjs** (CRDT) for truly conflict-free collaboration.A real-time collaborative diagram editor built with React + TypeScript frontend and .NET backend with SignalR.



**Thick Client, Dumb Pipe**

- **Client-side (Thick)**: All CRDT logic, conflict resolution, and document merging handled by Yjs in the browser

- **Server-side (Dumb Pipe)**: SignalR hub acts as a simple message relay, broadcasting binary updates without understanding their content- **Thick Client**: All CRDT logic runs in browser using Yjs

- **Persistence**: SQLite database stores complete document snapshots for recovery

- **Dumb Pipe**: .NET SignalR hub acts as simple message relay

## Key Features

- **Enterprise Ready**: Built on .NET 8.0 with SignalR for production reliability## Architecture: "Thick Client, Dumb Pipe"## Features

- **Real-time Collaboration**: Multiple users can edit simultaneously with instant synchronization

- **Conflict-Free**: Yjs CRDT automatically resolves concurrent edits without conflicts

- **Automatic Reconnection**: Clients automatically reconnect and resync after network interruptions

- **State Persistence**: Manual save to SQLite database with full state snapshots## Features

- **Room Management**: Create, list, and delete collaboration rooms

- **Awareness Protocol**: See other users' cursors and selections in real-time



## Technology Stack- ✅ Real-time collaboration without conflicts (CRDT)This application follows the modern collaborative editing pattern:- **Drawing Tools**: Rectangle, Circle, Line, and Text



### Backend- ✅ Live cursors and user awareness

- ASP.NET Core 8.0

- SignalR for WebSocket communication- ✅ React Flow diagram editor- **Thick Client**: All CRDT (Conflict-free Replicated Data Types) logic runs in the browser using Yjs- **Real-time Collaboration**: Multiple users can edit simultaneously via SignalR

- Entity Framework Core with SQLite

- Binary message relay (no JSON parsing)- ✅ SignalR with automatic reconnection



### Frontend- ✅ Room-based collaboration- **Dumb Pipe**: WebSocket server simply relays messages between clients without any business logic- **Object Manipulation**: Select, move, and edit shapes

- React 18 with TypeScript

- Yjs CRDT library for document synchronization- ✅ Offline support

- React Flow for diagram canvas

- SignalR JavaScript client- **No Server-Side State**: The server doesn't maintain document state, making it trivially scalable- **Properties Panel**: Edit shape properties (position, size, colors, etc.)

- Zustand for state management

## Quick Start

## Getting Started

- **Layer Management**: View and select shapes from the layers panel

### Prerequisites

- .NET 8.0 SDK```bash

- Node.js 16+ with npm

# Install frontend dependencies

## Features- **User Presence**: See who is currently editing

### Installation

cd Frontend && npm install

1. Clone the repository

2. Install dependencies:- **Modern UI**: Built with React and TypeScript

```bash

cd Backend# Start both servers

dotnet restore

cd .. && chmod +x start.sh && ./start.sh- ✅ **Real-time Collaboration**: Multiple users can edit simultaneously without conflicts- **Automatic Reconnection**: Handles connection drops gracefully

cd ../Frontend

npm install```

```

- ✅ **CRDT-based Sync**: Uses Yjs for automatic conflict resolution

### Running the Application

Visit http://localhost:3000

Use the provided start script:

```bash- ✅ **Live Cursors**: See other users' cursors in real-time## Getting Started

./start.sh

```## Technology Stack



Or start services manually:- ✅ **React Flow**: Professional diagram library with built-in features



**Backend:****Frontend**: React 18, TypeScript, React Flow, Yjs, SignalR Client, Vite

```bash

cd Backend**Backend**: .NET 8.0, ASP.NET Core, SignalR, C#- ✅ **Drawing Tools**: Rectangle, Circle, Text nodes with connections### Prerequisites

dotnet run

```



**Frontend:**## Project Structure- ✅ **User Awareness**: See who's editing what in real-time

```bash

cd Frontend

npm run dev

```- `Backend/Hubs/YjsHub.cs` - SignalR hub (dumb pipe)- ✅ **Automatic Sync**: Changes propagate instantly with eventual consistency- Node.js 18+ and npm



The application will be available at:- `Frontend/src/providers/SignalRProvider.ts` - Yjs ↔ SignalR bridge

- Frontend: http://localhost:3000

- Backend API: http://localhost:5078- `Frontend/src/components/CollaborativeCanvas.tsx` - Main canvas- ✅ **Offline Support**: Continue editing offline, sync when reconnected- .NET 8.0 SDK

- SignalR Hub: http://localhost:5078/yjsHub

- `Frontend/src/hooks/useYjsSync.ts` - React Flow sync

## How It Works



### CRDTs (Conflict-free Replicated Data Types)

## How It Works

CRDTs are data structures that can be replicated across multiple computers in a network, where the replicas can be updated independently and concurrently without coordination between them, and where it is always mathematically possible to resolve inconsistencies that might come up.

## Technology Stack### Frontend Setup

**Key Properties:**

- **Commutativity**: Operations can be applied in any order1. **User edits** → Yjs updates locally (instant feedback)

- **Associativity**: Operations can be grouped in any way

- **Idempotency**: Operations can be applied multiple times with the same result2. **Yjs encodes** change as binary message

- **Eventual Consistency**: All replicas converge to the same state

3. **SignalR relays** message to other clients in room

### Yjs Implementation

4. **Other clients** apply update automatically (CRDT merge)### Frontend1. Navigate to the Frontend directory:

Yjs is a high-performance CRDT implementation optimized for shared editing:



1. **Document Structure**: Yjs maintains a shared document (`Y.Doc`) containing typed shared data structures (`Y.Map`, `Y.Array`)

2. **Update Encoding**: Changes are encoded as binary updates (compact and efficient)The SignalR hub is just ~100 lines - it routes messages, no business logic!- **React 18** - UI library```bash

3. **State Vectors**: Track which changes each client has seen

4. **Sync Protocol**: Efficiently synchronize by exchanging only missing updates



### Message Flow## Scaling- **TypeScript** - Type safetycd Frontend



1. **User Action**: User creates/moves/edits a shape

2. **Yjs Update**: Yjs generates a binary update representing the change

3. **Broadcast**: Update sent to SignalR hub via `SyncMessage`Add Redis backplane for horizontal scaling:- **React Flow** - Diagram rendering and interaction```

4. **Relay**: Server broadcasts update to all other clients in the room

5. **Apply**: Each client applies the update to their local Yjs document

6. **Reconcile**: Yjs automatically merges concurrent changes

7. **React Update**: UI updates reflect the merged state```csharp- **Yjs** - CRDT for conflict-free collaboration



### Persistencebuilder.Services.AddSignalR()



The save mechanism captures complete document state:    .AddStackExchangeRedis("redis-connection-string");- **y-websocket** - WebSocket provider for Yjs2. Install dependencies:



1. User clicks "Save" button```

2. Client calls `Y.encodeStateAsUpdate(doc)` to get full snapshot

3. Binary state sent to server via `SaveFullState`- **Zustand** - Local state management```bash

4. Server stores in SQLite database

5. New clients joining the room receive persisted state via `LoadPersistedState`## License



## Project Structure- **Vite** - Build tool and dev servernpm install



```MIT

CollaborativeEditor/

├── Backend/```

│   ├── Controllers/       

│   │   └── RoomsController.cs### Backend

│   ├── Data/

│   │   └── ApplicationDbContext.cs- **Node.js WebSocket Server** - Simple message relay (dumb pipe)3. Start the development server:

│   ├── Hubs/

│   │   └── YjsHub.cs- No database required - all state is distributed across clients```bash

│   ├── Migrations/

│   ├── Models/npm run dev

│   │   └── RoomState.cs

│   ├── Services/## Quick Start```

│   │   └── RoomStateService.cs

│   └── Program.cs

│

├── Frontend/### PrerequisitesThe frontend will be available at `http://localhost:3000`

│   └── src/

│       ├── components/- Node.js 18+ and npm

│       │   ├── Canvas.tsx

│       │   ├── CollaborativeCanvas.tsx- Modern browser with WebSocket support### Backend Setup

│       │   ├── CustomNodes.tsx

│       │   ├── Header.tsx

│       │   ├── Menu.tsx

│       │   ├── PropertiesPanel.tsx### Installation1. Navigate to the Backend directory:

│       │   ├── Sidebar.tsx

│       │   └── Toolbar.tsx```bash

│       ├── providers/

│       │   └── SignalRProvider.ts1. Clone the repository:cd Backend

│       ├── store/

│       │   └── collaborativeStore.ts```bash```

│       ├── types/

│       │   └── index.tsgit clone <repository-url>

│       └── App.tsx

│cd CollaborativeEditor2. Restore dependencies:

└── start.sh

`````````bash



## API Endpointsdotnet restore



### SignalR Hub Methods2. Install frontend dependencies:```

- `JoinRoom(roomName)` - Join a collaboration room

- `LeaveRoom(roomName)` - Leave a room```bash

- `SyncMessage(roomName, message)` - Broadcast Yjs update

- `SaveFullState(roomName, stateBase64)` - Save document snapshotcd Frontend3. Run the server:

- `AwarenessUpdate(roomName, data)` - Broadcast cursor/selection

npm install```bash

### REST API

- `GET /api/rooms` - List all rooms```dotnet run

- `GET /api/rooms/{name}` - Get room details

- `DELETE /api/rooms/{name}` - Delete a room```

- `POST /api/rooms/cleanup?daysOld=30` - Delete old rooms

3. Start the application:

## Development

```bashThe backend will be available at `http://localhost:5000`

### Building

```bashcd ..

cd Backend

dotnet buildchmod +x start.sh### Running the Full Application



cd ../Frontend./start.sh

npm run build

``````#### Option 1: Using the Start Script (Recommended)



### Database MigrationsFrom the project root:

```bash

cd BackendThis will start:```bash

dotnet ef migrations add MigrationName

dotnet ef database update- Yjs WebSocket server on `ws://localhost:1234`./start.sh

```

- Frontend dev server on `http://localhost:3000````

## License



MIT

### Manual Start#### Option 2: Manual Start

## Author



Aleksandr Starzhynskyi

If you prefer to start services manually:1. Start the backend server (Terminal 1):

```bash

```bashcd Backend

# Terminal 1 - Start Yjs WebSocket Serverdotnet run

cd Backend```

node YjsServer.js

2. Start the frontend (Terminal 2):

# Terminal 2 - Start Frontend```bash

cd Frontendcd Frontend

npm run devnpm run dev

``````



## Usage3. Open your browser to `http://localhost:3000`



1. Open http://localhost:3000 in your browser## Usage

2. Enter your name and room name

3. Click "Join Room"1. **Enter your name** in the header

4. Start drawing!2. **Select a tool** from the toolbar (Rectangle, Circle, Line, Text)

5. Open the same room in multiple browser windows to see real-time collaboration3. **Draw on the canvas** by clicking and dragging

4. **Select shapes** using the select tool to edit properties

### Keyboard Shortcuts5. **See other users** in the sidebar when they connect

6. **Collaborate in real-time** - all changes are synchronized instantly

- `V` - Select tool

- `R` - Rectangle tool## Project Architecture

- `C` - Circle tool

- `T` - Text toolSee [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical documentation.

- `Delete/Backspace` - Delete selected node

## Project Structure

### Drawing

```

1. Select a tool from the toolbarCollaborativeEditor/

2. Click on the canvas to create shapes├── Frontend/                   # React + TypeScript frontend

3. Drag shapes to reposition them│   ├── src/

4. Connect shapes by dragging from one handle to another│   │   ├── components/        # React components

5. Select shapes to see editing indicators│   │   │   ├── Canvas.tsx     # Main drawing canvas

│   │   │   ├── Header.tsx     # App header with user info

## Project Structure│   │   │   ├── Toolbar.tsx    # Drawing tools toolbar

│   │   │   ├── Sidebar.tsx    # Users and layers sidebar

```│   │   │   └── PropertiesPanel.tsx  # Shape properties editor

CollaborativeEditor/│   │   ├── hooks/            # Custom React hooks

├── Frontend/                 # React + TypeScript client│   │   │   └── useWebSocket.ts  # SignalR connection hook

│   ├── src/│   │   ├── types/            # TypeScript type definitions

│   │   ├── components/│   │   │   └── index.ts      # Shared types

│   │   │   ├── CollaborativeCanvas.tsx    # Main canvas with React Flow│   │   ├── App.tsx           # Main application component

│   │   │   ├── CollaborativeCanvas.css│   │   ├── App.css           # Application styles

│   │   │   └── CustomNodes.tsx             # Custom node types│   │   ├── main.tsx          # Application entry point

│   │   ├── hooks/│   │   └── index.css         # Global styles

│   │   │   └── useYjsSync.ts               # Yjs synchronization hook│   ├── index.html            # HTML entry point

│   │   ├── store/│   ├── package.json          # NPM dependencies

│   │   │   └── collaborativeStore.ts       # Yjs document + Zustand store│   ├── tsconfig.json         # TypeScript configuration

│   │   ├── App.tsx                          # Main app with room joining│   ├── vite.config.ts        # Vite configuration

│   │   └── App.css│   └── README.md             # Frontend documentation

│   ├── package.json├── Backend/                   # .NET + SignalR backend

│   └── vite.config.ts│   ├── Hubs/

├── Backend/│   │   └── DiagramHub.cs     # SignalR hub

│   └── YjsServer.js          # Simple WebSocket relay server│   ├── Properties/

├── start.sh                   # Convenience script to start all services│   │   └── launchSettings.json

└── README.md│   ├── Program.cs            # Application entry point

```│   ├── Backend.csproj        # Project file

│   ├── appsettings.json      # Configuration

## How It Works│   └── README.md             # Backend documentation

├── start.sh                  # Convenience start script

### CRDT (Conflict-free Replicated Data Type)├── README.md                 # This file

├── QUICKSTART.md             # Quick start guide

The application uses Yjs, which implements CRDTs for distributed data synchronization:└── ARCHITECTURE.md           # Architecture documentation

```

1. **Each client** maintains a local copy of the document

2. **Changes** are represented as operations (not final states)## Technologies

3. **Operations** are commutative - they can be applied in any order

4. **Conflicts** are automatically resolved using CRDT algorithms- **Frontend**: React 18, TypeScript, Vite

5. **Eventually consistent** - all clients converge to the same state- **Real-time**: WebSocket

- **Backend**: .NET 8.0 (to be implemented)

### Data Flow- **Canvas**: HTML5 Canvas API



```## License

User Action → Local Yjs Doc Update → Broadcast to WebSocket

                    ↓MIT

              Local UI Update (instant feedback)
                    ↓
WebSocket Relay → Other Clients → Their Yjs Docs → Their UIs
```

### Why "Dumb Pipe"?

The WebSocket server (`YjsServer.js`) is intentionally simple:
- No authentication logic
- No business rules
- No state management
- No conflict resolution
- Just relays binary messages between clients

This makes it:
- **Scalable**: Can handle thousands of connections
- **Simple**: ~60 lines of code
- **Reliable**: No complex logic to fail
- **Fast**: Minimal processing overhead

## Advantages Over Traditional Architecture

### Traditional (SignalR/Socket.io with Server State)
- ❌ Server must maintain document state
- ❌ Server must handle conflict resolution
- ❌ Complex synchronization logic
- ❌ Single point of failure
- ❌ Difficult to scale horizontally

### CRDT + Dumb Pipe
- ✅ No server-side state
- ✅ Automatic conflict resolution
- ✅ Simple synchronization
- ✅ Highly scalable
- ✅ Works offline

## Extending the Application

### Adding New Node Types

1. Create a new React component in `CustomNodes.tsx`
2. Register it in `nodeTypes` in `CollaborativeCanvas.tsx`
3. Add a tool button in the toolbar

### Adding Persistence

Since there's no server-side database, you can add persistence by:
1. Using Yjs persistence providers (y-indexeddb for local, y-leveldb for server)
2. Periodically saving the Yjs document to a database
3. Loading the document when users join a room

### Scaling

The WebSocket server can be easily scaled:
1. Use a load balancer to distribute connections
2. Use Redis pub/sub for cross-server message relay
3. Deploy multiple instances behind the same domain

## Troubleshooting

### Connection Issues

If the frontend can't connect to the WebSocket server:
- Check that YjsServer.js is running on port 1234
- Check browser console for errors
- Ensure no firewall is blocking WebSocket connections

### Sync Issues

If changes aren't syncing between clients:
- Check that both clients are in the same room
- Verify WebSocket connection in browser dev tools
- Check YjsServer.js logs for errors

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
