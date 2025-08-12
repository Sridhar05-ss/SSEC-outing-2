// ZKTeco Authentication Utility
// This file handles authentication and device management for ZKTeco devices

const { zktecoAPI } = require('../services/zktechoService');
const { validateDemoCredentials } = require('./deviceHelpers');

// Helper function to convert DemoUser to ZKTecoUser
const convertDemoUserToZKTecoUser = (demoUser) => {
  // Generate a numeric ID from the user_id string
  const id = demoUser.user_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    id,
    username: demoUser.username,
    role: demoUser.role,
    name: demoUser.name,
    user_id: demoUser.user_id,
    privilege: demoUser.privilege,
  };
};

class ZKTecoAuth {
  constructor() {
    this.state = {
      isAuthenticated: false,
      user: null,
      tokens: {
        access: null,
        refresh: null,
      },
      deviceStatus: {
        isConnected: false,
        lastSync: null,
      },
    };
  }

  get isAuthenticated() {
    return this.state.isAuthenticated;
  }

  get user() {
    return this.state.user;
  }

  get deviceStatus() {
    return this.state.deviceStatus;
  }

  // Authenticate with ZKTeco device
  async authenticate(username, password) {
    try {
      // Try JWT authentication first
      const response = await zktecoAPI.authenticateJWT({ username, password });
      
      if (response.access && response.refresh && response.user) {
        // Update state
        this.state = {
          isAuthenticated: true,
          user: response.user,
          tokens: {
            access: response.access,
            refresh: response.refresh,
          },
          deviceStatus: this.state.deviceStatus,
        };

        // Set tokens in API
        zktecoAPI.setTokens(response.access, response.refresh);

        return response.user;
      }

      throw new Error('Invalid response from authentication server');
    } catch (error) {
      // If JWT auth fails, try staff token auth
      try {
        const staffResponse = await zktecoAPI.authenticateStaff({ username, password });
        
        if (staffResponse.token && staffResponse.user) {
          // Update state
          this.state = {
            isAuthenticated: true,
            user: staffResponse.user,
            tokens: {
              access: staffResponse.token,
              refresh: null,
            },
            deviceStatus: this.state.deviceStatus,
          };

          // Set token in API
          zktecoAPI.setTokens(staffResponse.token);

          return staffResponse.user;
        }
      } catch (staffError) {
        console.error('Staff authentication also failed:', staffError);
      }

      // If ZKTeco API fails, try demo credentials as fallback
      const demoUser = validateDemoCredentials(username, password);
      if (demoUser) {
        console.log('Using demo credentials for testing:', demoUser);
        this.state = {
          isAuthenticated: true,
          user: convertDemoUserToZKTecoUser(demoUser),
          tokens: {
            access: 'demo-token',
            refresh: null,
          },
          deviceStatus: this.state.deviceStatus,
        };
        
        console.log('Auth state updated:', this.state);
        return convertDemoUserToZKTecoUser(demoUser);
      }

      throw new Error('Authentication failed. Please check your credentials.');
    }
  }

  // Refresh authentication token
  async refreshAuth() {
    if (!this.state.tokens.refresh) {
      return false;
    }

    try {
      const response = await zktecoAPI.refreshToken();
      
      if (response.access) {
        this.state.tokens.access = response.access;
        zktecoAPI.setTokens(response.access, this.state.tokens.refresh);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
    }

    return false;
  }

  // Check device connection status
  async checkDeviceStatus() {
    try {
      const status = await zktecoAPI.getDeviceStatus();
      this.state.deviceStatus = {
        isConnected: status.isConnected,
        lastSync: status.lastSync || null,
      };
      return status.isConnected;
    } catch (error) {
      console.error('Failed to check device status:', error);
      this.state.deviceStatus.isConnected = false;
      return false;
    }
  }

  // Sync with device
  async syncDevice() {
    try {
      const success = await zktecoAPI.syncDevice();
      if (success) {
        this.state.deviceStatus.lastSync = new Date().toISOString();
      }
      return success;
    } catch (error) {
      console.error('Device sync failed:', error);
      return false;
    }
  }

  // Get attendance data
  async getAttendanceData(date) {
    return await zktecoAPI.getAttendanceData(date);
  }

  // Get device users
  async getDeviceUsers() {
    return await zktecoAPI.getDeviceUsers();
  }

  // Add user to device
  async addUserToDevice(userData) {
    return await zktecoAPI.addUserToDevice(userData);
  }

  // Delete user from device
  async deleteUserFromDevice(userId) {
    return await zktecoAPI.deleteUserFromDevice(userId);
  }

  // Get device logs
  async getDeviceLogs(limit = 100) {
    return await zktecoAPI.getDeviceLogs(limit);
  }

  // Logout
  logout() {
    this.state = {
      isAuthenticated: false,
      user: null,
      tokens: { access: null, refresh: null },
      deviceStatus: { isConnected: false, lastSync: null },
    };
    
    zktecoAPI.clearTokens();
  }

  // Check if token is expired and refresh if needed
  async ensureValidToken() {
    if (!this.state.isAuthenticated) {
      return false;
    }

    // Simple check - you might want to implement proper JWT expiration checking
    if (this.state.tokens.access) {
      return true;
    }

    return await this.refreshAuth();
  }

  // Get current auth state
  getAuthState() {
    return this.state;
  }

  // Set auth state (for session restoration)
  setAuthState(state) {
    this.state = state;
    if (state.tokens.access) {
      zktecoAPI.setTokens(state.tokens.access, state.tokens.refresh);
    }
  }
}

// Create and export singleton instance
const zktecoAuth = new ZKTecoAuth();

module.exports = {
  ZKTecoAuth,
  zktecoAuth
};
