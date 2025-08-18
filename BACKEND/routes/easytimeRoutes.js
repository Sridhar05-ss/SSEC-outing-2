const express = require('express');
const router = express.Router();
const { easyTimeProAPI } = require('../services/apiService');
const firebaseDB = require('../firebase-backend/firebaseRealtimeDB');

// POST /easytime/authenticate - Authenticate with EasyTime Pro
router.post('/authenticate', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Authenticate with EasyTime Pro
    const authResult = await easyTimeProAPI.authenticate({ username, password });

    if (authResult.success) {
      res.json({
        success: true,
        message: 'Authentication successful',
        token: authResult.token
      });
    } else {
      res.status(401).json({
        success: false,
        error: authResult.error || 'Authentication failed'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
});

// GET /easytime/transactions - Fetch transactions from EasyTime Pro and enrich with Firebase data
router.get('/transactions', async (req, res) => {
  try {
    // Increase the default limit significantly to handle more transactions
    // EasyTime Pro typically supports much higher limits, let's try 10000
    const limit = parseInt(req.query.limit || '10000', 10);
    
    // Add a maximum limit to prevent overwhelming the system
    const maxLimit = 50000; // Maximum 50,000 transactions
    const actualLimit = Math.min(limit, maxLimit);

    console.log(`Fetching transactions with limit: ${actualLimit}`);

    // Authenticate if needed
    if (!easyTimeProAPI.accessToken) {
      const authResult = await easyTimeProAPI.authenticate({ 
        username: 'admin', 
        password: 'Admin@123' 
      });
      
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed: ' + authResult.error
        });
      }
    }

    // Fetch transactions with the increased limit
    const txResult = await easyTimeProAPI.getTransactionLogs(actualLimit);
    if (!txResult.success) {
      return res.status(500).json({ success: false, error: txResult.error || 'Failed to fetch transactions' });
    }

    const records = Array.isArray(txResult.data?.data) ? txResult.data.data : [];
    
    console.log(`Retrieved ${records.length} transactions from EasyTime Pro`);

    // If we got fewer records than requested, log it for debugging
    if (records.length < actualLimit && records.length < 100) {
      console.warn(`Warning: Only ${records.length} transactions retrieved. This might indicate a server-side limit.`);
    }

    // Enrich with Firebase name/department by emp_code
    const today = new Date().toISOString().slice(0, 10);
    const attendanceRefPath = `new_attend/${today}`; // for context only

    // Build a quick lookup from Firebase students and staff collections
    const fbStaffRes = await firebaseDB.getData('staff');
    const fbStudentsRes = await firebaseDB.getData('students');

    const empCodeToInfo = new Map();
    if (fbStaffRes.success && fbStaffRes.data) {
      Object.entries(fbStaffRes.data).forEach(([id, info]) => {
        empCodeToInfo.set(id, { name: info.name || info.Name || 'Unknown', department: info.department || 'Unknown' });
      });
    }
    if (fbStudentsRes.success && fbStudentsRes.data) {
      Object.entries(fbStudentsRes.data).forEach(([deptName, byId]) => {
        if (byId && typeof byId === 'object') {
          Object.entries(byId).forEach(([id, info]) => {
            // Only set if not already present from staff
            if (!empCodeToInfo.has(id)) {
              empCodeToInfo.set(id, { name: info.Name || info.name || 'Unknown', department: deptName });
            }
          });
        }
      });
    }

    // Reduce to desired fields and attach name/department
    const simplified = records.map(r => {
      const basic = { 
        id: r.id,
        emp_code: r.emp_code, 
        punch_time: r.punch_time,
        punch_state: r.punch_state,
        device_name: r.device_name || 'Unknown Device',
        device_id: r.device_id,
        area_name: r.area_name || 'Unknown Area'
      };
      const extra = empCodeToInfo.get(r.emp_code) || { name: r.emp_code, department: 'Unknown' };
      return { ...basic, ...extra };
    });

    res.json({ 
      success: true, 
      data: simplified,
      metadata: {
        requestedLimit: limit,
        actualLimit: actualLimit,
        retrievedCount: records.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// POST /easytime/add-employee - Add a staff member to EasyTime Pro
router.post('/add-employee', async (req, res) => {
  try {
    const staffData = req.body;
    
    console.log('Received staff data:', staffData);
    console.log('Data types:', {
      emp_code: typeof staffData.emp_code,
      first_name: typeof staffData.first_name,
      department: typeof staffData.department,
      position: typeof staffData.position,
      area: typeof staffData.area
    });

    // Validate required fields
    if (!staffData.emp_code || !staffData.first_name || !staffData.department || !staffData.position) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({
        success: false,
        error: 'emp_code, first_name, department, and position are required fields'
      });
    }

    // Authenticate if not already authenticated
    if (!easyTimeProAPI.accessToken) {
      console.log('No access token found, authenticating...');
      const authResult = await easyTimeProAPI.authenticate({ 
        username: 'admin', 
        password: 'Admin@123' 
      });
      
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed: ' + authResult.error
        });
      }
    }

    // Add staff member to EasyTime Pro
    const result = await easyTimeProAPI.addStaffMember(staffData);

    if (result.success) {
      res.json({
        success: true,
        message: 'Staff member added to EasyTime Pro successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to add staff member to EasyTime Pro'
      });
    }
  } catch (error) {
    console.error('Error adding staff member to EasyTime Pro:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /easytime/delete-employee/:id - Delete a staff member from EasyTime Pro
router.delete('/delete-employee/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    // Authenticate if not already authenticated
    if (!easyTimeProAPI.accessToken) {
      const authResult = await easyTimeProAPI.authenticate({ 
        username: 'admin', 
        password: 'Admin@123' 
      });
      
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed: ' + authResult.error
        });
      }
    }

    // Delete staff member from EasyTime Pro using the ID directly
    const result = await easyTimeProAPI.deleteStaffMemberById(id);

    if (result.success) {
      res.json({
        success: true,
        message: 'Staff member deleted from EasyTime Pro successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to delete staff member from EasyTime Pro'
      });
    }
  } catch (error) {
    console.error('Error deleting staff member from EasyTime Pro:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /easytime/get-employee/:empCode - Get employee by employee code
router.get('/get-employee/:empCode', async (req, res) => {
  try {
    const { empCode } = req.params;

    if (!empCode) {
      return res.status(400).json({
        success: false,
        error: 'Employee code is required'
      });
    }

    // Authenticate if not already authenticated
    if (!easyTimeProAPI.accessToken) {
      const authResult = await easyTimeProAPI.authenticate({ 
        username: 'admin', 
        password: 'Admin@123' 
      });
      
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed: ' + authResult.error
        });
      }
    }

    // Get employee from EasyTime Pro
    const result = await easyTimeProAPI.getEmployeeByCode(empCode);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error || 'Employee not found'
      });
    }
  } catch (error) {
    console.error('Error getting employee from EasyTime Pro:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /easytime/update-employee/:id - Update employee by ID
router.patch('/update-employee/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    // Authenticate if not already authenticated
    if (!easyTimeProAPI.accessToken) {
      const authResult = await easyTimeProAPI.authenticate({ 
        username: 'admin', 
        password: 'Admin@123' 
      });
      
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed: ' + authResult.error
        });
      }
    }

    // Update employee in EasyTime Pro
    const result = await easyTimeProAPI.updateStaffMember(id, updateData);

    if (result.success) {
      res.json({
        success: true,
        message: 'Employee updated in EasyTime Pro successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to update employee in EasyTime Pro'
      });
    }
  } catch (error) {
    console.error('Error updating employee in EasyTime Pro:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /easytime/staff - Get all staff members from EasyTime Pro
router.get('/staff', async (req, res) => {
  try {
    // Authenticate if not already authenticated
    if (!easyTimeProAPI.accessToken) {
      const authResult = await easyTimeProAPI.authenticate({ 
        username: 'admin', 
        password: 'Admin@123' 
      });
      
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed: ' + authResult.error
        });
      }
    }

    // Get staff members from EasyTime Pro
    const result = await easyTimeProAPI.getStaffMembers();

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to get staff members from EasyTime Pro'
      });
    }
  } catch (error) {
    console.error('Error getting staff members from EasyTime Pro:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
