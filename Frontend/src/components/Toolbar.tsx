import React from 'react'
import { Tool } from '../types'
import './Toolbar.css'

interface ToolbarProps {
  currentTool: Tool
  onToolChange: (tool: Tool) => void
  fillColor: string
  strokeColor: string
  onFillColorChange: (color: string) => void
  onStrokeColorChange: (color: string) => void
  onDelete: () => void
  onClear: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  fillColor,
  strokeColor,
  onFillColorChange,
  onStrokeColorChange,
  onDelete,
  onClear,
}) => {
  return (
    <div className="toolbar">
      <button
        className={`tool-btn ${currentTool === 'select' ? 'active' : ''}`}
        onClick={() => onToolChange('select')}
        title="Select"
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="currentColor" />
        </svg>
      </button>
      <button
        className={`tool-btn ${currentTool === 'rectangle' ? 'active' : ''}`}
        onClick={() => onToolChange('rectangle')}
        title="Rectangle"
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <button
        className={`tool-btn ${currentTool === 'circle' ? 'active' : ''}`}
        onClick={() => onToolChange('circle')}
        title="Circle"
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <button
        className={`tool-btn ${currentTool === 'line' ? 'active' : ''}`}
        onClick={() => onToolChange('line')}
        title="Line"
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <button
        className={`tool-btn ${currentTool === 'text' ? 'active' : ''}`}
        onClick={() => onToolChange('text')}
        title="Text"
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <text x="12" y="18" textAnchor="middle" fontSize="18" fill="currentColor">
            T
          </text>
        </svg>
      </button>

      <div className="separator" />

      <div className="color-picker-container">
        <label htmlFor="fillColor">Fill:</label>
        <input
          type="color"
          id="fillColor"
          value={fillColor}
          onChange={(e) => onFillColorChange(e.target.value)}
        />
      </div>
      <div className="color-picker-container">
        <label htmlFor="strokeColor">Stroke:</label>
        <input
          type="color"
          id="strokeColor"
          value={strokeColor}
          onChange={(e) => onStrokeColorChange(e.target.value)}
        />
      </div>

      <div className="separator" />

      <button className="tool-btn danger" onClick={onDelete} title="Delete Selected">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
            fill="currentColor"
          />
        </svg>
      </button>
      <button className="tool-btn danger" onClick={onClear} title="Clear All">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  )
}
