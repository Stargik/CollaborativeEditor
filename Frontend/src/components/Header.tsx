import React from 'react'
import './Header.css'

interface HeaderProps {
  username: string
  onUsernameChange: (username: string) => void
  isConnected: boolean
}

export const Header: React.FC<HeaderProps> = ({ username, onUsernameChange, isConnected }) => {
  return (
    <header className="header">
      <h1>Collaborative Diagram Editor</h1>
      <div className="header-controls">
        <div className="user-info">
          <label htmlFor="username">Your Name:</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value || 'User')}
          />
        </div>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : ''}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </header>
  )
}
