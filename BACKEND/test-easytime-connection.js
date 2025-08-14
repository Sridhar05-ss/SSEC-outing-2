const axios = require('axios');

// Test EasyTime Pro connection and authentication
async function testEasyTimeProConnection() {
  const baseUrl = 'http://127.0.0.1:8081';
  const credentials = {
    username: 'admin',
    password: 'Admin@123'
  };

  console.log('Testing EasyTime Pro connection...');
  console.log('Base URL:', baseUrl);
  console.log('Credentials:', credentials);

  try {
    // Test 1: Check if EasyTime Pro is accessible
    console.log('\n1. Testing basic connectivity...');
    const healthCheck = await axios.get(baseUrl, { timeout: 5000 });
    console.log('✅ EasyTime Pro is accessible');
    console.log('Status:', healthCheck.status);
  } catch (error) {
    console.log('❌ EasyTime Pro is not accessible');
    console.log('Error:', error.message);
    return;
  }

  try {
    // Test 2: Test authentication
    console.log('\n2. Testing authentication...');
    const authResponse = await axios.post(`${baseUrl}/api-token-auth/`, credentials, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ Authentication successful');
    console.log('Response:', authResponse.data);
    
    if (authResponse.data.token) {
      const token = authResponse.data.token;
      console.log('Token received:', token.substring(0, 20) + '...');
      
      // Test 3: Test API endpoint
      console.log('\n3. Testing API endpoint...');
      const apiResponse = await axios.get(`${baseUrl}/personnel/api/employees/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ API endpoint accessible');
      console.log('Response status:', apiResponse.status);
      console.log('Response data length:', JSON.stringify(apiResponse.data).length);
      
    } else {
      console.log('❌ No token received in response');
    }
    
  } catch (error) {
    console.log('❌ Authentication failed');
    console.log('Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

// Run the test
testEasyTimeProConnection().catch(console.error);
