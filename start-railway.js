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

// Start the server immediately
console.log('🌐 Starting server immediately...');
const serverProcess = spawn(runtime, ['BACKEND/server.js'], {
  stdio: 'inherit',
  detached: false
});

// Build frontend in background
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
  }
});

// Handle server process
serverProcess.on('close', (code) => {
  console.log(`🌐 Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  serverProcess.kill('SIGINT');
  buildProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down...');
  serverProcess.kill('SIGTERM');
  buildProcess.kill('SIGTERM');
  process.exit(0);
});
