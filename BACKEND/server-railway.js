const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Enable CORS for all origins (Railway requirement)
app.use(cors({
  origin: true,
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Get PORT from Railway environment (CRITICAL for Railway)
const PORT = process.env.PORT || 3001;

console.log(`🚀 Starting server on port ${PORT}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

// CRITICAL: Root endpoint for Railway health check (responds immediately)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SSEC Outing Management API is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    services: {
      zkteco: global.zktecoLoaded || false,
      easytime: global.easytimeLoaded || false,
      firebase: global.firebaseLoaded || false
    }
  });
});

// Health check endpoint (Railway requirement)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    services: {
      zkteco: global.zktecoLoaded || false,
      easytime: global.easytimeLoaded || false,
      firebase: global.firebaseLoaded || false
    }
  });
});

// Start server immediately for Railway health check
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🌐 Root endpoint available at: http://localhost:${PORT}/`);
  console.log('🚀 Server is ready to accept connections');
  
  // Load external dependencies in background after server starts
  setTimeout(() => {
    loadExternalDependencies();
  }, 1000);
});

// Load external dependencies in background
async function loadExternalDependencies() {
  console.log('🔄 Loading external dependencies...');
  
  try {
    // Load dotenv configuration
    const dotenv = require('dotenv');
    dotenv.config();
    console.log('✅ Environment variables loaded');
    
    // Load Firebase (if available)
    try {
      const { syncToFirebase } = require('./sync');
      global.firebaseLoaded = true;
      console.log('✅ Firebase service loaded');
    } catch (error) {
      console.warn('⚠️ Firebase service not available:', error.message);
      global.firebaseLoaded = false;
    }
    
    // Load ZKTeco routes (if available)
    try {
      const zktecoRoutes = require('./routes/zktecoRoutes');
      global.zktecoLoaded = true;
      console.log('✅ ZKTeco service loaded');
    } catch (error) {
      console.warn('⚠️ ZKTeco service not available:', error.message);
      global.zktecoLoaded = false;
    }
    
    // Load EasyTime routes (if available)
    try {
      const easytimeRoutes = require('./routes/easytimeRoutes');
      global.easytimeLoaded = true;
      console.log('✅ EasyTime service loaded');
    } catch (error) {
      console.warn('⚠️ EasyTime service not available:', error.message);
      global.easytimeLoaded = false;
    }
    
    // Add API routes after dependencies are loaded
    setupAPIRoutes();
    
    // Serve static files if available
    setupStaticFiles();
    
    console.log('🎉 All external dependencies loaded successfully');
    
  } catch (error) {
    console.error('❌ Error loading external dependencies:', error.message);
    console.log('⚠️ Server will continue running with basic functionality');
  }
}

// Setup API routes with external dependencies
function setupAPIRoutes() {
  try {
    const router = require('./routes');
    app.use('/api', router);
    console.log('✅ API routes loaded');
  } catch (error) {
    console.warn('⚠️ API routes not available:', error.message);
    
    // Fallback API endpoints
    app.get('/api/status', (req, res) => {
      res.status(200).json({
        status: 'ok',
        message: 'API is working (basic mode)',
        timestamp: new Date().toISOString(),
        services: {
          zkteco: global.zktecoLoaded || false,
          easytime: global.easytimeLoaded || false,
          firebase: global.firebaseLoaded || false
        }
      });
    });
  }
}

// Setup static files serving
function setupStaticFiles() {
  const distPath = path.join(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log(`✅ Static files directory found: ${distPath}`);
    
    // Handle React routing
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).json({
          status: 'ok',
          message: 'SSEC Outing Management API',
          availableEndpoints: ['/', '/health', '/api/status'],
          timestamp: new Date().toISOString()
        });
      }
    });
  } else {
    console.warn(`⚠️ Static files directory not found: ${distPath}`);
    
    // Catch-all route for API-only mode
    app.get('*', (req, res) => {
      res.status(200).json({
        status: 'ok',
        message: 'SSEC Outing Management API (API-only mode)',
        availableEndpoints: ['/', '/health', '/api/status'],
        timestamp: new Date().toISOString()
      });
    });
  }
}

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

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => {
    console.log('✅ Server closed due to uncaught exception');
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    console.log('✅ Server closed due to unhandled rejection');
    process.exit(1);
  });
});
