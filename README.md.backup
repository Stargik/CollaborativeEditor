# Collaborative Diagram Editor

A real-time collaborative diagram editor built with React + TypeScript frontend and .NET backend with SignalR.

## Features

- **Drawing Tools**: Rectangle, Circle, Line, and Text
- **Real-time Collaboration**: Multiple users can edit simultaneously via SignalR
- **Object Manipulation**: Select, move, and edit shapes
- **Properties Panel**: Edit shape properties (position, size, colors, etc.)
- **Layer Management**: View and select shapes from the layers panel
- **User Presence**: See who is currently editing
- **Modern UI**: Built with React and TypeScript
- **Automatic Reconnection**: Handles connection drops gracefully

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- .NET 8.0 SDK

### Frontend Setup

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Restore dependencies:
```bash
dotnet restore
```

3. Run the server:
```bash
dotnet run
```

The backend will be available at `http://localhost:5000`

### Running the Full Application

#### Option 1: Using the Start Script (Recommended)
From the project root:
```bash
./start.sh
```

#### Option 2: Manual Start

1. Start the backend server (Terminal 1):
```bash
cd Backend
dotnet run
```

2. Start the frontend (Terminal 2):
```bash
cd Frontend
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Usage

1. **Enter your name** in the header
2. **Select a tool** from the toolbar (Rectangle, Circle, Line, Text)
3. **Draw on the canvas** by clicking and dragging
4. **Select shapes** using the select tool to edit properties
5. **See other users** in the sidebar when they connect
6. **Collaborate in real-time** - all changes are synchronized instantly

## Project Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical documentation.

## Project Structure

```
CollaborativeEditor/
├── Frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Canvas.tsx     # Main drawing canvas
│   │   │   ├── Header.tsx     # App header with user info
│   │   │   ├── Toolbar.tsx    # Drawing tools toolbar
│   │   │   ├── Sidebar.tsx    # Users and layers sidebar
│   │   │   └── PropertiesPanel.tsx  # Shape properties editor
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useWebSocket.ts  # SignalR connection hook
│   │   ├── types/            # TypeScript type definitions
│   │   │   └── index.ts      # Shared types
│   │   ├── App.tsx           # Main application component
│   │   ├── App.css           # Application styles
│   │   ├── main.tsx          # Application entry point
│   │   └── index.css         # Global styles
│   ├── index.html            # HTML entry point
│   ├── package.json          # NPM dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   ├── vite.config.ts        # Vite configuration
│   └── README.md             # Frontend documentation
├── Backend/                   # .NET + SignalR backend
│   ├── Hubs/
│   │   └── DiagramHub.cs     # SignalR hub
│   ├── Properties/
│   │   └── launchSettings.json
│   ├── Program.cs            # Application entry point
│   ├── Backend.csproj        # Project file
│   ├── appsettings.json      # Configuration
│   └── README.md             # Backend documentation
├── start.sh                  # Convenience start script
├── README.md                 # This file
├── QUICKSTART.md             # Quick start guide
└── ARCHITECTURE.md           # Architecture documentation
```

## Technologies

- **Frontend**: React 18, TypeScript, Vite
- **Real-time**: WebSocket
- **Backend**: .NET 8.0 (to be implemented)
- **Canvas**: HTML5 Canvas API

## License

MIT
