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
      console.error('EasyTime Pro API request failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Authenticate with EasyTime Pro using JWT token auth
  async authenticate(credentials) {
    try {
      console.log('Authenticating with EasyTime Pro...');
      const response = await this.makeRequest('/api-token-auth/', {
        method: 'POST',
        data: credentials,
      });

      console.log('Full authentication response:', response);
      
      if (response.token) {
        this.accessToken = response.token;
        console.log('Authentication successful, token received');
        return {
          success: true,
          token: response.token,
          user: response.user
        };
      } else {
        console.error('No token received in response:', response);
        return {
          success: false,
          error: 'No token received'
        };
      }
    } catch (error) {
      console.error('Authentication failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.non_field_errors?.[0] || 'Authentication failed'
      };
    }
  }

  // Add a new staff member to EasyTime Pro
  async addStaffMember(staffData) {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated. Please authenticate first.');
      }

      console.log('Adding staff member to EasyTime Pro:', staffData);

      // Format data according to EasyTime Pro API requirements
      const easyTimeProData = {
        emp_code: staffData.emp_code,
        first_name: staffData.first_name,
        department: parseInt(staffData.department),
        position: parseInt(staffData.position),
        area: [parseInt(staffData.area)],
        area_code: "2",
        area_name: "HO"
      };

      console.log('Formatted data for EasyTime Pro:', easyTimeProData);

      const response = await this.makeRequest('/personnel/api/employees/', {
        method: 'POST',
        data: easyTimeProData,
        headers: {
          'Authorization': `Token ${this.accessToken}`,
        },
      });
      
      console.log('EasyTime Pro response:', response);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to add staff member:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
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
          'Authorization': `Token ${this.accessToken}`,
        },
      });
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to delete staff member:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
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
          'Authorization': `Token ${this.accessToken}`,
        },
      });
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to get staff members:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Get transaction logs
  async getTransactionLogs(limit = 100) {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated');
      }
      console.log('Making request to EasyTime Pro API...');
      const response = await this.makeRequest(`/iclock/api/transactions/?limit=${limit}`, {
        method: 'GET',
        headers: {
          // EasyTime Pro expects Token scheme, not Bearer
          Authorization: `Token ${this.accessToken}`,
        },
      });
      
      console.log('EasyTime Pro API response:', JSON.stringify(response, null, 2));
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to get transaction logs:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
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
