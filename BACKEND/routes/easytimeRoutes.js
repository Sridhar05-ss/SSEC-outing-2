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
    const limit = parseInt(req.query.limit || '200', 10);

    // Authenticate if needed
    if (!easyTimeProAPI.accessToken) {
      const authResult = await easyTimeProAPI.authenticate({ username: 'admin', password: 'Admin@123' });
      if (!authResult.success) {
        return res.status(401).json({ success: false, error: 'Authentication failed: ' + authResult.error });
      }
    }

    // Fetch transactions
    const txResult = await easyTimeProAPI.getTransactionLogs(limit);
    if (!txResult.success) {
      return res.status(500).json({ success: false, error: txResult.error || 'Failed to fetch transactions' });
    }

    const records = Array.isArray(txResult.data?.data) ? txResult.data.data : [];

    // Enrich with Firebase name/department by emp_code
    const today = new Date().toISOString().slice(0, 10);
    const attendanceRefPath = `new_attend/${today}`; // for context only

    // Build a quick lookup from Firebase students and staff collections
    const fbStaffRes = await firebaseDB.getData('Attendance_Log_staffs');
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
      const basic = { emp_code: r.emp_code, punch_time: r.punch_time };
      const extra = empCodeToInfo.get(r.emp_code) || { name: 'Unknown', department: 'Unknown' };
      return { ...basic, ...extra };
    });

    res.json({ success: true, data: simplified });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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

// DELETE /easytime/delete-employee/:empCode - Delete a staff member from EasyTime Pro
router.delete('/delete-employee/:empCode', async (req, res) => {
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

    // Delete staff member from EasyTime Pro
    const result = await easyTimeProAPI.deleteStaffMember(empCode);

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

// GET /easytime/zk-attendance - Fetch attendance from EasyTime Pro, enrich with Firebase data, and save to ZKAttendance
router.get('/zk-attendance', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '500', 10);

    // Authenticate if needed
    if (!easyTimeProAPI.accessToken) {
      const authResult = await easyTimeProAPI.authenticate({ username: 'admin', password: 'Admin@123' });
      if (!authResult.success) {
        return res.status(401).json({ success: false, error: 'Authentication failed: ' + authResult.error });
      }
    }

    // Fetch transactions from EasyTime Pro
    const txResult = await easyTimeProAPI.getTransactionLogs(limit);
    if (!txResult.success) {
      return res.status(500).json({ success: false, error: txResult.error || 'Failed to fetch transactions' });
    }

    const records = Array.isArray(txResult.data?.data) ? txResult.data.data : [];
    
    // Filter records to only include emp_code and punch_time
    const filteredRecords = records.map(record => ({
      emp_code: record.emp_code,
      punch_time: record.punch_time
    })).filter(record => record.emp_code && record.punch_time);

    if (filteredRecords.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No attendance records found',
        data: [] 
      });
    }

    // Get employee/student data from Firebase
    const fbStaffRes = await firebaseDB.getData('Attendance_Log_staffs');
    const fbStudentsRes = await firebaseDB.getData('students');

    const empCodeToInfo = new Map();
    
    // Build staff lookup
    if (fbStaffRes.success && fbStaffRes.data) {
      Object.entries(fbStaffRes.data).forEach(([id, info]) => {
        empCodeToInfo.set(id, { 
          name: info.name || info.Name || 'Unknown', 
          department: info.department || 'Unknown',
          type: 'staff'
        });
      });
    }
    
    // Build student lookup
    if (fbStudentsRes.success && fbStudentsRes.data) {
      Object.entries(fbStudentsRes.data).forEach(([deptName, byId]) => {
        if (byId && typeof byId === 'object') {
          Object.entries(byId).forEach(([id, info]) => {
            // Only set if not already present from staff
            if (!empCodeToInfo.has(id)) {
              empCodeToInfo.set(id, { 
                name: info.Name || info.name || 'Unknown', 
                department: deptName,
                type: 'student'
              });
            }
          });
        }
      });
    }

    // Enrich records with name and department
    const enrichedRecords = filteredRecords.map(record => {
      const info = empCodeToInfo.get(record.emp_code) || { 
        name: 'Unknown', 
        department: 'Unknown',
        type: 'unknown'
      };
      
      return {
        emp_code: record.emp_code,
        punch_time: record.punch_time,
        name: info.name,
        department: info.department,
        type: info.type,
        timestamp: new Date().toISOString()
      };
    });

    // Save enriched records to ZKAttendance collection
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const zkAttendancePath = `ZKAttendance/${today}`;
    
    // Get existing data for today
    const existingDataRes = await firebaseDB.getData(zkAttendancePath);
    let existingData = {};
    
    if (existingDataRes.success && existingDataRes.data) {
      existingData = existingDataRes.data;
    }

    // Merge new records with existing data
    const updatedData = { ...existingData };
    enrichedRecords.forEach(record => {
      const recordKey = `${record.emp_code}_${record.punch_time.replace(/[: ]/g, '_')}`;
      updatedData[recordKey] = record;
    });

    // Save to Firebase
    const saveResult = await firebaseDB.setData(zkAttendancePath, updatedData);
    
    if (!saveResult.success) {
      console.error('Failed to save to ZKAttendance:', saveResult.error);
      // Continue anyway to return the data
    }

    // Group records by employee for better display
    const groupedByEmployee = new Map();
    enrichedRecords.forEach(record => {
      if (!groupedByEmployee.has(record.emp_code)) {
        groupedByEmployee.set(record.emp_code, {
          id: record.emp_code,
          name: record.name,
          department: record.department,
          type: record.type,
          punches: []
        });
      }
      
      const employee = groupedByEmployee.get(record.emp_code);
      employee.punches.push({
        punch_time: record.punch_time,
        timestamp: record.timestamp
      });
    });

    // Convert to array and sort punches by time
    const finalData = Array.from(groupedByEmployee.values()).map(employee => {
      employee.punches.sort((a, b) => new Date(a.punch_time).getTime() - new Date(b.punch_time).getTime());
      
      // Determine in/out times
      const inTime = employee.punches.length > 0 ? employee.punches[0].punch_time : null;
      const outTime = employee.punches.length > 1 ? employee.punches[employee.punches.length - 1].punch_time : null;
      
      return {
        id: employee.id,
        name: employee.name,
        department: employee.department,
        type: employee.type,
        in: inTime,
        out: outTime,
        status: outTime ? "EXIT" : "Inside",
        timestamp: outTime || inTime || new Date().toISOString(),
        punches: employee.punches
      };
    });

    // Sort by timestamp (newest first)
    finalData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ 
      success: true, 
      message: `Processed ${enrichedRecords.length} attendance records`,
      data: finalData,
      savedToFirebase: saveResult.success
    });

  } catch (error) {
    console.error('Error processing ZK attendance:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error processing attendance data' 
    });
  }
});

module.exports = router;
