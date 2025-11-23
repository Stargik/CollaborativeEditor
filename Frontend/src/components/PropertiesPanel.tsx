import React from 'react'
import { Shape } from '../types'
import './PropertiesPanel.css'

interface PropertiesPanelProps {
  selectedShape: Shape | null
  onUpdateShape: (shape: Shape) => void
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedShape,
  onUpdateShape,
}) => {
  if (!selectedShape) {
    return (
      <aside className="properties-panel">
        <h3>Properties</h3>
        <p className="no-selection">Select an object to edit properties</p>
      </aside>
    )
  }

  const handlePropertyChange = (property: keyof Shape, value: any) => {
    onUpdateShape({
      ...selectedShape,
      [property]: value,
    })
  }

  return (
    <aside className="properties-panel">
      <h3>Properties</h3>
      <div className="properties-content">
        <div className="property-group">
          <label>Type:</label>
          <input type="text" value={selectedShape.type} readOnly />
        </div>

        <div className="property-group">
          <label>X Position:</label>
          <input
            type="number"
            value={Math.round(selectedShape.x)}
            onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value))}
          />
        </div>

        <div className="property-group">
          <label>Y Position:</label>
          <input
            type="number"
            value={Math.round(selectedShape.y)}
            onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value))}
          />
        </div>

        {selectedShape.type === 'rectangle' && (
          <>
            <div className="property-group">
              <label>Width:</label>
              <input
                type="number"
                value={Math.round(selectedShape.width || 0)}
                onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value))}
              />
            </div>
            <div className="property-group">
              <label>Height:</label>
              <input
                type="number"
                value={Math.round(selectedShape.height || 0)}
                onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value))}
              />
            </div>
          </>
        )}

        {selectedShape.type === 'circle' && (
          <div className="property-group">
            <label>Radius:</label>
            <input
              type="number"
              value={Math.round(selectedShape.radius || 0)}
              onChange={(e) => handlePropertyChange('radius', parseFloat(e.target.value))}
            />
          </div>
        )}

        {selectedShape.type === 'text' && (
          <>
            <div className="property-group">
              <label>Text:</label>
              <input
                type="text"
                value={selectedShape.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label>Font Size:</label>
              <input
                type="number"
                value={selectedShape.fontSize || 16}
                onChange={(e) => handlePropertyChange('fontSize', parseFloat(e.target.value))}
              />
            </div>
          </>
        )}

        <div className="property-group">
          <label>Fill Color:</label>
          <input
            type="color"
            value={selectedShape.fillColor}
            onChange={(e) => handlePropertyChange('fillColor', e.target.value)}
          />
        </div>

        {selectedShape.type !== 'text' && (
          <div className="property-group">
            <label>Stroke Color:</label>
            <input
              type="color"
              value={selectedShape.strokeColor}
              onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
            />
          </div>
        )}
      </div>
    </aside>
  )
}
