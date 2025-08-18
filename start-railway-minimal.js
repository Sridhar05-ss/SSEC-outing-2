const { spawn } = require('child_process');

console.log('🚀 Starting Railway deployment (minimal mode)...');
console.log(`📡 Environment PORT: ${process.env.PORT || 'not set (using 3001)'}`);
console.log(`🔧 Node Environment: ${process.env.NODE_ENV || 'development'}`);

// Start the server directly with minimal overhead
console.log('🌐 Starting server directly...');

const serverProcess = spawn('node', ['BACKEND/server-minimal.js'], {
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
