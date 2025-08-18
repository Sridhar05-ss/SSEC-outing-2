// API Configuration for different environments
export const API_CONFIG = {
  // Backend URL - will be different for development vs production
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 
                (import.meta.env.DEV ? 'http://127.0.0.1:3001' : window.location.origin),
  
  // EasyTime Pro Configuration
  EASYTIME_PRO: {
    BASE_URL: import.meta.env.VITE_EASYTIMEPRO_API_URL || 'http://127.0.0.1:8081',
    USERNAME: import.meta.env.VITE_EASYTIMEPRO_USERNAME || 'admin',
    PASSWORD: import.meta.env.VITE_EASYTIMEPRO_PASSWORD || 'Admin@123'
  },
  
  // ZKTeco Configuration
  ZKTECO: {
    BASE_URL: import.meta.env.VITE_ZKTECO_API_URL || 'http://localhost:8000'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

// API endpoints
export const API_ENDPOINTS = {
  // ZKTeco endpoints
  ZKTECO: {
    TRANSACTIONS: '/api/zkteco/transactions',
    CACHE_STATS: '/api/zkteco/cache/stats',
    CLEAR_CACHE: '/api/zkteco/cache'
  },
  
  // EasyTime Pro endpoints
  EASYTIME: {
    ADD_EMPLOYEE: '/api/easytime/add-employee',
    DELETE_EMPLOYEE: '/api/easytime/delete-employee',
    UPDATE_EMPLOYEE: '/api/easytime/update-employee',
    STAFF: '/api/easytime/staff',
    TRANSACTIONS: '/api/easytime/transactions'
  },
  
  // Health check
  HEALTH: '/'
};

// Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
