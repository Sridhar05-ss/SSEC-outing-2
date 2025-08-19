import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Enable CORS for frontend requests
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:4173', 
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:3000', 
    'http://127.0.0.1:4173',
    'http://192.168.1.2:5173',
    'http://192.168.1.2:3000',
    'http://192.168.1.2:4173',
    // Railway domains
    'https://ssec-outing-2-production.up.railway.app',
    'https://ssec-outing-2.up.railway.app',
    // Allow all Railway subdomains
    /^https:\/\/.*\.up\.railway\.app$/,
    // Allow all Railway custom domains
    /^https:\/\/.*\.railway\.app$/
  ],
  credentials: true
}));

app.use(express.json());

// Basic API endpoints (without complex backend routes for now)
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is working (basic mode)',
    timestamp: new Date().toISOString(),
    services: {
      zkteco: false,
      easytime: false,
      firebase: false
    }
  });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello from backend ✅" });
});

// Serve static files from the React build directory
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`✅ Static files directory found: ${distPath}`);
} else {
  console.warn(`⚠️ Static files directory not found: ${distPath}`);
}

const PORT = process.env.PORT || 3000; // Use Railway's PORT or default to 3000

// Health check endpoint (responds immediately)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    distExists: fs.existsSync(distPath),
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
            <p>Frontend is being built, please wait...</p>
            <p><small>This may take a few minutes on first deployment</small></p>
            <script>
              // Auto-refresh every 10 seconds
              setTimeout(() => window.location.reload(), 10000);
            </script>
          </div>
        </body>
      </html>
    `);
  }
});

// Add error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server with better logging
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${distPath}`);
  console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend available at: http://localhost:${PORT}/`);
  console.log('✅ Server is ready to accept connections');
  console.log('Press Ctrl+C to stop');
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});
