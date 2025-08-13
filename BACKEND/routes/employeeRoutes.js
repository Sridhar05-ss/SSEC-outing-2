// EasyTime Pro Employee Routes
// This file contains all the API endpoints for EasyTime Pro employee management

const express = require('express');
const router = express.Router();
const { 
  authenticate, 
  addStaffMember, 
  deleteStaffMember, 
  getStaffMembers, 
  getTransactionLogs 
} = require('../services/employeeRoutes.js');

// Middleware to check if user is authenticated
const requireAuth = async (req, res, next) => {
  try {
    // Check if we're already authenticated
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

// POST /employees/authenticate - Authenticate with EasyTime Pro
router.post('/authenticate', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    const isAuthenticated = await authenticate(username, password);
    
    if (isAuthenticated) {
      res.json({
        success: true,
        message: 'Authentication successful'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
});

// GET /employees - Get all staff members
router.get('/', requireAuth, async (req, res) => {
  try {
    const staffMembers = await getStaffMembers();
    
    res.json({
      success: true,
      data: staffMembers,
      count: staffMembers.length
    });
  } catch (error) {
    console.error('Failed to get staff members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch staff members'
    });
  }
});

// POST /employees - Add a new staff member
router.post('/', requireAuth, async (req, res) => {
  try {
    const staffData = req.body;
    
    // Validate required fields
    if (!staffData.name || !staffData.user_id) {
      return res.status(400).json({
        success: false,
        error: 'Name and user_id are required fields'
      });
    }
    
    const success = await addStaffMember(staffData);
    
    if (success) {
      res.json({
        success: true,
        message: 'Staff member added successfully',
        data: staffData
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to add staff member'
      });
    }
  } catch (error) {
    console.error('Failed to add staff member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add staff member'
    });
  }
});

// DELETE /employees/:staffId - Delete a staff member
router.delete('/:staffId', requireAuth, async (req, res) => {
  try {
    const { staffId } = req.params;
    
    if (!staffId) {
      return res.status(400).json({
        success: false,
        error: 'Staff ID is required'
      });
    }
    
    const success = await deleteStaffMember(staffId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Staff member deleted successfully',
        data: { staffId }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to delete staff member'
      });
    }
  } catch (error) {
    console.error('Failed to delete staff member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete staff member'
    });
  }
});

// GET /employees/transactions - Get transaction logs
router.get('/transactions', requireAuth, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const transactions = await getTransactionLogs(parseInt(limit));
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Failed to get transaction logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction logs'
    });
  }
});

// GET /employees/:staffId - Get specific staff member
router.get('/:staffId', requireAuth, async (req, res) => {
  try {
    const { staffId } = req.params;
    
    if (!staffId) {
      return res.status(400).json({
        success: false,
        error: 'Staff ID is required'
      });
    }
    
    const staffMembers = await getStaffMembers();
    const staffMember = staffMembers.find(staff => staff.user_id === staffId || staff.id === staffId);
    
    if (staffMember) {
      res.json({
        success: true,
        data: staffMember
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }
  } catch (error) {
    console.error('Failed to get staff member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch staff member'
    });
  }
});

// PUT /employees/:staffId - Update staff member
router.put('/:staffId', requireAuth, async (req, res) => {
  try {
    const { staffId } = req.params;
    const updateData = req.body;
    
    if (!staffId) {
      return res.status(400).json({
        success: false,
        error: 'Staff ID is required'
      });
    }
    
    // For now, we'll return a not implemented response
    // This would require additional API methods in the service
    res.status(501).json({
      success: false,
      error: 'Update functionality not implemented yet'
    });
  } catch (error) {
    console.error('Failed to update staff member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update staff member'
    });
  }
});

// GET /employees/search - Search staff members
router.get('/search', requireAuth, async (req, res) => {
  try {
    const { query, field = 'name' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const staffMembers = await getStaffMembers();
    
    // Simple search implementation
    const filteredStaff = staffMembers.filter(staff => {
      const searchValue = staff[field];
      if (!searchValue) return false;
      return searchValue.toLowerCase().includes(query.toLowerCase());
    });
    
    res.json({
      success: true,
      data: filteredStaff,
      count: filteredStaff.length,
      query,
      field
    });
  } catch (error) {
    console.error('Failed to search staff members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search staff members'
    });
  }
});

module.exports = router;
