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
const PORT = process.env.PORT || 3000;

console.log(`🚀 Starting server on port ${PORT}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

// Setup static files FIRST (before any routes)
function setupStaticFiles() {
  const distPath = path.join(__dirname, '../dist');
  console.log(`🔍 Checking for static files at: ${distPath}`);
  
  if (fs.existsSync(distPath)) {
    const distContents = fs.readdirSync(distPath);
    console.log(`✅ Static files directory found: ${distPath}`);
    console.log(`📁 dist folder contents: ${distContents.join(', ')}`);
    
    // Serve static files from dist directory
    app.use(express.static(distPath));
    console.log('✅ Static file middleware configured');
    
    // Handle React routing - serve index.html for all routes EXCEPT /health and /api
    app.get('*', (req, res, next) => {
      // Skip for API routes and health check
      if (req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }
      
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log(`📄 Serving index.html for route: ${req.path}`);
        res.sendFile(indexPath);
      } else {
        console.warn(`⚠️ index.html not found at: ${indexPath}`);
        next();
      }
    });
  } else {
    console.warn(`⚠️ Static files directory not found: ${distPath}`);
    console.log('📁 Current directory contents:');
    try {
      const currentDir = fs.readdirSync(__dirname);
      currentDir.forEach(file => console.log(`  - ${file}`));
    } catch (error) {
      console.error('❌ Error reading current directory:', error.message);
    }
  }
}

// Setup static files immediately
setupStaticFiles();

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

// Root endpoint for Railway health check (responds immediately)
app.get('/', (req, res) => {
  // Check if we have static files, if not return JSON
  const distPath = path.join(__dirname, '../dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log(`📄 Serving index.html for root route`);
    res.sendFile(indexPath);
  } else {
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
  }
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
    try {
      const dotenv = require('dotenv');
      dotenv.config();
      console.log('✅ Environment variables loaded');
    } catch (error) {
      console.warn('⚠️ Environment variables not available:', error.message);
    }
    
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
       // Temporarily disable ZKTeco routes to prevent pathToRegexpError
       console.log('⚠️ ZKTeco routes temporarily disabled to prevent pathToRegexpError');
       global.zktecoLoaded = false;
     } catch (error) {
       console.warn('⚠️ ZKTeco service not available:', error.message);
       console.warn('⚠️ ZKTeco error details:', error.stack);
       global.zktecoLoaded = false;
     }
     
     // Load EasyTime routes (if available)
     try {
       // Temporarily disable EasyTime routes to prevent pathToRegexpError
       console.log('⚠️ EasyTime routes temporarily disabled to prevent pathToRegexpError');
       global.easytimeLoaded = false;
     } catch (error) {
       console.warn('⚠️ EasyTime service not available:', error.message);
       console.warn('⚠️ EasyTime error details:', error.stack);
       global.easytimeLoaded = false;
     }
    
              // Temporarily disable API routes to prevent pathToRegexpError
     console.log('⚠️ API routes temporarily disabled to prevent pathToRegexpError');
     // setupAPIRoutes();
    
    console.log('🎉 All external dependencies loaded successfully');
    
  } catch (error) {
    console.error('❌ Error loading external dependencies:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.log('⚠️ Server will continue running with basic functionality');
    
    // Still try to setup basic routes
    setupBasicRoutes();
  }
}

// Setup API routes with external dependencies
function setupAPIRoutes() {
  try {
    console.log('🔄 Loading API routes...');
    
    // Load routes with error handling
    let router;
    try {
      router = require('./routes');
    } catch (routeError) {
      console.error('❌ Error requiring routes:', routeError.message);
      console.error('❌ Route error stack:', routeError.stack);
      setupBasicRoutes();
      return;
    }
    
    // Check if router is valid
    if (!router || typeof router.use !== 'function') {
      console.error('❌ Invalid router object:', typeof router);
      setupBasicRoutes();
      return;
    }
    
    app.use('/api', router);
    console.log('✅ API routes loaded successfully');
    
  } catch (error) {
    console.error('❌ Error loading API routes:', error.message);
    console.error('❌ Error stack:', error.stack);
    setupBasicRoutes();
  }
}

// Setup basic routes as fallback
function setupBasicRoutes() {
  console.log('🔄 Setting up basic API routes...');
  
  // Basic API status endpoint
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
  
  console.log('✅ Basic API routes loaded');
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
  console.error('❌ Error stack:', err.stack);
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
