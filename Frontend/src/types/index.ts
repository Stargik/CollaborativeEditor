export type Tool = 'select' | 'rectangle' | 'circle' | 'line' | 'text'

export interface Shape {
  id: string
  type: Tool
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  endX?: number
  endY?: number
  text?: string
  fontSize?: number
  fillColor: string
  strokeColor: string
  userId: string
}

export interface User {
  id: string
  name: string
}

export interface WebSocketMessage {
  action: 'add' | 'update' | 'delete' | 'clear' | 'sync' | 'user_update' | 'user_left'
  shape?: Shape
  shapes?: Shape[]
  users?: Record<string, User>
  userId: string
  username: string
  timestamp: number
}
