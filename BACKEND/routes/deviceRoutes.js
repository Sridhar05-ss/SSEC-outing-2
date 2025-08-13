// ZKTeco Device Routes
// This file contains all the API endpoints for ZKTeco device operations

const express = require('express');
const router = express.Router();
const { zktecoAPI } = require('../services/zktechoService');
const { zktecoAuth } = require('../utils/auth');
const { 
  validateUserData, 
  formatUserData, 
  handleDeviceError,
  formatAttendanceRecord 
} = require('../utils/deviceHelpers');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!zktecoAuth.isAuthenticated) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }
  next();
};

// GET /device/status - Get device connection status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const status = await zktecoAuth.checkDeviceStatus();
    res.json({
      success: true,
      data: {
        isConnected: status,
        lastSync: zktecoAuth.deviceStatus.lastSync,
      }
    });
  } catch (error) {
    const errorResponse = handleDeviceError(error, 'get device status');
    res.status(500).json(errorResponse);
  }
});

// POST /device/sync - Sync with device
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const success = await zktecoAuth.syncDevice();
    res.json({
      success: true,
      data: {
        synced: success,
        lastSync: zktecoAuth.deviceStatus.lastSync,
      }
    });
  } catch (error) {
    const errorResponse = handleDeviceError(error, 'sync device');
    res.status(500).json(errorResponse);
  }
});

// GET /device/attendance - Get attendance data
router.get('/attendance', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const attendanceData = await zktecoAuth.getAttendanceData(date);
    
    const formattedData = attendanceData.map(formatAttendanceRecord);
    
    res.json({
      success: true,
      data: formattedData,
      count: formattedData.length
    });
  } catch (error) {
    const errorResponse = handleDeviceError(error, 'get attendance data');
    res.status(500).json(errorResponse);
  }
});

// GET /device/users - Get all users from device
router.get('/users', requireAuth, async (req, res) => {
  try {
    const users = await zktecoAuth.getDeviceUsers();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    const errorResponse = handleDeviceError(error, 'get device users');
    res.status(500).json(errorResponse);
  }
});

// POST /device/users - Add user to device
router.post('/users', requireAuth, async (req, res) => {
  try {
    const userData = req.body;
    
    // Validate user data
    validateUserData(userData);
    
    // Format user data
    const formattedUserData = formatUserData(userData);
    
    const success = await zktecoAuth.addUserToDevice(formattedUserData);
    
    if (success) {
      res.json({
        success: true,
        message: 'User added to device successfully',
        data: formattedUserData
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to add user to device'
      });
    }
  } catch (error) {
    if (error.message.includes('Missing required fields') || error.message.includes('Invalid privilege level')) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    } else {
      const errorResponse = handleDeviceError(error, 'add user to device');
      res.status(500).json(errorResponse);
    }
  }
});

// DELETE /device/users/:userId - Delete user from device
router.delete('/users/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const success = await zktecoAuth.deleteUserFromDevice(userId);
    
    if (success) {
      res.json({
        success: true,
        message: 'User deleted from device successfully',
        data: { userId }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to delete user from device'
      });
    }
  } catch (error) {
    const errorResponse = handleDeviceError(error, 'delete user from device');
    res.status(500).json(errorResponse);
  }
});

// GET /device/logs - Get device logs
router.get('/logs', requireAuth, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await zktecoAuth.getDeviceLogs(parseInt(limit));
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    const errorResponse = handleDeviceError(error, 'get device logs');
    res.status(500).json(errorResponse);
  }
});

// POST /device/authenticate - Authenticate with device
router.post('/authenticate', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    const user = await zktecoAuth.authenticate(username, password);
    
    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          user_id: user.user_id,
          privilege: user.privilege,
        },
        isAuthenticated: zktecoAuth.isAuthenticated,
        deviceStatus: zktecoAuth.deviceStatus
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message || 'Authentication failed'
    });
  }
});

// POST /device/logout - Logout from device
router.post('/logout', requireAuth, async (req, res) => {
  try {
    zktecoAuth.logout();
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// GET /device/auth/status - Get authentication status
router.get('/auth/status', (req, res) => {
  res.json({
    success: true,
    data: {
      isAuthenticated: zktecoAuth.isAuthenticated,
      user: zktecoAuth.user,
      deviceStatus: zktecoAuth.deviceStatus
    }
  });
});

module.exports = router;
