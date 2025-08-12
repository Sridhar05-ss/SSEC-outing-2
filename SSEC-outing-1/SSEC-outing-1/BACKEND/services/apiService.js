// Easy Time Pro API Integration Service
// This file handles authentication and staff management functions for Easy Time Pro

const axios = require('axios');

class EasyTimeProAPI {
  constructor() {
    this.backendBaseUrl = process.env.EASYTIMEPRO_API_URL || 'http://127.0.0.1:8081';
    this.accessToken = null;
  }

  // Set token after successful authentication
  setToken(token) {
    this.accessToken = token;
  }

  // Clear token on logout
  clearToken() {
    this.accessToken = null;
  }

  // Make API request with error handling
  async makeRequest(endpoint, options = {}) {
    const url = `${this.backendBaseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await axios({
        url,
        ...defaultOptions,
        ...options,
      });

      return response.data;
    } catch (error) {
      console.error('Backend API request failed:', error);
      throw error;
    }
  }

  // Authenticate with backend server
  async authenticate(credentials) {
    try {
      const response = await this.makeRequest('/api-token-auth/', {
        method: 'POST',
        data: credentials,
      });

      if (response.token) {
        this.accessToken = response.token;
      }

      return {
        token: response.token,
        user: undefined
      };
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Authentication failed. Please check your credentials.');
    }
  }

  // Add a new staff member
  async addStaffMember(staffData) {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated');
      }
      const response = await this.makeRequest('/personnel/api/employees/', {
        method: 'POST',
        data: staffData,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      
      return response.success || false;
    } catch (error) {
      console.error('Failed to add staff member:', error);
      return false;
    }
  }

  // Delete a staff member
  async deleteStaffMember(staffId) {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated');
      }
      const response = await this.makeRequest(`/personnel/api/employees/${staffId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      
      return response.success || false;
    } catch (error) {
      console.error('Failed to delete staff member:', error);
      return false;
    }
  }

  // Get staff members
  async getStaffMembers() {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated');
      }
      const response = await this.makeRequest('/personnel/api/employees/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      
      return response;
    } catch (error) {
      console.error('Failed to get staff members:', error);
      throw error;
    }
  }

  // Get transaction logs
  async getTransactionLogs(limit = 100) {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated');
      }
      const response = await this.makeRequest(`/iclock/api/transactions/?limit=${limit}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      
      return response;
    } catch (error) {
      console.error('Failed to get transaction logs:', error);
      throw error;
    }
  }
}

// EasyTime Pro Configuration
const EasyTimeProConfig = {
  // API Base URL - Update this to match your EasyTime Pro API server
  API_BASE_URL: process.env.EASYTIMEPRO_API_URL || 'http://127.0.0.1:8081',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: '/api-token-auth/',
    STAFF_JWT_AUTH: '/staff-jwt-api-token-auth/',
    
    // Staff management endpoints
    PERSONAL: '/personnel/api/employees/',

    // Transaction Logs
    TRANSACTIONS: '/iclock/api/transactions/',
  },
  
  // Device settings
  DEVICE: {
    TIMEOUT: 10000, // 10 seconds
  },
};

// Helper function to get full API URL
const getApiUrl = (endpoint) => {
  return `${EasyTimeProConfig.API_BASE_URL}${endpoint}`;
};

// Helper function to get endpoint URL
const getEndpoint = (endpointKey) => {
  return EasyTimeProConfig.ENDPOINTS[endpointKey];
};

// Create and export a singleton instance
const easyTimeProAPI = new EasyTimeProAPI();

module.exports = {
  EasyTimeProAPI,
  easyTimeProAPI,
  EasyTimeProConfig,
  getApiUrl,
  getEndpoint
};
