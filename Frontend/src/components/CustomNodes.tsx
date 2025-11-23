import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const RectangleNode = memo(({ data, selected, id }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onTextChange) {
      data.onTextChange(id, text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      if (data.onTextChange) {
        data.onTextChange(id, text);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setText(data.text || '');
      setIsEditing(false);
    }
  };

  return (
    <div
      style={{
        width: data.width || 100,
        height: data.height || 80,
        backgroundColor: data.fillColor || '#3498db',
        border: `2px solid ${data.strokeColor || '#2c3e50'}`,
        borderRadius: '4px',
        position: 'relative',
        boxShadow: selected ? '0 0 0 2px #1a73e8' : 'none',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid #fff',
            borderRadius: '3px',
            padding: '4px 8px',
            fontSize: '14px',
            fontWeight: 500,
            textAlign: 'center',
            outline: 'none',
            width: '80%',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            textAlign: 'center',
            cursor: 'text',
            userSelect: 'none',
            width: '80%',
          }}
        >
          {data.text || 'Double click to edit'}
        </div>
      )}
    </div>
  );
});

RectangleNode.displayName = 'RectangleNode';

export const CircleNode = memo(({ data, selected, id }: NodeProps) => {
  const size = data.width || 100;
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onTextChange) {
      data.onTextChange(id, text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      if (data.onTextChange) {
        data.onTextChange(id, text);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setText(data.text || '');
      setIsEditing(false);
    }
  };
  
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: data.fillColor || '#3498db',
        border: `2px solid ${data.strokeColor || '#2c3e50'}`,
        borderRadius: '50%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: selected ? '0 0 0 2px #1a73e8' : 'none',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            color: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid #fff',
            borderRadius: '3px',
            padding: '4px 8px',
            fontSize: '14px',
            fontWeight: 500,
            textAlign: 'center',
            outline: 'none',
            width: '80%',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          style={{
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            textAlign: 'center',
            cursor: 'text',
            userSelect: 'none',
            padding: '8px',
          }}
        >
          {data.text || 'Double click to edit'}
        </div>
      )}
    </div>
  );
});

CircleNode.displayName = 'CircleNode';

export const TextNode = memo(({ data, selected, id }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onTextChange) {
      data.onTextChange(id, text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      if (data.onTextChange) {
        data.onTextChange(id, text);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setText(data.text || '');
      setIsEditing(false);
    }
  };

  return (
    <div
      style={{
        padding: '8px 12px',
        backgroundColor: 'transparent',
        color: data.strokeColor || '#2c3e50',
        fontSize: '16px',
        fontWeight: 500,
        position: 'relative',
        minWidth: '50px',
        border: selected ? '2px dashed #1a73e8' : '2px dashed transparent',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            color: data.strokeColor || '#2c3e50',
            backgroundColor: 'transparent',
            border: '1px solid #1a73e8',
            borderRadius: '3px',
            padding: '4px 8px',
            fontSize: '16px',
            fontWeight: 500,
            outline: 'none',
            minWidth: '100px',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span style={{ cursor: 'text' }}>
          {data.text || 'Double click to edit'}
        </span>
      )}
    </div>
  );
});

TextNode.displayName = 'TextNode';
