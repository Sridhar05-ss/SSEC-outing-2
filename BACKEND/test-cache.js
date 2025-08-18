// Test script for transaction caching functionality
const { easyTimeProAPI } = require('./services/apiService');

async function testCache() {
  console.log('=== Testing Transaction Cache ===');
  
  try {
    // Test 1: Get cache statistics
    console.log('\n1. Getting cache statistics...');
    const stats = easyTimeProAPI.getCachedTransactions();
    console.log(`Current cached transactions: ${stats.length}`);
    
    // Test 2: Fetch transactions (this will populate cache)
    console.log('\n2. Fetching transactions from EasyTime Pro...');
    const result = await easyTimeProAPI.getTransactionLogs(1000);
    
    if (result.success) {
      console.log(`Total transactions: ${result.data.count}`);
      console.log(`New transactions: ${result.data.newTransactions}`);
      console.log(`Cached transactions: ${result.data.cachedTransactions}`);
      
      if (result.data.note) {
        console.log(`Note: ${result.data.note}`);
      }
    } else {
      console.log('Failed to fetch transactions:', result.error);
    }
    
    // Test 3: Get updated cache statistics
    console.log('\n3. Updated cache statistics...');
    const updatedStats = easyTimeProAPI.getCachedTransactions();
    console.log(`Cached transactions after fetch: ${updatedStats.length}`);
    
    // Test 4: Show sample transactions
    if (updatedStats.length > 0) {
      console.log('\n4. Sample cached transactions:');
      updatedStats.slice(0, 3).forEach((tx, index) => {
        console.log(`  ${index + 1}. ${tx.emp_code} - ${tx.punch_time} - ${tx.punch_state}`);
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testCache();
