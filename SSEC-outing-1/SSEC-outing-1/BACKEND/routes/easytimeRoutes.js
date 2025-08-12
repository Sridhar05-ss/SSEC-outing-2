const express = require('express');
const router = express.Router();
const { easyTimeProAPI } = require('../services/apiService');

// POST /easytime/add-employee - Add a staff member to EasyTime Pro
router.post('/add-employee', async (req, res) => {
  try {
    const staffData = req.body;

    // Validate required fields
    if (!staffData.name || !staffData.user_id || !staffData.department || !staffData.position || !staffData.area) {
      return res.status(400).json({
        success: false,
        error: 'Name, user_id, department, position, and area are required fields'
      });
    }

    // Authenticate if not already authenticated
    if (!easyTimeProAPI.accessToken) {
      // Use environment variables or config for credentials
      const username = process.env.EASYTIMEPRO_USERNAME || 'admin';
      const password = process.env.EASYTIMEPRO_PASSWORD || 'Admin@123';
      await easyTimeProAPI.authenticate({ username, password });
    }

    // Map incoming data to EasyTime Pro API expected format
    const easyTimeProData = {
      emp_code: staffData.user_id,
      first_name: staffData.name,
      department: staffData.department,
      position: staffData.position,
      area: staffData.area,
      area_code: staffData.area_code || (staffData.area && staffData.area[0]?.toString()) || "2",
      area_name: staffData.area_name || "HO"
    };

    const success = await easyTimeProAPI.addStaffMember(easyTimeProData);

    if (success) {
      res.json({
        success: true,
        message: 'Staff member added to EasyTime Pro successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to add staff member to EasyTime Pro'
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

module.exports = router;
