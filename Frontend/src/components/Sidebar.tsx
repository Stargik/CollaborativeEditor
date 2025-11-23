import React from 'react'
import { Shape, User } from '../types'
import './Sidebar.css'

interface SidebarProps {
  users: Map<string, User>
  currentUserId: string
  currentUsername: string
  shapes: Shape[]
  selectedShape: Shape | null
  onShapeSelect: (shape: Shape) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  users,
  currentUserId,
  currentUsername,
  shapes,
  selectedShape,
  onShapeSelect,
}) => {
  const getUserColor = (userId: string): string => {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <aside className="sidebar">
      <section>
        <h3>Active Users</h3>
        <ul className="user-list">
          <li>
            <span className="user-indicator" style={{ backgroundColor: '#667eea' }} />
            {currentUsername} (You)
          </li>
          {Array.from(users.entries()).map(([userId, user]) => {
            if (userId !== currentUserId) {
              return (
                <li key={userId}>
                  <span className="user-indicator" style={{ backgroundColor: getUserColor(userId) }} />
                  {user.name}
                </li>
              )
            }
            return null
          })}
        </ul>
      </section>

      <section>
        <h3>Layers</h3>
        <ul className="layer-list">
          {shapes.map((shape, index) => (
            <li
              key={shape.id}
              className={`layer-item ${selectedShape?.id === shape.id ? 'selected' : ''}`}
              onClick={() => onShapeSelect(shape)}
            >
              {shape.type} {index + 1}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
