// ZKTeco API Integration Service
// Based on the API documentation provided

const axios = require('axios');

class ZKTecoAPI {
  constructor(config) {
    this.config = {
      timeout: 10000,
      ...config,
    };
    this.accessToken = null;
    this._refreshToken = null;
  }

  // Set tokens after successful authentication
  setTokens(access, refresh) {
    this.accessToken = access;
    if (refresh) this._refreshToken = refresh;
  }

  // Clear tokens on logout
  clearTokens() {
    this.accessToken = null;
    this._refreshToken = null;
  }

  // Get authorization header
  getAuthHeader() {
    if (this.accessToken) {
      return { Authorization: `Bearer ${this.accessToken}` };
    }
    return {};
  }

  // Make API request with error handling
  async makeRequest(endpoint, options = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
    };

    try {
      const response = await axios({
        url,
        ...defaultOptions,
        ...options,
        timeout: this.config.timeout,
      });

      return response.data;
    } catch (error) {
      console.error('ZKTeco API request failed:', error);
      throw error;
    }
  }

  // Staff API Token Authentication
  async authenticateStaff(credentials) {
    try {
      const response = await this.makeRequest('/staff-api-token-auth/', {
        method: 'POST',
        data: credentials,
      });

      if (response.token) {
        this.accessToken = response.token;
      }

      return response;
    } catch (error) {
      console.error('Staff authentication failed:', error);
      throw new Error('Authentication failed. Please check your credentials.');
    }
  }

  // JWT API Token Authentication
  async authenticateJWT(credentials) {
    try {
      const response = await this.makeRequest('/jwt-api-token-auth/', {
        method: 'POST',
        data: credentials,
      });

      if (response.access && response.refresh) {
        this.setTokens(response.access, response.refresh);
      }

      return response;
    } catch (error) {
      console.error('JWT authentication failed:', error);
      throw new Error('Authentication failed. Please check your credentials.');
    }
  }

  // Refresh JWT Token
  async refreshToken() {
    if (!this._refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.makeRequest('/jwt-api-token-refresh/', {
        method: 'POST',
        data: { refresh: this._refreshToken },
      });

      if (response.access) {
        this.accessToken = response.access;
      }

      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw new Error('Session expired. Please login again.');
    }
  }

  // Get device status
  async getDeviceStatus() {
    try {
      const response = await this.makeRequest('/device-status/', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Failed to get device status:', error);
      return { isConnected: false };
    }
  }

  // Get attendance data
  async getAttendanceData(date) {
    try {
      const params = date ? `?date=${date}` : '';
      const response = await this.makeRequest(`/attendance/${params}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Failed to get attendance data:', error);
      throw new Error('Failed to fetch attendance data');
    }
  }

  // Sync with device
  async syncDevice() {
    try {
      const response = await this.makeRequest('/sync/', {
        method: 'POST',
      });
      return response.success || false;
    } catch (error) {
      console.error('Device sync failed:', error);
      return false;
    }
  }

  // Get user list from device
  async getDeviceUsers() {
    try {
      const response = await this.makeRequest('/users/', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Failed to get device users:', error);
      throw new Error('Failed to fetch device users');
    }
  }

  // Add user to device
  async addUserToDevice(userData) {
    try {
      const response = await this.makeRequest('/users/', {
        method: 'POST',
        data: userData,
      });
      return response.success || false;
    } catch (error) {
      console.error('Failed to add user to device:', error);
      return false;
    }
  }

  // Delete user from device
  async deleteUserFromDevice(userId) {
    try {
      const response = await this.makeRequest(`/users/${userId}/`, {
        method: 'DELETE',
      });
      return response.success || false;
    } catch (error) {
      console.error('Failed to delete user from device:', error);
      return false;
    }
  }

  // Get device logs
  async getDeviceLogs(limit = 100) {
    try {
      const response = await this.makeRequest(`/logs/?limit=${limit}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Failed to get device logs:', error);
      throw new Error('Failed to fetch device logs');
    }
  }
}

// ZKTeco Configuration
const ZKTecoConfig = {
  // API Base URL - Update this to match your ZKTeco API server
  API_BASE_URL: process.env.ZKTECO_API_URL || 'http://localhost:8000',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication endpoints
    STAFF_AUTH: '/staff-api-token-auth/',
    JWT_AUTH: '/jwt-api-token-auth/',
    JWT_REFRESH: '/jwt-api-token-refresh/',
    
    // Device management endpoints
    DEVICE_STATUS: '/device-status/',
    SYNC: '/sync/',
    USERS: '/users/',
    ATTENDANCE: '/attendance/',
    LOGS: '/logs/',
  },
  
  // Device settings
  DEVICE: {
    SYNC_INTERVAL: 30000, // 30 seconds
    STATUS_CHECK_INTERVAL: 30000, // 30 seconds
    MAX_LOG_ENTRIES: 100,
    TIMEOUT: 10000, // 10 seconds
  },
  
  // User privilege levels
  PRIVILEGES: {
    USER: 0,
    ADMIN: 1,
    SUPER_ADMIN: 2,
  },
  
  // Attendance types
  ATTENDANCE_TYPES: {
    IN: 'in',
    OUT: 'out',
  },
};

// Helper function to get full API URL
const getApiUrl = (endpoint) => {
  return `${ZKTecoConfig.API_BASE_URL}${endpoint}`;
};

// Helper function to get endpoint URL
const getEndpoint = (endpointKey) => {
  return ZKTecoConfig.ENDPOINTS[endpointKey];
};

// Create and export a singleton instance
const zktecoAPI = new ZKTecoAPI({
  baseUrl: ZKTecoConfig.API_BASE_URL,
  timeout: ZKTecoConfig.DEVICE.TIMEOUT,
});

module.exports = {
  ZKTecoAPI,
  zktecoAPI,
  ZKTecoConfig,
  getApiUrl,
  getEndpoint
};
