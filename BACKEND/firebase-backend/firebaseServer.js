// Firebase Backend Server with Express
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Firebase services
const firebaseAuth = require('./firebaseAuth');
const firebaseRealtimeDB = require('./firebaseRealtimeDB');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Firebase Backend Server is running',
    timestamp: new Date().toISOString(),
    service: 'firebase-realtime-db'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SSEC Firebase Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      employees: '/api/employees',
      attendance: '/api/attendance',
      devices: '/api/devices',
      faceData: '/api/face-data'
    }
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  const result = await firebaseAuth.registerUser(email, password, displayName);
  res.json(result);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  const result = await firebaseAuth.loginUser(email, password);
  res.json(result);
});

app.post('/api/auth/logout', async (req, res) => {
  const result = await firebaseAuth.logoutUser();
  res.json(result);
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }

  const result = await firebaseAuth.resetPassword(email);
  res.json(result);
});

// Employee routes
app.post('/api/employees', async (req, res) => {
  const employeeData = req.body;
  
  if (!employeeData.email || !employeeData.name) {
    return res.status(400).json({
      success: false,
      error: 'Email and name are required'
    });
  }

  const result = await firebaseRealtimeDB.createEmployee(employeeData);
  res.json(result);
});

app.get('/api/employees', async (req, res) => {
  const result = await firebaseRealtimeDB.getAllEmployees();
  res.json(result);
});

app.get('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const result = await firebaseRealtimeDB.getEmployee(id);
  res.json(result);
});

app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const employeeData = req.body;
  
  const result = await firebaseRealtimeDB.updateEmployee(id, employeeData);
  res.json(result);
});

app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const result = await firebaseRealtimeDB.deleteEmployee(id);
  res.json(result);
});

// Attendance routes
app.post('/api/attendance', async (req, res) => {
  const attendanceData = req.body;
  
  if (!attendanceData.userId || !attendanceData.type) {
    return res.status(400).json({
      success: false,
      error: 'User ID and attendance type are required'
    });
  }

  const result = await firebaseRealtimeDB.logAttendance(attendanceData.userId, attendanceData);
  res.json(result);
});

app.get('/api/attendance', async (req, res) => {
  const result = await firebaseRealtimeDB.getAllAttendance();
  res.json(result);
});

app.get('/api/attendance/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const result = await firebaseRealtimeDB.getAttendanceLogs(userId);
  res.json(result);
});

app.get('/api/attendance/date/:date', async (req, res) => {
  const { date } = req.params;
  const result = await firebaseRealtimeDB.getAttendanceByDate(date);
  res.json(result);
});

// Device routes
app.post('/api/devices', async (req, res) => {
  const deviceData = req.body;
  
  if (!deviceData.serialNumber || !deviceData.name) {
    return res.status(400).json({
      success: false,
      error: 'Serial number and name are required'
    });
  }

  const result = await firebaseRealtimeDB.createDevice(deviceData);
  res.json(result);
});

app.get('/api/devices', async (req, res) => {
  const result = await firebaseRealtimeDB.getAllDevices();
  res.json(result);
});

app.get('/api/devices/:id', async (req, res) => {
  const { id } = req.params;
  const result = await firebaseRealtimeDB.getDevice(id);
  res.json(result);
});

app.put('/api/devices/:id', async (req, res) => {
  const { id } = req.params;
  const deviceData = req.body;
  
  const result = await firebaseRealtimeDB.updateDevice(id, deviceData);
  res.json(result);
});

app.delete('/api/devices/:id', async (req, res) => {
  const { id } = req.params;
  const result = await firebaseRealtimeDB.deleteDevice(id);
  res.json(result);
});

// Face data routes
app.post('/api/face-data', async (req, res) => {
  const { userId, faceData } = req.body;
  
  if (!userId || !faceData) {
    return res.status(400).json({
      success: false,
      error: 'User ID and face data are required'
    });
  }

  const result = await firebaseRealtimeDB.saveFaceData(userId, faceData);
  res.json(result);
});

app.get('/api/face-data/:userId', async (req, res) => {
  const { userId } = req.params;
  const result = await firebaseRealtimeDB.getFaceData(userId);
  res.json(result);
});

// Real-time updates endpoint
app.get('/api/realtime/attendance', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const callback = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Listen for attendance updates
  const unsubscribe = firebaseRealtimeDB.listenToData('attendance', callback);

  req.on('close', () => {
    // Clean up listener
    unsubscribe();
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Firebase Backend Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API documentation: http://localhost:${PORT}/`);
});

module.exports = app;
