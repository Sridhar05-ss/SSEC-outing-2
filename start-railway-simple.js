const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Railway deployment (simple mode)...');

// Create pre-build frontend immediately
console.log('📦 Creating pre-build frontend...');
require('./pre-build.js');

// Start the server immediately
console.log('🌐 Starting server...');
const serverProcess = spawn('node', ['BACKEND/server.js'], {
  stdio: 'inherit',
  detached: false,
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 3001
  }
});

// Handle server process
serverProcess.on('close', (code) => {
  console.log(`🌐 Server process exited with code ${code}`);
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});
