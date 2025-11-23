import React, { useRef, useEffect, useState } from 'react'
import { Shape, Tool } from '../types'
import './Canvas.css'

interface CanvasProps {
  currentTool: Tool
  fillColor: string
  strokeColor: string
  shapes: Shape[]
  selectedShape: Shape | null
  userId: string
  onAddShape: (shape: Shape) => void
  onUpdateShape: (shape: Shape) => void
  onSelectShape: (shape: Shape | null) => void
}

export const Canvas: React.FC<CanvasProps> = ({
  currentTool,
  fillColor,
  strokeColor,
  shapes,
  selectedShape,
  userId,
  onAddShape,
  onUpdateShape,
  onSelectShape,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [currentShape, setCurrentShape] = useState<Shape | null>(null)

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current
      const canvas = canvasRef.current
      if (container && canvas) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Render shapes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all shapes
    shapes.forEach((shape) => {
      drawShape(ctx, shape, shape === selectedShape)
    })

    // Draw current shape being created
    if (currentShape) {
      drawShape(ctx, currentShape, false)
    }
  }, [shapes, selectedShape, currentShape])

  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape, isSelected: boolean) => {
    ctx.fillStyle = shape.fillColor
    ctx.strokeStyle = shape.strokeColor
    ctx.lineWidth = isSelected ? 3 : 2

    switch (shape.type) {
      case 'rectangle':
        if (shape.width !== undefined && shape.height !== undefined) {
          ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
        }
        break
      case 'circle':
        if (shape.radius !== undefined) {
          ctx.beginPath()
          ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()
        }
        break
      case 'line':
        if (shape.endX !== undefined && shape.endY !== undefined) {
          ctx.beginPath()
          ctx.moveTo(shape.x, shape.y)
          ctx.lineTo(shape.endX, shape.endY)
          ctx.stroke()
        }
        break
      case 'text':
        if (shape.text) {
          ctx.font = `${shape.fontSize || 16}px Arial`
          ctx.fillStyle = shape.fillColor
          ctx.fillText(shape.text, shape.x, shape.y)
        }
        break
    }

    // Draw selection handles
    if (isSelected) {
      drawSelectionHandles(ctx, shape)
    }
  }

  const drawSelectionHandles = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.fillStyle = '#667eea'
    const handleSize = 6

    switch (shape.type) {
      case 'rectangle':
        if (shape.width !== undefined && shape.height !== undefined) {
          const corners = [
            [shape.x, shape.y],
            [shape.x + shape.width, shape.y],
            [shape.x, shape.y + shape.height],
            [shape.x + shape.width, shape.y + shape.height],
          ]
          corners.forEach(([x, y]) => {
            ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize)
          })
        }
        break
      case 'circle':
        if (shape.radius !== undefined) {
          ctx.fillRect(
            shape.x + shape.radius - handleSize / 2,
            shape.y - handleSize / 2,
            handleSize,
            handleSize
          )
          ctx.fillRect(
            shape.x - shape.radius - handleSize / 2,
            shape.y - handleSize / 2,
            handleSize,
            handleSize
          )
          ctx.fillRect(
            shape.x - handleSize / 2,
            shape.y + shape.radius - handleSize / 2,
            handleSize,
            handleSize
          )
          ctx.fillRect(
            shape.x - handleSize / 2,
            shape.y - shape.radius - handleSize / 2,
            handleSize,
            handleSize
          )
        }
        break
      case 'line':
        if (shape.endX !== undefined && shape.endY !== undefined) {
          ctx.fillRect(shape.x - handleSize / 2, shape.y - handleSize / 2, handleSize, handleSize)
          ctx.fillRect(
            shape.endX - handleSize / 2,
            shape.endY - handleSize / 2,
            handleSize,
            handleSize
          )
        }
        break
    }
  }

  const getShapeAtPoint = (x: number, y: number): Shape | null => {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i]
      if (isPointInShape(x, y, shape)) {
        return shape
      }
    }
    return null
  }

  const isPointInShape = (x: number, y: number, shape: Shape): boolean => {
    switch (shape.type) {
      case 'rectangle':
        if (shape.width !== undefined && shape.height !== undefined) {
          const minX = Math.min(shape.x, shape.x + shape.width)
          const maxX = Math.max(shape.x, shape.x + shape.width)
          const minY = Math.min(shape.y, shape.y + shape.height)
          const maxY = Math.max(shape.y, shape.y + shape.height)
          return x >= minX && x <= maxX && y >= minY && y <= maxY
        }
        return false
      case 'circle':
        if (shape.radius !== undefined) {
          const dx = x - shape.x
          const dy = y - shape.y
          return Math.sqrt(dx * dx + dy * dy) <= shape.radius
        }
        return false
      case 'line':
        if (shape.endX !== undefined && shape.endY !== undefined) {
          const dist = distanceToLine(x, y, shape.x, shape.y, shape.endX, shape.endY)
          return dist < 10
        }
        return false
      case 'text':
        if (shape.text) {
          const canvas = canvasRef.current
          const ctx = canvas?.getContext('2d')
          if (ctx) {
            ctx.font = `${shape.fontSize || 16}px Arial`
            const textWidth = ctx.measureText(shape.text).width
            return x >= shape.x && x <= shape.x + textWidth && y >= shape.y - 20 && y <= shape.y + 10
          }
        }
        return false
      default:
        return false
    }
  }

  const distanceToLine = (
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number => {
    const A = x - x1
    const B = y - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) param = dot / lenSq

    let xx, yy

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = x - xx
    const dy = y - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  const generateShapeId = () => {
    return 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (currentTool === 'select') {
      const shape = getShapeAtPoint(x, y)
      if (shape) {
        onSelectShape(shape)
        setIsDragging(true)
        setDragOffset({ x: x - shape.x, y: y - shape.y })
      } else {
        onSelectShape(null)
      }
    } else {
      setIsDrawing(true)
      const newShape: Shape = {
        id: generateShapeId(),
        type: currentTool,
        x,
        y,
        width: 0,
        height: 0,
        radius: 0,
        endX: x,
        endY: y,
        fillColor,
        strokeColor,
        userId,
      }
      setCurrentShape(newShape)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDragging && selectedShape) {
      const updatedShape = {
        ...selectedShape,
        x: x - dragOffset.x,
        y: y - dragOffset.y,
      }
      onUpdateShape(updatedShape)
    } else if (isDrawing && currentShape) {
      const updatedShape = { ...currentShape }

      switch (currentShape.type) {
        case 'rectangle':
          updatedShape.width = x - currentShape.x
          updatedShape.height = y - currentShape.y
          break
        case 'circle':
          const dx = x - currentShape.x
          const dy = y - currentShape.y
          updatedShape.radius = Math.sqrt(dx * dx + dy * dy)
          break
        case 'line':
          updatedShape.endX = x
          updatedShape.endY = y
          break
      }

      setCurrentShape(updatedShape)
    }
  }

  const handleMouseUp = () => {
    if (isDrawing && currentShape) {
      onAddShape(currentShape)
      setCurrentShape(null)
      setIsDrawing(false)
    }

    if (isDragging) {
      setIsDragging(false)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'text') {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const text = window.prompt('Enter text:')
      if (text) {
        const shape: Shape = {
          id: generateShapeId(),
          type: 'text',
          x,
          y,
          text,
          fillColor: strokeColor,
          strokeColor,
          fontSize: 16,
          userId,
        }
        onAddShape(shape)
      }
    }
  }

  const cursor = currentTool === 'select' ? 'default' : 'crosshair'

  return (
    <div className="canvas-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ cursor }}
      />
    </div>
  )
}
