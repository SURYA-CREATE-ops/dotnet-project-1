#!/bin/bash

# JobFlow Frontend Startup Script
# Ensures frontend dev server starts cleanly

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR/frontend"

echo "🚀 Starting JobFlow Frontend..."
echo ""

# Kill any existing frontend process
echo "📋 Cleaning up previous processes..."
pkill -f "npm run dev" || true
sleep 1

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🌐 Starting Vite dev server on http://localhost:5173..."
echo "⚠️  Press Ctrl+C to stop the server"
echo ""

npm run dev
