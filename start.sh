#!/bin/bash

# Start Backend Server
echo "Starting Backend Server..."
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
echo "=================================="
echo "Application is running!"
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "=================================="
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
