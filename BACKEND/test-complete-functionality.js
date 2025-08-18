const axios = require('axios');

const EASYTIME_PRO_URL = 'http://127.0.0.1:8081';
const BACKEND_URL = 'http://127.0.0.1:3001';

async function testCompleteFunctionality() {
  console.log('Testing complete EasyTime Pro functionality...');
  
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
    
    // Step 2: Test backend add employee
    console.log('\n2. Testing backend add employee...');
    const testEmployee = {
      emp_code: 'TEST_COMPLETE_001',
      first_name: 'Test Complete User',
      department: 6, // CSE
      position: 16, // Non teaching
      area: [2],
      area_code: "2",
      area_name: "HO"
    };
    
    const addResponse = await axios.post(`${BACKEND_URL}/api/easytime/add-employee`, testEmployee, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Backend add employee response:', addResponse.data);
    
    // Step 3: Test backend get employee
    console.log('\n3. Testing backend get employee...');
    const getResponse = await axios.get(`${BACKEND_URL}/api/easytime/get-employee/TEST_COMPLETE_001`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Backend get employee response:', getResponse.data);
    
    if (getResponse.data.success && getResponse.data.data) {
      const employeeId = getResponse.data.data.id;
      
      // Step 4: Test backend update employee
      console.log('\n4. Testing backend update employee...');
      const updateData = {
        emp_code: 'TEST_COMPLETE_001',
        first_name: 'Updated Test User',
        department: 7, // ECE
        position: 8, // Principal
        area: [2],
        area_code: "2",
        area_name: "HO"
      };
      
      const updateResponse = await axios.patch(`${BACKEND_URL}/api/easytime/update-employee/${employeeId}`, updateData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Backend update employee response:', updateResponse.data);
      
      // Step 5: Test backend delete employee
      console.log('\n5. Testing backend delete employee...');
      const deleteResponse = await axios.delete(`${BACKEND_URL}/api/easytime/delete-employee/TEST_COMPLETE_001`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Backend delete employee response:', deleteResponse.data);
      
      // Step 6: Verify employee is deleted
      console.log('\n6. Verifying employee is deleted...');
      try {
        const verifyResponse = await axios.get(`${BACKEND_URL}/api/easytime/get-employee/TEST_COMPLETE_001`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (verifyResponse.data.success === false) {
          console.log('✅ Employee successfully deleted');
        } else {
          console.log('❌ Employee still exists:', verifyResponse.data);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('✅ Employee successfully deleted (404 response)');
        } else {
          console.log('❌ Unexpected error during verification:', error.message);
        }
      }
      
    } else {
      console.log('❌ Failed to get employee ID for testing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the test
testCompleteFunctionality();
