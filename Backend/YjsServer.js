#!/usr/bin/env node

/**
 * Simple WebSocket server for Yjs synchronization
 * This provides a "dumb pipe" for CRDT collaboration
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.YJS_PORT || 1234;

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Yjs WebSocket Server\n');
});

const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

const rooms = new Map();

wss.on('connection', (ws, request) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const roomName = url.pathname.slice(1);
  
  console.log(`New connection to room: ${roomName}`);
  
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  
  const room = rooms.get(roomName);
  room.add(ws);
  
  ws.on('message', (message) => {
    // Broadcast to all clients in the same room except sender
    room.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  
  ws.on('close', () => {
    room.delete(ws);
    if (room.size === 0) {
      rooms.delete(roomName);
    }
    console.log(`Connection closed from room: ${roomName}`);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(PORT, () => {
  console.log(`Yjs WebSocket server running on ws://localhost:${PORT}`);
  console.log('This is a "dumb pipe" - all CRDT logic is handled client-side');
});
