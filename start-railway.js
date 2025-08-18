const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Railway deployment...');

try {
  // Step 1: Build the frontend
  console.log('📦 Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed');

  // Step 2: Verify build
  const distPath = path.join(__dirname, 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(distPath)) {
    throw new Error('dist directory not found after build');
  }
  
  if (!fs.existsSync(indexPath)) {
    throw new Error('index.html not found in dist directory');
  }
  
  console.log('✅ Build verification passed');
  console.log(`📁 Dist directory: ${distPath}`);
  console.log(`📄 Index file: ${indexPath}`);

  // Step 3: Start the server
  console.log('🌐 Starting server...');
  require('./BACKEND/server.js');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
