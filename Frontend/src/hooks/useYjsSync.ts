import { useEffect, useState, useCallback } from 'react';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import { yNodes, yEdges, getProvider } from '../store/collaborativeStore';

export const useYjsSync = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [remoteUsers, setRemoteUsers] = useState<Map<number, any>>(new Map());

  // Sync nodes from Yjs to React Flow
  useEffect(() => {
    const updateNodes = () => {
      const nodeArray: Node[] = [];
      yNodes.forEach((value: any, key: string) => {
        nodeArray.push({
          id: key,
          type: value.type,
          position: value.position,
          data: value.data,
        });
      });
      setNodes(nodeArray);
    };

    // Initial load
    updateNodes();

    // Listen for changes
    const observer = () => updateNodes();
    yNodes.observe(observer);

    return () => yNodes.unobserve(observer);
  }, []);

  // Sync edges from Yjs to React Flow
  useEffect(() => {
    const updateEdges = () => {
      const edgeArray: Edge[] = [];
      yEdges.forEach((value: any, key: string) => {
        edgeArray.push({
          id: key,
          source: value.source,
          target: value.target,
          type: value.type,
          animated: value.animated,
          style: value.style,
        });
      });
      setEdges(edgeArray);
    };

    // Initial load
    updateEdges();

    // Listen for changes
    const observer = () => updateEdges();
    yEdges.observe(observer);

    return () => yEdges.unobserve(observer);
  }, []);

  // Track remote users' cursors/selections
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const updateAwareness = () => {
      const states = provider.awareness.getStates();
      setRemoteUsers(new Map(states));
    };

    provider.awareness.on('change', updateAwareness);
    updateAwareness();

    return () => {
      provider.awareness.off('change', updateAwareness);
    };
  }, []);

  // Handle node changes
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds);
      
      // Sync changes to Yjs
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          // Sync position changes during dragging AND when drag ends
          const node = yNodes.get(change.id);
          if (node) {
            yNodes.set(change.id, {
              ...node,
              position: change.position,
            });
          }
        }
        
        if (change.type === 'remove') {
          // Delete node from Yjs - this will sync to other clients
          yNodes.delete(change.id);
          
          // Also delete connected edges
          const connectedEdges: string[] = [];
          yEdges.forEach((edge: any, edgeId: string) => {
            if (edge.source === change.id || edge.target === change.id) {
              connectedEdges.push(edgeId);
            }
          });
          connectedEdges.forEach((edgeId) => yEdges.delete(edgeId));
        }
      });
      
      return updatedNodes;
    });
  }, []);

  // Handle edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      const updatedEdges = applyEdgeChanges(changes, eds);
      
      changes.forEach((change) => {
        if (change.type === 'remove') {
          yEdges.delete(change.id);
        }
      });
      
      return updatedEdges;
    });
  }, []);

  // Add node
  const addNode = useCallback((node: Omit<Node, 'id'>) => {
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNode = {
      id,
      type: node.type,
      position: node.position,
      data: {
        ...node.data,
        createdBy: getProvider()?.awareness.clientID,
      },
    };
    
    yNodes.set(id, newNode);
    return id;
  }, []);

  // Update node
  const updateNode = useCallback((id: string, updates: Partial<Node>) => {
    const node: any = yNodes.get(id);
    if (node) {
      yNodes.set(id, {
        ...node,
        ...updates,
        data: {
          ...(node.data || {}),
          ...(updates.data || {}),
        },
      });
    }
  }, []);

  // Delete node
  const deleteNode = useCallback((id: string) => {
    yNodes.delete(id);
    
    // Also delete connected edges
    const connectedEdges: string[] = [];
    yEdges.forEach((edge: any, edgeId: string) => {
      if (edge.source === id || edge.target === id) {
        connectedEdges.push(edgeId);
      }
    });
    connectedEdges.forEach((edgeId) => yEdges.delete(edgeId));
  }, []);

  // Add edge
  const addEdge = useCallback((edge: Omit<Edge, 'id'>) => {
    const id = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newEdge = {
      id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'default',
      animated: edge.animated || false,
      style: edge.style || {},
    };
    
    yEdges.set(id, newEdge);
    return id;
  }, []);

  return {
    nodes,
    edges,
    remoteUsers,
    onNodesChange,
    onEdgesChange,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
  };
};
