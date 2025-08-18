const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

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

// EasyTime Pro API configuration
const EASYTIME_PRO_URL = 'http://127.0.0.1:8081';
let accessToken = null;

// Authenticate with EasyTime Pro
async function authenticateEasyTimePro() {
  try {
    console.log('Authenticating with EasyTime Pro...');
    const response = await axios.post(`${EASYTIME_PRO_URL}/api-token-auth/`, {
      username: 'admin',
      password: 'Admin@123'
    });
    
    if (response.data.token) {
      accessToken = response.data.token;
      console.log('Authentication successful');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

// Simple test route
app.get('/', (req, res) => {
  res.send('Simple server is running...');
});

// Test EasyTime Pro route
app.post('/api/easytime/add-employee', async (req, res) => {
  try {
    console.log('Received employee data:', req.body);
    
    // Authenticate if needed
    if (!accessToken) {
      const authSuccess = await authenticateEasyTimePro();
      if (!authSuccess) {
        return res.status(401).json({ success: false, error: 'Authentication failed' });
      }
    }

    // Forward request to EasyTime Pro
    const response = await axios.post(`${EASYTIME_PRO_URL}/personnel/api/employees/`, req.body, {
      headers: {
        'Authorization': `Token ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ success: true, data: response.data, message: 'Employee added successfully' });
  } catch (error) {
    console.error('Error adding employee:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data || 'Failed to add employee' 
    });
  }
});

app.delete('/api/easytime/delete-employee/:empCode', async (req, res) => {
  try {
    console.log('Deleting employee:', req.params.empCode);
    
    // Authenticate if needed
    if (!accessToken) {
      const authSuccess = await authenticateEasyTimePro();
      if (!authSuccess) {
        return res.status(401).json({ success: false, error: 'Authentication failed' });
      }
    }

    // First, get the employee to find their ID
    const getResponse = await axios.get(`${EASYTIME_PRO_URL}/personnel/api/employees/`, {
      headers: {
        'Authorization': `Token ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        emp_code: req.params.empCode
      }
    });

    if (getResponse.data.results && getResponse.data.results.length > 0) {
      const employee = getResponse.data.results[0];
      
      // Delete the employee using their ID
      await axios.delete(`${EASYTIME_PRO_URL}/personnel/api/employees/${employee.id}/`, {
        headers: {
          'Authorization': `Token ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      res.json({ success: true, message: 'Employee deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error deleting employee:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data || 'Failed to delete employee' 
    });
  }
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
