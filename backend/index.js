// Entry point for Render deployment
// This file starts the compiled TypeScript server

const path = require('path');
const serverPath = path.join(__dirname, 'dist', 'server.js');

try {
  require(serverPath);
} catch (error) {
  console.error('Failed to load compiled server:', error);
  console.error('Make sure to run "npm run build" first');
  process.exit(1);
}
