// routes/zktecoRoutes.js
const express = require('express');
const router = express.Router();
const { easyTimeProAPI } = require('../services/apiService');

// Test endpoint to verify the route is working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ZKteco routes are working',
    timestamp: new Date().toISOString()
  });
});

// Get ZKteco transactions
router.get('/transactions', async (req, res) => {
  try {
    const { limit = 10000 } = req.query;
    console.log(`Fetching ZKteco transactions with limit: ${limit}...`);
    
    // Authenticate if needed
    if (!easyTimeProAPI.accessToken) {
      const authResult = await easyTimeProAPI.authenticate({ username: 'admin', password: 'Admin@123' });
      if (!authResult.success) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication failed: ' + authResult.error 
        });
      }
    }
    
    // Use the existing getTransactionLogs method with configurable limit
    const txResult = await easyTimeProAPI.getTransactionLogs(parseInt(limit));
    if (!txResult.success) {
      return res.status(500).json({ 
        success: false, 
        error: txResult.error || 'Failed to fetch transactions' 
      });
    }

    console.log('ZKteco API response received');
    console.log('Full API response structure:', JSON.stringify(txResult, null, 2));
    console.log('ZKteco transactions count:', txResult.data?.data?.length || 0);
    console.log('Requested limit:', limit);
    console.log('Actual transactions retrieved:', txResult.data?.data?.length || 0);
    
    // Debug: Show sample transactions
    if (txResult.data?.data && txResult.data.data.length > 0) {
      console.log('Sample transactions:');
      txResult.data.data.slice(0, 3).forEach((tx, index) => {
        console.log(`Transaction ${index + 1}:`, JSON.stringify(tx, null, 2));
      });
    } else {
      console.log('No transactions found or data structure is different');
      console.log('Available keys in txResult.data:', Object.keys(txResult.data || {}));
    }

    // Handle different possible response structures
    let transactions = [];
    if (txResult.data?.data) {
      transactions = txResult.data.data;
    } else if (txResult.data?.results) {
      transactions = txResult.data.results;
    } else if (Array.isArray(txResult.data)) {
      transactions = txResult.data;
    } else if (txResult.data) {
      // If data is not an array, try to find the array within it
      const keys = Object.keys(txResult.data);
      for (const key of keys) {
        if (Array.isArray(txResult.data[key])) {
          transactions = txResult.data[key];
          break;
        }
      }
    }
    
    console.log('Final transactions to send:', transactions.length);
    console.log('Sample transaction structure:', transactions[0]);
    
    res.json({
      success: true,
      data: transactions,
      message: 'ZKteco transactions fetched successfully',
      metadata: {
        totalTransactions: transactions.length,
        newTransactions: txResult.data?.newTransactions || 0,
        cachedTransactions: txResult.data?.cachedTransactions || 0,
        note: txResult.data?.note || null
      }
    });

  } catch (error) {
    console.error('Error fetching ZKteco transactions:', error.message);
    
    if (error.response) {
      console.error('ZKteco API error response:', error.response.status, error.response.data);
      res.status(error.response.status).json({
        success: false,
        error: `ZKteco API error: ${error.response.status} - ${error.response.statusText}`,
        details: error.response.data
      });
    } else if (error.request) {
      console.error('ZKteco API request error:', error.request);
      res.status(503).json({
        success: false,
        error: 'ZKteco API is not reachable. Please check if EasyTime Pro is running.',
        details: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error while fetching ZKteco transactions',
        details: error.message
      });
    }
  }
});

// Clear transaction cache
router.delete('/cache', async (req, res) => {
  try {
    console.log('Clearing transaction cache...');
    
    // Clear the cache
    easyTimeProAPI.transactionCache.clear();
    await easyTimeProAPI.saveTransactionCache();
    
    res.json({
      success: true,
      message: 'Transaction cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing transaction cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear transaction cache'
    });
  }
});

// Get cache statistics
router.get('/cache/stats', async (req, res) => {
  try {
    const cachedTransactions = easyTimeProAPI.getCachedTransactions();
    
    res.json({
      success: true,
      data: {
        totalCachedTransactions: cachedTransactions.length,
        cacheSize: JSON.stringify(cachedTransactions).length,
        oldestTransaction: cachedTransactions.length > 0 ? 
          cachedTransactions.reduce((oldest, current) => 
            new Date(current.punch_time) < new Date(oldest.punch_time) ? current : oldest
          ).punch_time : null,
        newestTransaction: cachedTransactions.length > 0 ? 
          cachedTransactions.reduce((newest, current) => 
            new Date(current.punch_time) > new Date(newest.punch_time) ? current : newest
          ).punch_time : null
      }
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics'
    });
  }
});

module.exports = router;
