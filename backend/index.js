// Entry point for Render deployment
// This file imports the compiled TypeScript server

try {
  // Import the compiled server
  const server = require('./dist/server.js');
  console.log('✅ Server imported successfully');
} catch (error) {
  console.error('❌ Failed to import server:', error);
  process.exit(1);
}
