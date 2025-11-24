import { useEffect, useState } from 'react';
import './App.css';
import { CollaborativeCanvas } from './components/CollaborativeCanvas.tsx';
import { initProvider, useCollaborativeStore } from './store/collaborativeStore';

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Anonymous');
  const [roomName, setRoomName] = useState('default-room');
  const [connected, setConnected] = useState(false);
  
  const setProvider = useCollaborativeStore((state) => state.setProvider);
  const setStoreRoomName = useCollaborativeStore((state) => state.setRoomName);

  useEffect(() => {
    if (connected) {
      // Use SignalR hub URL instead of WebSocket
      const provider = initProvider(roomName, 'http://localhost:5078/yjsHub');
      
      // Store in Zustand for access in Menu and other components
      setProvider(provider);
      setStoreRoomName(roomName);
      
      provider.on('status', (event: any) => {
        console.log('SignalR status:', event.status);
      });

      // Cleanup on page unload/close
      const handleBeforeUnload = () => {
        provider.destroy();
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        provider.destroy();
        setProvider(null);
      };
    }
  }, [connected, roomName, setProvider, setStoreRoomName]);

  useEffect(() => {
    localStorage.setItem('username', username);
  }, [username]);

  if (!connected) {
    return (
      <div className="connection-screen">
        <div className="connection-dialog">
          <h1>Collaborative Diagram Editor</h1>
          <p>Real-time collaboration with CRDT (Yjs) and React Flow</p>
          
          <div className="form-group">
            <label htmlFor="username">Your Name:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="room">Room Name:</label>
            <input
              id="room"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
            />
          </div>
          
          <button
            className="connect-btn"
            onClick={() => setConnected(true)}
            disabled={!username.trim() || !roomName.trim()}
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <CollaborativeCanvas />
    </div>
  );
}

export default App;
