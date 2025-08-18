const axios = require('axios');

const BACKEND_URL = 'http://127.0.0.1:3001';

async function testTransactions() {
  console.log('Testing transaction retrieval with maximum limits...');
  
  try {
    // Test 1: Default limit (should be 10000 now)
    console.log('\n1. Testing default transaction limit...');
    const defaultResponse = await axios.get(`${BACKEND_URL}/api/easytime/transactions`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Default response:', {
      success: defaultResponse.data.success,
      count: defaultResponse.data.data?.length || 0,
      metadata: defaultResponse.data.metadata
    });
    
    // Test 2: Maximum limit (50000)
    console.log('\n2. Testing maximum transaction limit...');
    const maxResponse = await axios.get(`${BACKEND_URL}/api/easytime/transactions?limit=50000`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Maximum limit response:', {
      success: maxResponse.data.success,
      count: maxResponse.data.data?.length || 0,
      metadata: maxResponse.data.metadata
    });
    
    // Test 3: Very high limit (should be capped at 50000)
    console.log('\n3. Testing very high limit (should be capped)...');
    const highResponse = await axios.get(`${BACKEND_URL}/api/easytime/transactions?limit=100000`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ High limit response:', {
      success: highResponse.data.success,
      count: highResponse.data.data?.length || 0,
      metadata: highResponse.data.metadata
    });
    
    // Test 4: Small limit for comparison
    console.log('\n4. Testing small limit for comparison...');
    const smallResponse = await axios.get(`${BACKEND_URL}/api/easytime/transactions?limit=50`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Small limit response:', {
      success: smallResponse.data.success,
      count: smallResponse.data.data?.length || 0,
      metadata: smallResponse.data.metadata
    });
    
    console.log('\n📊 Summary:');
    console.log(`- Default limit retrieved: ${defaultResponse.data.data?.length || 0} transactions`);
    console.log(`- Maximum limit retrieved: ${maxResponse.data.data?.length || 0} transactions`);
    console.log(`- High limit (capped) retrieved: ${highResponse.data.data?.length || 0} transactions`);
    console.log(`- Small limit retrieved: ${smallResponse.data.data?.length || 0} transactions`);
    
    // Check if we're getting more than 10 transactions
    const maxCount = Math.max(
      defaultResponse.data.data?.length || 0,
      maxResponse.data.data?.length || 0,
      highResponse.data.data?.length || 0,
      smallResponse.data.data?.length || 0
    );
    
    if (maxCount > 10) {
      console.log(`\n✅ SUCCESS: Retrieved ${maxCount} transactions (more than the previous 10 limit)`);
    } else {
      console.log(`\n⚠️  WARNING: Only retrieved ${maxCount} transactions. This might indicate a server-side limit.`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the test
testTransactions();

