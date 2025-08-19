const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Enable CORS for all origins (Railway requirement)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// CRITICAL: Health check endpoint FIRST (before any middleware)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Root endpoint for Railway healthcheck
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SSEC Outing Management API is running',
    health: '/health'
  });
});

// Basic API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is working (basic mode)',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the React build directory
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`✅ Static files directory found: ${distPath}`);
} else {
  console.warn(`⚠️ Static files directory not found: ${distPath}`);
}

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Show a loading page while frontend is building
    res.status(200).send(`
      <!DOCTYPE html>
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
      </html>
    `);
  }
});

// Start server immediately for Railway health check
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🌐 Root endpoint available at: http://localhost:${PORT}/`);
  console.log('🚀 Server is ready to accept connections');
  console.log('✅ Health check should work immediately');
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else if (err.code === 'EACCES') {
    console.error(`❌ Permission denied to bind to port ${PORT}`);
    process.exit(1);
  } else {
    console.error('❌ Unknown server error:', err.message);
    process.exit(1);
  }
});

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
