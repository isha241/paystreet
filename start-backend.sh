#!/bin/bash

# Startup script for PayStreet Backend
echo "🚀 Starting PayStreet Backend..."

# Change to backend directory
cd backend

# Check if we're in the right directory
echo "Current directory: $(pwd)"
echo "Contents: $(ls -la)"

# Check if index.js exists
if [ -f "index.js" ]; then
    echo "✅ Found index.js"
else
    echo "❌ index.js not found"
    exit 1
fi

# Check if dist/server.js exists
if [ -f "dist/server.js" ]; then
    echo "✅ Found compiled server"
else
    echo "❌ Compiled server not found"
    exit 1
fi

# Start the server
echo "🚀 Starting server..."
node index.js
