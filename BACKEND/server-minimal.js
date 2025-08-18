const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Immediate health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SSEC Outing Management API is running',
    health: '/health'
  });
});

// Basic API endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is working'
  });
});

// Start server immediately
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
  console.log('✅ Server is ready to accept connections');
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});
