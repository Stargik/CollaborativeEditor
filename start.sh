#!/bin/bash

# Start .NET Backend with SignalR (CRDT sync)
echo "Starting .NET Backend with SignalR YjsHub..."
cd Backend
dotnet run &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend
echo "Starting Frontend..."
cd ../Frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "Application is running!"
echo "Backend:    http://localhost:5000"
echo "SignalR Hub: /yjsHub"
echo "Frontend:   http://localhost:3000"
echo "========================================="
echo ""
echo "Architecture: Thick Client, Dumb Pipe"
echo "- All CRDT logic handled client-side (Yjs)"
echo "- SignalR hub just relays binary messages"
echo "- .NET backend provides scalable relay"
echo "========================================="
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
