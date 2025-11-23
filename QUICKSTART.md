# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

Frontend:
```bash
cd Frontend
npm install
cd ..
```

Backend:
```bash
cd Backend
dotnet restore
cd ..
```

### 2. Start the Application

**Automatic (Recommended):**
```bash
./start.sh
```

**Manual:**

Terminal 1 - Backend:
```bash
cd Backend
dotnet run
```

Terminal 2 - Frontend:
```bash
cd Frontend
npm run dev
```

### 3. Open Your Browser

Navigate to: **http://localhost:3000**

## ✨ Features

- 🎨 **Drawing Tools**: Rectangle, Circle, Line, Text
- 👥 **Real-time Collaboration**: See other users' changes instantly
- 🖱️ **Interactive**: Drag, resize, and edit shapes
- 🎨 **Customization**: Change colors and properties
- 📋 **Layers**: View and select shapes from the sidebar
- 👤 **User Presence**: See who's online

## 🎯 How to Use

1. **Enter your name** in the top-right corner
2. **Select a tool** from the toolbar
3. **Draw** by clicking and dragging on the canvas
4. **Edit shapes** by selecting them and using the properties panel
5. **Collaborate** by sharing the URL with others

## 🔧 Troubleshooting

### Frontend won't start
- Make sure port 3000 is available
- Run `npm install` in the Frontend directory
- Check that Node.js 18+ is installed: `node --version`

### Backend won't start
- Make sure port 5000 is available
- Check that .NET 8.0 SDK is installed: `dotnet --version`
- Run `dotnet restore` in the Backend directory

### Can't see other users
- Ensure both backend and frontend are running
- Check the browser console for connection errors
- Verify the backend URL in `Frontend/src/hooks/useWebSocket.ts` is correct

### Shapes not syncing
- Check that SignalR connection is established (green dot in header)
- Open browser console (F12) to check for errors
- Restart both backend and frontend

## 📚 More Information

- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Frontend Details**: See [Frontend/README.md](Frontend/README.md)
- **Backend Details**: See [Backend/README.md](Backend/README.md)
- **Main README**: See [README.md](README.md)

## 🛠️ Development

### Backend Changes
```bash
cd Backend
dotnet watch run  # Auto-reload on changes
```

### Frontend Changes
```bash
cd Frontend
npm run dev  # Already has hot-reload
```

### Build for Production

Frontend:
```bash
cd Frontend
npm run build
npm run preview
```

Backend:
```bash
cd Backend
dotnet publish -c Release
```

## 📝 Environment

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- SignalR Hub: http://localhost:5000/diagramHub

## 🤝 Contributing

This is a demonstration project. Key areas for enhancement:

1. **Persistence**: Add database storage
2. **Authentication**: Add user accounts
3. **Export/Import**: Save and load diagrams
4. **More Shapes**: Add arrows, polygons, etc.
5. **Undo/Redo**: Implement action history
6. **Mobile Support**: Optimize for touch devices

Enjoy building your collaborative diagrams! 🎉
