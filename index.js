// Entry point for Render deployment
// This file is in the project root so Render can find it

const path = require('path');

try {
  // Change to backend directory
  process.chdir(path.join(__dirname, 'backend'));
  
  // Import the compiled server (now we're in backend directory)
  const server = require('./dist/server.js');
  console.log('✅ Server imported successfully');
  console.log('🚀 PayStreet Backend starting...');
  
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
