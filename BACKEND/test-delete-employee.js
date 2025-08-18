const axios = require('axios');

const EASYTIME_PRO_URL = 'http://127.0.0.1:8081';
const BACKEND_URL = 'http://127.0.0.1:3001';

async function testDeleteEmployee() {
  console.log('Testing delete employee functionality...');
  
  try {
    // Step 1: Authenticate with EasyTime Pro
    console.log('\n1. Authenticating with EasyTime Pro...');
    const authResponse = await axios.post(`${EASYTIME_PRO_URL}/api-token-auth/`, {
      username: 'admin',
      password: 'Admin@123'
    });
    
    if (!authResponse.data.token) {
      console.error('❌ Authentication failed');
      return;
    }
    
    const token = authResponse.data.token;
    console.log('✅ Authentication successful');
    
    // Step 2: Add a test employee
    console.log('\n2. Adding test employee...');
    const testEmployee = {
      emp_code: 'DELETE_TEST_001',
      first_name: 'Delete Test User',
      department: 6, // CSE
      position: 16, // Non teaching
      area: [2],
      area_code: "2",
      area_name: "HO"
    };
    
    const addResponse = await axios.post(`${EASYTIME_PRO_URL}/personnel/api/employees/`, testEmployee, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Test employee added with ID:', addResponse.data.id);
    const employeeId = addResponse.data.id;
    
    // Step 3: Test backend delete endpoint
    console.log('\n3. Testing backend delete endpoint...');
    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/easytime/delete-employee/DELETE_TEST_001`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Backend delete response:', deleteResponse.data);
    
    // Step 4: Verify employee is deleted
    console.log('\n4. Verifying employee is deleted...');
    const verifyResponse = await axios.get(`${EASYTIME_PRO_URL}/personnel/api/employees/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        emp_code: 'DELETE_TEST_001'
      }
    });
    
    if (verifyResponse.data.results && verifyResponse.data.results.length === 0) {
      console.log('✅ Employee successfully deleted');
    } else {
      console.log('❌ Employee still exists:', verifyResponse.data.results);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the test
testDeleteEmployee();


