// Root entry point for Render deployment
// This file redirects to the backend server

const path = require('path');
const backendPath = path.join(__dirname, 'backend', 'dist', 'server.js');

try {
  console.log('🚀 Starting PayStreet Backend...');
  console.log('Backend path:', backendPath);
  console.log('Current working directory:', process.cwd());
  console.log('PORT environment variable:', process.env.PORT);
  
  // Check if the compiled server exists
  if (require('fs').existsSync(backendPath)) {
    console.log('✅ Found compiled server, starting...');
    
    // Set the working directory to backend so relative paths work
    process.chdir(path.join(__dirname, 'backend'));
    console.log('Changed working directory to:', process.cwd());
    
    // Import the compiled server
    require(backendPath);
  } else {
    console.error('❌ Compiled server not found at:', backendPath);
    console.error('Make sure to run "npm run build" in the backend directory first');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
