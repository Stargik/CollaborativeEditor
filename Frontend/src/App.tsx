import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { Toolbar } from './components/Toolbar'
import { Canvas } from './components/Canvas'
import { Sidebar } from './components/Sidebar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { useWebSocket } from './hooks/useWebSocket'
import { Shape, Tool, User } from './types'
import './App.css'

function App() {
  const [currentTool, setCurrentTool] = useState<Tool>('select')
  const [fillColor, setFillColor] = useState('#3498db')
  const [strokeColor, setStrokeColor] = useState('#2c3e50')
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null)
  const [username, setUsername] = useState('User')
  const [users, setUsers] = useState<Map<string, User>>(new Map())

  const { isConnected, sendMessage, userId } = useWebSocket({
    onMessage: useCallback((data: any) => {
      switch (data.action) {
        case 'add':
          setShapes((prev) => {
            if (prev.find((s) => s.id === data.shape.id)) {
              return prev
            }
            return [...prev, data.shape]
          })
          break
        case 'update':
          setShapes((prev) =>
            prev.map((s) => (s.id === data.shape.id ? { ...s, ...data.shape } : s))
          )
          break
        case 'delete':
          setShapes((prev) => prev.filter((s) => s.id !== data.shape.id))
          setSelectedShape(null)
          break
        case 'clear':
          setShapes([])
          setSelectedShape(null)
          break
        case 'sync':
          setShapes(data.shapes || [])
          setUsers(new Map(Object.entries(data.users || {})))
          break
        case 'user_update':
          setUsers((prev) => {
            const newUsers = new Map(prev)
            newUsers.set(data.userId, { id: data.userId, name: data.username })
            return newUsers
          })
          break
        case 'user_left':
          setUsers((prev) => {
            const newUsers = new Map(prev)
            newUsers.delete(data.userId)
            return newUsers
          })
          break
      }
    }, []),
    username,
  })

  const handleAddShape = useCallback((shape: Shape) => {
    setShapes((prev) => [...prev, shape])
    sendMessage({
      action: 'add',
      shape,
      userId,
      username,
      timestamp: Date.now(),
    })
  }, [sendMessage, userId, username])

  const handleUpdateShape = useCallback((shape: Shape) => {
    setShapes((prev) => prev.map((s) => (s.id === shape.id ? shape : s)))
    sendMessage({
      action: 'update',
      shape,
      userId,
      username,
      timestamp: Date.now(),
    })
  }, [sendMessage, userId, username])

  const handleDeleteShape = useCallback(() => {
    if (selectedShape) {
      setShapes((prev) => prev.filter((s) => s.id !== selectedShape.id))
      sendMessage({
        action: 'delete',
        shape: selectedShape,
        userId,
        username,
        timestamp: Date.now(),
      })
      setSelectedShape(null)
    }
  }, [selectedShape, sendMessage, userId, username])

  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all shapes?')) {
      setShapes([])
      setSelectedShape(null)
      sendMessage({
        action: 'clear',
        userId,
        username,
        timestamp: Date.now(),
      })
    }
  }, [sendMessage, userId, username])

  const handleUsernameChange = useCallback((newUsername: string) => {
    setUsername(newUsername)
    sendMessage({
      action: 'user_update',
      userId,
      username: newUsername,
      timestamp: Date.now(),
    })
  }, [sendMessage, userId])

  return (
    <div className="app-container">
      <Header
        username={username}
        onUsernameChange={handleUsernameChange}
        isConnected={isConnected}
      />
      <Toolbar
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        fillColor={fillColor}
        strokeColor={strokeColor}
        onFillColorChange={setFillColor}
        onStrokeColorChange={setStrokeColor}
        onDelete={handleDeleteShape}
        onClear={handleClearAll}
      />
      <div className="main-content">
        <Sidebar
          users={users}
          currentUserId={userId}
          currentUsername={username}
          shapes={shapes}
          selectedShape={selectedShape}
          onShapeSelect={setSelectedShape}
        />
        <Canvas
          currentTool={currentTool}
          fillColor={fillColor}
          strokeColor={strokeColor}
          shapes={shapes}
          selectedShape={selectedShape}
          userId={userId}
          onAddShape={handleAddShape}
          onUpdateShape={handleUpdateShape}
          onSelectShape={setSelectedShape}
        />
        <PropertiesPanel
          selectedShape={selectedShape}
          onUpdateShape={handleUpdateShape}
        />
      </div>
    </div>
  )
}

export default App
