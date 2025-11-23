import * as Y from 'yjs';
import { create } from 'zustand';
import { SignalRProvider } from '../providers/SignalRProvider';

// Yjs document for CRDT-based collaboration
export const ydoc = new Y.Doc();

// Maps for shared state
export const yNodes = ydoc.getMap('nodes');
export const yEdges = ydoc.getMap('edges');
export const yUsers = ydoc.getMap('users');
export const yAwareness = ydoc.getMap('awareness');

// SignalR provider for sync
let provider: SignalRProvider | null = null;

export const initProvider = (roomName: string, signalRUrl: string) => {
  if (provider) {
    provider.destroy();
  }
  
  provider = new SignalRProvider(signalRUrl, roomName, ydoc);

  // Set up awareness for cursor/selection tracking
  provider.awareness.setLocalStateField('user', {
    name: localStorage.getItem('username') || 'Anonymous',
    color: getRandomColor(),
    cursor: null,
  });

  return provider;
};

export const getProvider = () => provider;

// Helper function to generate random color for users
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Zustand store for local UI state
interface CollaborativeState {
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  currentTool: 'select' | 'rectangle' | 'circle' | 'line' | 'text';
  setCurrentTool: (tool: 'select' | 'rectangle' | 'circle' | 'line' | 'text') => void;
  fillColor: string;
  setFillColor: (color: string) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
}

export const useCollaborativeStore = create<CollaborativeState>((set) => ({
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  isDrawing: false,
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),
  currentTool: 'select',
  setCurrentTool: (tool) => set({ currentTool: tool }),
  fillColor: '#3498db',
  setFillColor: (color) => set({ fillColor: color }),
  strokeColor: '#2c3e50',
  setStrokeColor: (color) => set({ strokeColor: color }),
}));
