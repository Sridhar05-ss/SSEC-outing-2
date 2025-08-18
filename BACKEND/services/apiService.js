// Easy Time Pro API Integration Service
// This file handles authentication and staff management functions for Easy Time Pro

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class EasyTimeProAPI {
  constructor() {
    this.backendBaseUrl = process.env.EASYTIMEPRO_API_URL || 'http://127.0.0.1:8081';
    this.accessToken = null;
    this.transactionCache = new Map();
    this.cacheFile = path.join(__dirname, '../data/transactions_cache.json');
    this.loadTransactionCache();
  }

  // Load transaction cache from file
  async loadTransactionCache() {
    try {
      const data = await fs.readFile(this.cacheFile, 'utf8');
      const cache = JSON.parse(data);
      this.transactionCache = new Map(Object.entries(cache));
      console.log(`Loaded ${this.transactionCache.size} cached transactions`);
    } catch (error) {
      console.log('No existing transaction cache found, starting fresh');
      // Ensure the data directory exists
      await this.ensureDataDirectory();
    }
  }

  // Save transaction cache to file
  async saveTransactionCache() {
    try {
      await this.ensureDataDirectory();
      const cacheObject = Object.fromEntries(this.transactionCache);
      await fs.writeFile(this.cacheFile, JSON.stringify(cacheObject, null, 2));
      console.log(`Saved ${this.transactionCache.size} transactions to cache`);
    } catch (error) {
      console.error('Failed to save transaction cache:', error);
    }
  }

  // Ensure data directory exists
  async ensureDataDirectory() {
    const dataDir = path.dirname(this.cacheFile);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  // Add transaction to cache
  addTransactionToCache(transaction) {
    const key = `${transaction.emp_code}_${transaction.punch_time}`;
    this.transactionCache.set(key, {
      ...transaction,
      cached_at: new Date().toISOString()
    });
  }

  // Get all cached transactions
  getCachedTransactions() {
    return Array.from(this.transactionCache.values());
  }

  // Merge new transactions with cached ones
  mergeTransactions(newTransactions, cachedTransactions) {
    const merged = new Map();
    
    // Add all cached transactions
    cachedTransactions.forEach(tx => {
      const key = `${tx.emp_code}_${tx.punch_time}`;
      merged.set(key, tx);
    });
    
    // Add/update with new transactions
    newTransactions.forEach(tx => {
      const key = `${tx.emp_code}_${tx.punch_time}`;
      merged.set(key, {
        ...tx,
        cached_at: new Date().toISOString()
      });
    });
    
    return Array.from(merged.values());
  }

  // Clean old transactions from cache (keep last 30 days)
  cleanOldTransactions() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const cleaned = new Map();
    let removedCount = 0;
    
    this.transactionCache.forEach((tx, key) => {
      const punchDate = new Date(tx.punch_time);
      if (punchDate >= thirtyDaysAgo) {
        cleaned.set(key, tx);
      } else {
        removedCount++;
      }
    });
    
    this.transactionCache = cleaned;
    console.log(`Cleaned ${removedCount} old transactions from cache`);
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
    let url = `${this.backendBaseUrl}${endpoint}`;
    
    // Handle query parameters
    if (options.params) {
      const params = new URLSearchParams();
      Object.keys(options.params).forEach(key => {
        params.append(key, options.params[key]);
      });
      url += `?${params.toString()}`;
    }
    
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

  // Get all staff members from EasyTime Pro
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

  // Delete a staff member from EasyTime Pro
  async deleteStaffMember(empCode) {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated');
      }

      console.log('Deleting staff member with emp_code:', empCode);

      // First, get the employee to find their ID
      const getResponse = await this.makeRequest('/personnel/api/employees/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.accessToken}`,
        },
        params: {
          emp_code: empCode
        }
      });

      if (getResponse.results && getResponse.results.length > 0) {
        const employee = getResponse.results[0];
        console.log('Found employee with ID:', employee.id);
        
        // Delete the employee using their ID
        await this.makeRequest(`/personnel/api/employees/${employee.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${this.accessToken}`,
          }
        });

        return {
          success: true,
          message: 'Staff member deleted successfully',
          data: { id: employee.id, emp_code: empCode }
        };
      } else {
        return {
          success: false,
          error: 'Employee not found'
        };
      }
    } catch (error) {
      console.error('Failed to delete staff member:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Delete a staff member from EasyTime Pro by ID
  async deleteStaffMemberById(id) {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated');
      }

      console.log('Deleting staff member with ID:', id);
      
      // Delete the employee directly using their ID
      await this.makeRequest(`/personnel/api/employees/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${this.accessToken}`,
        }
      });

      return {
        success: true,
        message: 'Staff member deleted successfully',
        data: { id: id }
      };
    } catch (error) {
      console.error('Failed to delete staff member:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Get employee by employee code
  async getEmployeeByCode(empCode) {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated');
      }

      console.log('Getting employee with emp_code:', empCode);

      const response = await this.makeRequest('/personnel/api/employees/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.accessToken}`,
        },
        params: {
          emp_code: empCode
        }
      });

      if (response.results && response.results.length > 0) {
        return {
          success: true,
          data: response.results[0]
        };
      } else {
        return {
          success: false,
          error: 'Employee not found'
        };
      }
    } catch (error) {
      console.error('Failed to get employee:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Update a staff member in EasyTime Pro
  async updateStaffMember(id, updateData) {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated');
      }

      console.log('Updating staff member with ID:', id);
      console.log('Update data:', updateData);

      // Format data according to EasyTime Pro API requirements
      const easyTimeProData = {
        emp_code: updateData.emp_code,
        first_name: updateData.first_name,
        department: parseInt(updateData.department),
        position: parseInt(updateData.position),
        area: [parseInt(updateData.area || 2)],
        area_code: "2",
        area_name: "HO"
      };

      // Add additional fields if present
      if (updateData["aadhaar no"]) {
        easyTimeProData["aadhaar no"] = updateData["aadhaar no"];
      }
      if (updateData["contact no"]) {
        easyTimeProData["contact no"] = updateData["contact no"];
      }
      if (updateData["birthday"]) {
        easyTimeProData["birthday"] = updateData["birthday"];
      }

      console.log('Formatted update data for EasyTime Pro:', easyTimeProData);

      const response = await this.makeRequest(`/personnel/api/employees/${id}/`, {
        method: 'PATCH',
        data: easyTimeProData,
        headers: {
          'Authorization': `Token ${this.accessToken}`,
        },
      });
      
      console.log('EasyTime Pro update response:', response);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to update staff member:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Get transaction logs with caching
  async getTransactionLogs(limit = 10000) {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated');
      }
      
      console.log(`Requesting ${limit} transactions from EasyTime Pro...`);
      
      // Get cached transactions first
      const cachedTransactions = this.getCachedTransactions();
      console.log(`Found ${cachedTransactions.length} cached transactions`);
      
      // Try different approaches to get more transactions
      let response;
      
      // First attempt: Try with the requested limit and additional parameters
      try {
        response = await this.makeRequest(`/iclock/api/transactions/?limit=${limit}&ordering=-punch_time`, {
          method: 'GET',
          headers: {
            // EasyTime Pro expects Token scheme, not Bearer
            Authorization: `Token ${this.accessToken}`,
          },
        });
        
        console.log(`EasyTime Pro API response received with ${response?.data?.length || 0} records`);
        
        // If we got very few records, try different approaches
        if (response?.data && Array.isArray(response.data) && response.data.length < 100) {
          console.log(`Only ${response.data.length} records received, trying alternative approaches...`);
          
          // Try without limit parameter
          try {
            const unlimitedResponse = await this.makeRequest(`/iclock/api/transactions/?ordering=-punch_time`, {
              method: 'GET',
              headers: {
                Authorization: `Token ${this.accessToken}`,
              },
            });
            
            if (unlimitedResponse?.data && Array.isArray(unlimitedResponse.data) && unlimitedResponse.data.length > response.data.length) {
              console.log(`Got more records without limit: ${unlimitedResponse.data.length} vs ${response.data.length}`);
              response = unlimitedResponse;
            }
          } catch (unlimitedError) {
            console.log('Unlimited request failed, trying with offset...');
          }
          
          // If still few records, try with offset to get more recent transactions
          if (response?.data && Array.isArray(response.data) && response.data.length < 100) {
            try {
              const offsetResponse = await this.makeRequest(`/iclock/api/transactions/?limit=${limit}&offset=0&ordering=-punch_time`, {
                method: 'GET',
                headers: {
                  Authorization: `Token ${this.accessToken}`,
                },
              });
              
              if (offsetResponse?.data && Array.isArray(offsetResponse.data) && offsetResponse.data.length > response.data.length) {
                console.log(`Got more records with offset: ${offsetResponse.data.length} vs ${response.data.length}`);
                response = offsetResponse;
              }
            } catch (offsetError) {
              console.log('Offset request failed, using original response');
            }
          }
        }
        
      } catch (error) {
        console.error('Failed to get transactions with limit, trying without limit...');
        
        // Fallback: Try without limit parameter but with ordering
        response = await this.makeRequest(`/iclock/api/transactions/?ordering=-punch_time`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${this.accessToken}`,
          },
        });
      }
      
      console.log('EasyTime Pro API response:', JSON.stringify(response, null, 2));
      
      if (!response || !response.data) {
        throw new Error('Invalid response from EasyTime Pro API');
      }

      // Handle different response formats
      let newTransactions = [];
      if (Array.isArray(response.data)) {
        newTransactions = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        newTransactions = response.data.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        newTransactions = response.data.results;
      } else {
        console.warn('Unexpected response format from EasyTime Pro:', response.data);
        newTransactions = [];
      }

      console.log(`Successfully retrieved ${newTransactions.length} new transactions from EasyTime Pro`);
      
      // Add new transactions to cache
      newTransactions.forEach(tx => this.addTransactionToCache(tx));
      
      // Merge new transactions with cached ones
      const allTransactions = this.mergeTransactions(newTransactions, cachedTransactions);
      
      // Clean old transactions and save updated cache
      this.cleanOldTransactions();
      await this.saveTransactionCache();
      
      console.log(`Total transactions after merging: ${allTransactions.length} (${newTransactions.length} new + ${cachedTransactions.length} cached)`);
      
      return {
        success: true,
        data: {
          data: allTransactions,
          count: allTransactions.length,
          limit: limit,
          newTransactions: newTransactions.length,
          cachedTransactions: cachedTransactions.length
        }
      };
    } catch (error) {
      console.error('Failed to get transaction logs:', error.response?.data || error.message);
      
      // If API fails, return cached transactions
      const cachedTransactions = this.getCachedTransactions();
      console.log(`API failed, returning ${cachedTransactions.length} cached transactions`);
      
      return {
        success: true,
        data: {
          data: cachedTransactions,
          count: cachedTransactions.length,
          limit: limit,
          newTransactions: 0,
          cachedTransactions: cachedTransactions.length,
          note: 'Using cached data due to API failure'
        }
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
