import React, { useState, useEffect } from 'react';
import './Menu.css';
import { useCollaborativeStore } from '../store/collaborativeStore';

interface Room {
  id: string;
  stateSize: number;
  lastModified: string;
  metadata?: string;
}

interface SaveStatus {
  message: string;
  type: 'success' | 'error';
  timestamp: number;
}

export const Menu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showRooms, setShowRooms] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  
  const provider = useCollaborativeStore((state) => state.provider);
  const roomName = useCollaborativeStore((state) => state.roomName);

  useEffect(() => {
    if (showRooms) {
      loadRooms();
    }
  }, [showRooms]);

  useEffect(() => {

    if (provider?.connection) {
      provider.connection.on('SaveCompleted', (data: any) => {
        setIsSaving(false);
        if (data.success) {
          setSaveStatus({
            message: 'Saved successfully!',
            type: 'success',
            timestamp: Date.now()
          });
        } else {
          setSaveStatus({
            message: `Save failed: ${data.error || 'Unknown error'}`,
            type: 'error',
            timestamp: Date.now()
          });
        }
        

        setTimeout(() => setSaveStatus(null), 3000);
      });

      return () => {
        provider.connection.off('SaveCompleted');
      };
    }
  }, [provider]);

  const loadRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const response = await fetch('http://localhost:5078/api/rooms');
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      setSaveStatus({
        message: 'Failed to load rooms',
        type: 'error',
        timestamp: Date.now()
      });
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleSave = async () => {
    if (!provider?.connection || isSaving || !roomName) return;
    
    setIsSaving(true);
    try {

      const fullState = provider.getFullState();
      
      if (!fullState || fullState.length === 0) {
        throw new Error('No state to save');
      }
      

      const base64State = btoa(String.fromCharCode(...fullState));
      await provider.connection.invoke('SaveFullState', roomName, base64State);
    } catch (error) {
      setIsSaving(false);
      setSaveStatus({
        message: 'Save failed!',
        type: 'error',
        timestamp: Date.now()
      });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm(`Are you sure you want to delete room "${roomId}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5078/api/rooms/${encodeURIComponent(roomId)}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSaveStatus({
          message: `Room "${roomId}" deleted`,
          type: 'success',
          timestamp: Date.now()
        });
        setTimeout(() => setSaveStatus(null), 3000);
        loadRooms();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      setSaveStatus({
        message: 'Delete failed!',
        type: 'error',
        timestamp: Date.now()
      });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Delete all rooms older than 30 days?\n\nThis action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5078/api/rooms/cleanup?daysOld=30', {
        method: 'POST'
      });
      const data = await response.json();
      
      setSaveStatus({
        message: data.message || `Cleaned up ${data.deleted} old rooms`,
        type: 'success',
        timestamp: Date.now()
      });
      setTimeout(() => setSaveStatus(null), 3000);
      if (showRooms) {
        loadRooms();
      }
    } catch (error) {
      setSaveStatus({
        message: 'Cleanup failed!',
        type: 'error',
        timestamp: Date.now()
      });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <>
      <div className="menu-container">
        <button 
          className={`menu-button save-button ${isSaving ? 'saving' : ''}`}
          onClick={handleSave}
          disabled={isSaving || !provider || !roomName}
          title="Save current state to database (Ctrl+S)"
        >
          {isSaving ? (
            <>
              <span className="loading-spinner"></span>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span className="menu-item-icon">💾</span>
              <span>Save</span>
            </>
          )}
        </button>
        
        <button 
          className="menu-button"
          onClick={() => setIsOpen(!isOpen)}
          title="Open menu"
        >
          <span className="menu-item-icon">☰</span>
          <span>Menu</span>
        </button>

        {isOpen && (
          <div className="menu-dropdown">
            <div className="menu-dropdown-header">
              <span>Menu</span>
              <button className="menu-close-btn" onClick={() => setIsOpen(false)} title="Close">
                ✕
              </button>
            </div>
            
            <div className="menu-content">
              <div className="menu-section">
                <div 
                  className="menu-item"
                  onClick={() => {
                    setShowRooms(!showRooms);
                    if (!showRooms) loadRooms();
                  }}
                >
                  <span className="menu-item-icon">📁</span>
                  <div className="menu-item-content">
                    <div className="menu-item-title">Manage Rooms</div>
                    <div className="menu-item-subtitle">View and delete saved rooms</div>
                  </div>
                </div>

                {showRooms && (
                  <>
                    <div className="room-list-header">
                      <span>Saved Rooms ({rooms.length})</span>
                      <button 
                        className="room-list-refresh" 
                        onClick={loadRooms}
                        disabled={isLoadingRooms}
                        title="Refresh"
                      >
                        {isLoadingRooms ? '⟳' : '↻'}
                      </button>
                    </div>
                    <div className="room-list">
                      {rooms.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-state-icon">📂</div>
                          <div>No saved rooms yet</div>
                        </div>
                      ) : (
                        rooms.map((room) => (
                          <div key={room.id} className="room-item">
                            <div className="room-info">
                              <div className={`room-name ${room.id === roomName ? 'current' : ''}`}>
                                {room.id}
                                {room.id === roomName && ' (current)'}
                              </div>
                              <div className="room-meta">
                                <span>{formatSize(room.stateSize)}</span>
                                <span>•</span>
                                <span>{formatDate(room.lastModified)}</span>
                              </div>
                            </div>
                            <div className="room-actions">
                              {room.id !== roomName && (
                                <button
                                  className="room-delete-btn"
                                  onClick={() => handleDeleteRoom(room.id)}
                                  title="Delete this room"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="menu-section">
                <div 
                  className="menu-item danger"
                  onClick={handleCleanup}
                >
                  <span className="menu-item-icon">🗑️</span>
                  <div className="menu-item-content">
                    <div className="menu-item-title">Cleanup Old Rooms</div>
                    <div className="menu-item-subtitle">Delete rooms older than 30 days</div>
                  </div>
                </div>
              </div>

              <div className="menu-section">
                <div className="menu-item">
                  <span className="menu-item-icon">ℹ️</span>
                  <div className="menu-item-content">
                    <div className="menu-item-title">Current Room</div>
                    <div className="menu-item-subtitle">{roomName || 'Not connected'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {saveStatus && (
        <div className={`save-status ${saveStatus.type}`}>
          <span className="save-status-icon">
            {saveStatus.type === 'success' ? '✓' : '✗'}
          </span>
          <span className="save-status-message">{saveStatus.message}</span>
        </div>
      )}
    </>
  );
};
