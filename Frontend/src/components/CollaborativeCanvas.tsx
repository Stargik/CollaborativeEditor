import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RectangleNode, CircleNode, TextNode } from './CustomNodes';
import { useYjsSync } from '../hooks/useYjsSync';
import { useCollaborativeStore, getProvider } from '../store/collaborativeStore';
import './CollaborativeCanvas.css';

const nodeTypes = {
  rectangle: RectangleNode,
  circle: CircleNode,
  text: TextNode,
};

function CollaborativeCanvasInner() {
  const { 
    nodes, 
    edges, 
    remoteUsers,
    onNodesChange, 
    onEdgesChange, 
    addNode,
    addEdge,
    deleteNode,
    updateNode,
  } = useYjsSync();
  
  const {
    currentTool,
    setCurrentTool,
    fillColor,
    strokeColor,
    selectedNodeId,
    setSelectedNodeId,
  } = useCollaborativeStore();

  const reactFlowInstance = useReactFlow();

  // Handle text change in nodes
  const handleTextChange = useCallback((nodeId: string, text: string) => {
    updateNode(nodeId, { data: { text } });
  }, [updateNode]);

  // Handle canvas click for drawing
  const onPaneClick = useCallback((event: any) => {
    if (currentTool === 'select') {
      setSelectedNodeId(null);
      return;
    }

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    let nodeId: string;
    
    switch (currentTool) {
      case 'rectangle':
        nodeId = addNode({
          type: 'rectangle',
          position,
          data: {
            width: 120,
            height: 80,
            fillColor,
            strokeColor,
            text: '',
          },
        });
        setSelectedNodeId(nodeId);
        break;
        
      case 'circle':
        nodeId = addNode({
          type: 'circle',
          position,
          data: {
            width: 100,
            fillColor,
            strokeColor,
            text: '',
          },
        });
        setSelectedNodeId(nodeId);
        break;
        
      case 'text':
        nodeId = addNode({
          type: 'text',
          position,
          data: {
            text: 'Double click to edit',
            strokeColor,
          },
        });
        setSelectedNodeId(nodeId);
        break;
    }
  }, [currentTool, fillColor, strokeColor, addNode, setSelectedNodeId, reactFlowInstance]);

  // Handle node selection
  const onNodeClick = useCallback((event: any, node: any) => {
    event.stopPropagation();
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  // Handle connection between nodes
  const onConnect = useCallback((params: any) => {
    addEdge({
      source: params.source,
      target: params.target,
      type: 'smoothstep',
      animated: true,
      style: { stroke: strokeColor, strokeWidth: 2 },
    });
  }, [addEdge, strokeColor]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected nodes (single or multiple)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          selectedNodes.forEach((node) => deleteNode(node.id));
          setSelectedNodeId(null);
        } else if (selectedNodeId) {
          deleteNode(selectedNodeId);
          setSelectedNodeId(null);
        }
      }
      
      // Tool shortcuts
      if (e.key === 'v') setCurrentTool('select');
      if (e.key === 'r') setCurrentTool('rectangle');
      if (e.key === 'c') setCurrentTool('circle');
      if (e.key === 't') setCurrentTool('text');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, selectedNodeId, deleteNode, setSelectedNodeId, setCurrentTool]);

  // Display remote cursors
  const remoteCursors = Array.from(remoteUsers.entries())
    .filter(([clientId]) => clientId !== getProvider()?.awareness.clientID)
    .map(([clientId, state]: [number, any]) => {
      if (!state.user || !state.user.cursor) return null;
      
      // Convert flow coordinates back to screen coordinates for display
      const screenPosition = reactFlowInstance.flowToScreenPosition({
        x: state.user.cursor.x,
        y: state.user.cursor.y,
      });
      
      return (
        <div
          key={clientId}
          className="remote-cursor"
          style={{
            position: 'absolute',
            left: screenPosition.x,
            top: screenPosition.y,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={state.user.color}
            style={{ transform: 'translate(-2px, -2px)' }}
          >
            <path d="M5 3L19 12L12 13L9 19L5 3Z" />
          </svg>
          <span
            style={{
              backgroundColor: state.user.color,
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 600,
              marginLeft: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            {state.user.name}
          </span>
        </div>
      );
    });

  // Track mouse movement for cursor sharing
  const onMouseMove = useCallback((event: any) => {
    const provider = getProvider();
    if (provider) {
      // Convert screen coordinates to flow coordinates for consistent cursor position
      const flowPosition = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      provider.awareness.setLocalStateField('user', {
        ...provider.awareness.getLocalState()?.user,
        cursor: flowPosition,
      });
    }
  }, [reactFlowInstance]);

  // Add onTextChange callback to all nodes
  const nodesWithCallbacks = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onTextChange: handleTextChange,
    },
  }));

  return (
    <div style={{ width: '100%', height: '100vh' }} onMouseMove={onMouseMove}>
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        selectNodesOnDrag={currentTool === 'select'}
        selectionOnDrag={currentTool === 'select'}
        panOnDrag={currentTool === 'select' ? [1, 2] : true}
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        
        <Panel position="top-left" className="tools-panel">
          <div className="tool-buttons">
            <button
              className={`tool-btn ${currentTool === 'select' ? 'active' : ''}`}
              onClick={() => setCurrentTool('select')}
              title="Select (V)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
              </svg>
            </button>
            
            <button
              className={`tool-btn ${currentTool === 'rectangle' ? 'active' : ''}`}
              onClick={() => setCurrentTool('rectangle')}
              title="Rectangle (R)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" />
              </svg>
            </button>
            
            <button
              className={`tool-btn ${currentTool === 'circle' ? 'active' : ''}`}
              onClick={() => setCurrentTool('circle')}
              title="Circle (C)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
              </svg>
            </button>
            
            <button
              className={`tool-btn ${currentTool === 'text' ? 'active' : ''}`}
              onClick={() => setCurrentTool('text')}
              title="Text (T)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <text x="12" y="18" textAnchor="middle" fontSize="18">T</text>
              </svg>
            </button>
            
            <div style={{ width: '100%', height: '1px', backgroundColor: '#ddd', margin: '8px 0' }} />
            
            <button
              className="tool-btn delete-btn"
              onClick={() => {
                const selectedNodes = nodes.filter((node) => node.selected);
                if (selectedNodes.length > 0) {
                  selectedNodes.forEach((node) => deleteNode(node.id));
                  setSelectedNodeId(null);
                } else if (selectedNodeId) {
                  deleteNode(selectedNodeId);
                  setSelectedNodeId(null);
                }
              }}
              disabled={!selectedNodeId && !nodes.some((node) => node.selected)}
              title="Delete selected (Delete/Backspace)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
          
          <div className="color-pickers">
            <label>
              Fill:
              <input
                type="color"
                value={fillColor}
                onChange={(e) => useCollaborativeStore.getState().setFillColor(e.target.value)}
              />
            </label>
            <label>
              Stroke:
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => useCollaborativeStore.getState().setStrokeColor(e.target.value)}
              />
            </label>
          </div>
        </Panel>
        
        <Panel position="top-right" className="users-panel">
          <h3>Active Users</h3>
          <div className="user-list">
            {Array.from(remoteUsers.entries())
              .filter(([, state]: [number, any]) => state.user != null)
              .map(([clientId, state]: [number, any]) => (
                <div key={clientId} className="user-item">
                  <div
                    className="user-indicator"
                    style={{ backgroundColor: state.user?.color || '#ccc' }}
                  />
                  <span>{state.user?.name || 'Anonymous'}</span>
                </div>
              ))}
          </div>
        </Panel>
      </ReactFlow>
      
      {remoteCursors}
    </div>
  );
}

export function CollaborativeCanvas() {
  return (
    <ReactFlowProvider>
      <CollaborativeCanvasInner />
    </ReactFlowProvider>
  );
}
