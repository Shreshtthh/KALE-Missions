#!/bin/bash
set -e

echo "🎬 Setting up demo recording environment..."

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Start frontend development server
echo "🚀 Starting frontend development server..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 15

# Open browser tabs for demo
echo "🌐 Opening browser tabs for demo..."
if command -v google-chrome &> /dev/null; then
    google-chrome --new-window --user-data-dir=/tmp/admin-profile http://localhost:3000 &
    sleep 2
    google-chrome --new-window --user-data-dir=/tmp/alice-profile http://localhost:3000 &
    sleep 2
    google-chrome --new-window --user-data-dir=/tmp/bob-profile http://localhost:3000 &
elif command -v firefox &> /dev/null; then
    firefox -new-window http://localhost:3000 &
    sleep 2
    firefox -new-window http://localhost:3000 &
    sleep 2
    firefox -new-window http://localhost:3000 &
elif command -v open &> /dev/null; then
    # macOS
    open http://localhost:3000
    sleep 2
    open http://localhost:3000
    sleep 2
    open http://localhost:3000
else
    echo "⚠️  Please open http://localhost:3000 in multiple browser tabs manually"
fi

echo "✅ Demo environment ready!"
echo "📹 Start screen recording and follow the demo script"
echo "🛑 Press Ctrl+C to cleanup when done"

# Wait for user to finish demo
read -p "Press Enter when demo recording is complete..."

# Cleanup
echo "🧹 Cleaning up..."
kill $FRONTEND_PID 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

echo "🧹 Cleanup complete"
