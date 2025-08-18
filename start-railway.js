const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Railway deployment...');

// Detect available runtime
const isBun = process.versions.bun !== undefined;
const runtime = isBun ? 'bun' : 'node';
const packageManager = isBun ? 'bun' : 'npm';

console.log(`🔧 Detected runtime: ${runtime}`);
console.log(`📦 Using package manager: ${packageManager}`);

// Create pre-build frontend immediately
console.log('📦 Creating pre-build frontend...');
require('./pre-build.js');

// Start the server immediately with better error handling
console.log('🌐 Starting server immediately...');
const serverProcess = spawn(runtime, ['BACKEND/server.js'], {
  stdio: 'inherit',
  detached: false,
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 3001
  }
});

// Add server startup verification
let serverStarted = false;
const startupTimeout = setTimeout(() => {
  if (!serverStarted) {
    console.error('❌ Server failed to start within 30 seconds');
    process.exit(1);
  }
}, 30000);

// Monitor server output for startup confirmation
serverProcess.stdout?.on('data', (data) => {
  const output = data.toString();
  console.log(`🌐 Server: ${output.trim()}`);
  
  // Check if server has started successfully
  if (output.includes('Server running on port') || output.includes('🚀 Server running on port')) {
    serverStarted = true;
    clearTimeout(startupTimeout);
    console.log('✅ Server started successfully');
  }
});

serverProcess.stderr?.on('data', (data) => {
  const error = data.toString();
  console.error(`🌐 Server Error: ${error.trim()}`);
  
  // Don't exit on stderr as some servers log to stderr
  if (error.includes('EADDRINUSE') || error.includes('port already in use')) {
    console.error('❌ Port already in use');
    process.exit(1);
  }
});

// Build frontend in background (non-blocking)
console.log('📦 Building frontend in background...');
const buildProcess = spawn(packageManager, ['run', 'build'], {
  stdio: 'pipe',
  detached: false
});

buildProcess.stdout.on('data', (data) => {
  console.log(`📦 Build: ${data.toString().trim()}`);
});

buildProcess.stderr.on('data', (data) => {
  console.log(`📦 Build Error: ${data.toString().trim()}`);
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Frontend build completed successfully');
    
    // Verify build
    const distPath = path.join(__dirname, 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
      console.log('✅ Build verification passed');
      console.log(`📁 Dist directory: ${distPath}`);
      console.log(`📄 Index file: ${indexPath}`);
    } else {
      console.warn('⚠️ Build verification failed - dist files not found');
    }
  } else {
    console.error(`❌ Frontend build failed with code ${code}`);
    // Don't exit on build failure - server should still work
  }
});

// Handle server process
serverProcess.on('close', (code) => {
  console.log(`🌐 Server process exited with code ${code}`);
  clearTimeout(startupTimeout);
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  clearTimeout(startupTimeout);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  clearTimeout(startupTimeout);
  serverProcess.kill('SIGINT');
  buildProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down...');
  clearTimeout(startupTimeout);
  serverProcess.kill('SIGTERM');
  buildProcess.kill('SIGTERM');
  process.exit(0);
});
