import * as Y from 'yjs';
import { create } from 'zustand';
import { SignalRProvider } from '../providers/SignalRProvider';


export const ydoc = new Y.Doc();


export const yNodes = ydoc.getMap('nodes');
export const yEdges = ydoc.getMap('edges');


let provider: SignalRProvider | null = null;

export const initProvider = (roomName: string, signalRUrl: string) => {
  if (provider) {
    provider.destroy();
  }
  
  provider = new SignalRProvider(signalRUrl, roomName, ydoc);


  provider.awareness.setLocalStateField('user', {
    name: localStorage.getItem('username') || 'Anonymous',
    color: getRandomColor(),
    cursor: null,
  });

  return provider;
};

export const getProvider = () => provider;


function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}


interface CollaborativeState {
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  currentTool: 'select' | 'rectangle' | 'circle' | 'text';
  setCurrentTool: (tool: 'select' | 'rectangle' | 'circle' | 'text') => void;
  fillColor: string;
  setFillColor: (color: string) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  provider: SignalRProvider | null;
  setProvider: (provider: SignalRProvider | null) => void;
  roomName: string;
  setRoomName: (name: string) => void;
}

export const useCollaborativeStore = create<CollaborativeState>((set) => ({
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  currentTool: 'select',
  setCurrentTool: (tool) => set({ currentTool: tool }),
  fillColor: '#3498db',
  setFillColor: (color) => set({ fillColor: color }),
  strokeColor: '#2c3e50',
  setStrokeColor: (color) => set({ strokeColor: color }),
  provider: null,
  setProvider: (provider) => set({ provider }),
  roomName: '',
  setRoomName: (name) => set({ roomName: name }),
}));
