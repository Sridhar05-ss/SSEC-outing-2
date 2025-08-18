const fs = require('fs');
const path = require('path');

console.log('🚀 Creating pre-build frontend...');

// Create dist directory if it doesn't exist
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Create a minimal index.html that will be replaced by the real build
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
    <p>Frontend is being built, please wait...</p>
    <p><small>This may take a few minutes on first deployment</small></p>
    <script>
      // Auto-refresh every 10 seconds
      setTimeout(() => window.location.reload(), 10000);
    </script>
  </div>
</body>
</html>`;

// Write the minimal HTML
const indexPath = path.join(distPath, 'index.html');
fs.writeFileSync(indexPath, minimalHtml);

console.log('✅ Pre-build frontend created');
console.log(`📁 Dist directory: ${distPath}`);
console.log(`📄 Index file: ${indexPath}`);
