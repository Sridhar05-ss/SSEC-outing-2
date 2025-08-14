const axios = require('axios');

// Test staff addition to EasyTime Pro
async function testStaffAddition() {
  const backendUrl = 'http://localhost:3001';
  const testStaffData = {
    emp_code: 'TEST001',
    first_name: 'Test User',
    department: 1,
    position: 1,
    area: [2],
    area_code: "2",
    area_name: "HO"
  };

  console.log('Testing staff addition...');
  console.log('Backend URL:', backendUrl);
  console.log('Test staff data:', testStaffData);

  try {
    // Test the add-employee endpoint
    console.log('\nSending request to add employee...');
    const response = await axios.post(`${backendUrl}/api/easytime/add-employee`, testStaffData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    
    console.log('✅ Staff addition successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.log('❌ Staff addition failed');
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 401 Unauthorized - This might be an authentication issue');
      console.log('Check if EasyTime Pro credentials are correct');
    }
  }
}

// Run the test
testStaffAddition().catch(console.error);

