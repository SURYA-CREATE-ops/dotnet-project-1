#!/bin/bash

# JobFlow Backend Startup Script
# Ensures database is always operational and server starts reliably

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Starting JobFlow Backend..."
echo ""

# Kill any existing backend process
echo "📋 Cleaning up previous processes..."
pkill -f "dotnet run.*JobFlow.API" || true
sleep 1

# Ensure database directory exists
echo "📁 Ensuring database directory exists..."
mkdir -p JobFlow.API

# Optional: Remove old database to start fresh (uncomment if needed)
# rm -f JobFlow.API/JobFlow.db

echo "🔨 Building solution..."
dotnet build JobFlow.API/JobFlow.API.csproj -q

echo "✅ Build successful!"
echo ""
echo "🌐 Starting API server on http://localhost:5220..."
echo "📊 Swagger UI: http://localhost:5220/swagger"
echo ""

# Start the backend
dotnet run --project JobFlow.API/JobFlow.API.csproj --urls http://localhost:5220
