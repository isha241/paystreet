// Entry point for Render deployment
// This file imports the compiled TypeScript server

try {
  // Import the compiled server
  const server = require('./dist/server.js');
  console.log('✅ Server imported successfully');
  
  // The server should automatically start when imported
  // since server.ts has app.listen() at the bottom
  console.log('🚀 PayStreet Backend starting...');
} catch (error) {
  console.error('❌ Failed to import server:', error);
  process.exit(1);
}
