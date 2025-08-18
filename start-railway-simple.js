const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Railway deployment...');
console.log(`📡 Environment PORT: ${process.env.PORT || 'not set (using 3001)'}`);
console.log(`🔧 Node Environment: ${process.env.NODE_ENV || 'development'}`);

// Check if dist directory exists (should be built by Railway)
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
  console.log('✅ Frontend build found');
  console.log(`📁 Dist directory: ${distPath}`);
  console.log(`📄 Index file: ${indexPath}`);
} else {
  console.warn('⚠️ Frontend build not found, creating minimal version...');
  // Create minimal frontend if not found
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  const minimalHtml = `<!DOCTYPE html>
<html>
<head>
  <title>SSEC Outing Management - Loading</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      margin: 0; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .loading {
      text-align: center;
      padding: 2rem;
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }
    .spinner {
      border: 4px solid rgba(255,255,255,0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <h2>SSEC Outing Management</h2>
    <p>Starting up, please wait...</p>
    <script>
      setTimeout(() => window.location.reload(), 5000);
    </script>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(indexPath, minimalHtml);
  console.log('✅ Minimal frontend created');
}

// Start the server
console.log('🌐 Starting server...');
console.log('📝 Command: node BACKEND/server.js');

// Use node instead of bun for better compatibility
const serverProcess = spawn('node', ['BACKEND/server.js'], {
  stdio: 'inherit',
  detached: false,
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production'
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

// Keep the process alive
setInterval(() => {
  // Keep alive for Railway
}, 10000);
