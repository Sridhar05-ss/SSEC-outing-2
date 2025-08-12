// ZKTeco Controller - Handles ZKTeco device operations
const { ZKTecoAPI, zktecoAPI } = require('../services/zktechoService');
const { validateDeviceData } = require('../utils/deviceHelpers');

class ZKTecoController {
  constructor() {
    this.zktecoService = zktecoAPI;
  }

  // Get device status
  async getDeviceStatus(req, res) {
    console.log('getDeviceStatus called');
    try {
      const deviceStatus = await this.zktecoService.getDeviceStatus();
      console.log('Device status:', deviceStatus);
      res.json({
        success: true,
        data: deviceStatus
      });
    } catch (error) {
      console.error('Error getting device status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get device status'
      });
    }
  }

  // Sync with device
  async syncDevice(req, res) {
    try {
      const syncResult = await this.zktecoService.syncDevice();
      res.json({
        success: syncResult,
        message: syncResult ? 'Device synced successfully' : 'Device sync failed'
      });
    } catch (error) {
      console.error('Error syncing device:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sync device'
      });
    }
  }

  // Get attendance data
  async getAttendanceData(req, res) {
    try {
      const { date } = req.query;
      const attendanceData = await this.zktecoService.getAttendanceData(date);
      res.json({
        success: true,
        data: attendanceData
      });
    } catch (error) {
      console.error('Error getting attendance data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch attendance data'
      });
    }
  }

  // Get device users
  async getDeviceUsers(req, res) {
    try {
      const users = await this.zktecoService.getDeviceUsers();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error getting device users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch device users'
      });
    }
  }

  // Add user to device
  async addUserToDevice(req, res) {
    try {
      const userData = req.body;
      
      // Validate user data
      const validation = validateDeviceData(userData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.errors.join(', ')
        });
      }

      const result = await this.zktecoService.addUserToDevice(userData);
      res.json({
        success: result,
        message: result ? 'User added successfully' : 'Failed to add user'
      });
    } catch (error) {
      console.error('Error adding user to device:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add user to device'
      });
    }
  }

  // Delete user from device
  async deleteUserFromDevice(req, res) {
    try {
      const { userId } = req.params;
      const result = await this.zktecoService.deleteUserFromDevice(userId);
      res.json({
        success: result,
        message: result ? 'User deleted successfully' : 'Failed to delete user'
      });
    } catch (error) {
      console.error('Error deleting user from device:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user from device'
      });
    }
  }

  // Get device logs
  async getDeviceLogs(req, res) {
    try {
      const { limit = 100 } = req.query;
      const logs = await this.zktecoService.getDeviceLogs(parseInt(limit));
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error getting device logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch device logs'
      });
    }
  }

  // Authenticate with device
  async authenticate(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }

      const authResult = await this.zktecoService.authenticate(username, password);
      res.json({
        success: true,
        data: authResult
      });
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }
}

module.exports = new ZKTecoController();
