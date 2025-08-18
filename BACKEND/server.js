const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const router = require('./routes');
const cors = require('cors');

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

app.use('/api', router);

// Serve static files from the React build directory
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`✅ Static files directory found: ${distPath}`);
} else {
  console.warn(`⚠️ Static files directory not found: ${distPath}`);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is running...',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    distExists: fs.existsSync(distPath)
  });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      error: 'Frontend not built',
      message: 'Please run npm run build first',
      distExists: fs.existsSync(distPath),
      indexPath: indexPath
    });
  }
});

const PORT = process.env.PORT || 3001; // Use Railway's PORT or default to 3001

// Add error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, '../dist')}`);
  console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend available at: http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop');
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});
