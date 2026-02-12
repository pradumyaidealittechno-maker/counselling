#!/bin/bash

# HR Solution - Startup Script
# This script starts both frontend and backend servers

echo "🚀 Starting HR Solution Application..."
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Start backend server in background
echo "📡 Starting backend server on port 3001..."
cd server
npm run dev > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend server started successfully"
else
    echo "⚠️  Backend server may still be starting..."
fi

echo ""
echo "🌐 Starting frontend server on port 5175..."
npm run dev

# This will keep running until you press Ctrl+C
# When you do, it will also stop the backend

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

trap cleanup EXIT INT TERM
