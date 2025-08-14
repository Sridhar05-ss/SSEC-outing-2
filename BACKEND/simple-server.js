const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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
    'http://192.168.1.2:4173'
  ],
  credentials: true
}));

app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('Simple server is running...');
});

// Test EasyTime Pro route
app.post('/api/easytime/add-employee', (req, res) => {
  console.log('Received employee data:', req.body);
  res.json({ success: true, message: 'Employee added successfully' });
});

app.delete('/api/easytime/delete-employee/:empCode', (req, res) => {
  console.log('Deleting employee:', req.params.empCode);
  res.json({ success: true, message: 'Employee deleted successfully' });
});

const PORT = 3001;

// Add error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log('Press Ctrl+C to stop');
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});
