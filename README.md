# Collaborative Diagram Editor# Collaborative Diagram Editor# Collaborative Diagram Editor



A real-time collaborative diagram editor using **React Flow** + **Yjs (CRDT)** + **.NET SignalR** for enterprise-grade collaborative editing.



## Architecture: "Thick Client, Dumb Pipe" with .NET SignalRA real-time collaborative diagram editor built with **React Flow** + **Yjs** (CRDT) for truly conflict-free collaboration.A real-time collaborative diagram editor built with React + TypeScript frontend and .NET backend with SignalR.



- **Thick Client**: All CRDT logic runs in browser using Yjs

- **Dumb Pipe**: .NET SignalR hub acts as simple message relay

- **Enterprise Ready**: Built on .NET 8.0 with SignalR for production reliability## Architecture: "Thick Client, Dumb Pipe"## Features



## Features



- ✅ Real-time collaboration without conflicts (CRDT)This application follows the modern collaborative editing pattern:- **Drawing Tools**: Rectangle, Circle, Line, and Text

- ✅ Live cursors and user awareness

- ✅ React Flow diagram editor- **Thick Client**: All CRDT (Conflict-free Replicated Data Types) logic runs in the browser using Yjs- **Real-time Collaboration**: Multiple users can edit simultaneously via SignalR

- ✅ SignalR with automatic reconnection

- ✅ Room-based collaboration- **Dumb Pipe**: WebSocket server simply relays messages between clients without any business logic- **Object Manipulation**: Select, move, and edit shapes

- ✅ Offline support

- **No Server-Side State**: The server doesn't maintain document state, making it trivially scalable- **Properties Panel**: Edit shape properties (position, size, colors, etc.)

## Quick Start

- **Layer Management**: View and select shapes from the layers panel

```bash

# Install frontend dependencies## Features- **User Presence**: See who is currently editing

cd Frontend && npm install

- **Modern UI**: Built with React and TypeScript

# Start both servers

cd .. && chmod +x start.sh && ./start.sh- ✅ **Real-time Collaboration**: Multiple users can edit simultaneously without conflicts- **Automatic Reconnection**: Handles connection drops gracefully

```

- ✅ **CRDT-based Sync**: Uses Yjs for automatic conflict resolution

Visit http://localhost:3000

- ✅ **Live Cursors**: See other users' cursors in real-time## Getting Started

## Technology Stack

- ✅ **React Flow**: Professional diagram library with built-in features

**Frontend**: React 18, TypeScript, React Flow, Yjs, SignalR Client, Vite

**Backend**: .NET 8.0, ASP.NET Core, SignalR, C#- ✅ **Drawing Tools**: Rectangle, Circle, Text nodes with connections### Prerequisites



## Project Structure- ✅ **User Awareness**: See who's editing what in real-time



- `Backend/Hubs/YjsHub.cs` - SignalR hub (dumb pipe)- ✅ **Automatic Sync**: Changes propagate instantly with eventual consistency- Node.js 18+ and npm

- `Frontend/src/providers/SignalRProvider.ts` - Yjs ↔ SignalR bridge

- `Frontend/src/components/CollaborativeCanvas.tsx` - Main canvas- ✅ **Offline Support**: Continue editing offline, sync when reconnected- .NET 8.0 SDK

- `Frontend/src/hooks/useYjsSync.ts` - React Flow sync



## How It Works

## Technology Stack### Frontend Setup

1. **User edits** → Yjs updates locally (instant feedback)

2. **Yjs encodes** change as binary message

3. **SignalR relays** message to other clients in room

4. **Other clients** apply update automatically (CRDT merge)### Frontend1. Navigate to the Frontend directory:



The SignalR hub is just ~100 lines - it routes messages, no business logic!- **React 18** - UI library```bash



## Scaling- **TypeScript** - Type safetycd Frontend



Add Redis backplane for horizontal scaling:- **React Flow** - Diagram rendering and interaction```



```csharp- **Yjs** - CRDT for conflict-free collaboration

builder.Services.AddSignalR()

    .AddStackExchangeRedis("redis-connection-string");- **y-websocket** - WebSocket provider for Yjs2. Install dependencies:

```

- **Zustand** - Local state management```bash

## License

- **Vite** - Build tool and dev servernpm install

MIT

```

### Backend

- **Node.js WebSocket Server** - Simple message relay (dumb pipe)3. Start the development server:

- No database required - all state is distributed across clients```bash

npm run dev

## Quick Start```



### PrerequisitesThe frontend will be available at `http://localhost:3000`

- Node.js 18+ and npm

- Modern browser with WebSocket support### Backend Setup



### Installation1. Navigate to the Backend directory:

```bash

1. Clone the repository:cd Backend

```bash```

git clone <repository-url>

cd CollaborativeEditor2. Restore dependencies:

``````bash

dotnet restore

2. Install frontend dependencies:```

```bash

cd Frontend3. Run the server:

npm install```bash

```dotnet run

```

3. Start the application:

```bashThe backend will be available at `http://localhost:5000`

cd ..

chmod +x start.sh### Running the Full Application

./start.sh

```#### Option 1: Using the Start Script (Recommended)

From the project root:

This will start:```bash

- Yjs WebSocket server on `ws://localhost:1234`./start.sh

- Frontend dev server on `http://localhost:3000````



### Manual Start#### Option 2: Manual Start



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
