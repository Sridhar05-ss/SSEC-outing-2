const axios = require('axios');

const EASYTIME_PRO_URL = 'http://127.0.0.1:8081';

async function testEasyTimeProConnection() {
  console.log('Testing EasyTime Pro connection...');
  console.log('URL:', EASYTIME_PRO_URL);
  
  try {
    // Test 1: Check if server is reachable
    console.log('\n1. Testing server reachability...');
    const healthResponse = await axios.get(`${EASYTIME_PRO_URL}/`);
    console.log('✅ Server is reachable');
    console.log('Response:', healthResponse.data);
    
    // Test 2: Test authentication
    console.log('\n2. Testing authentication...');
    const authResponse = await axios.post(`${EASYTIME_PRO_URL}/api-token-auth/`, {
      username: 'admin',
      password: 'Admin@123'
    });
    
    if (authResponse.data.token) {
      console.log('✅ Authentication successful');
      console.log('Token received:', authResponse.data.token.substring(0, 20) + '...');
      
      const token = authResponse.data.token;
      
      // Test 3: Test getting employees
      console.log('\n3. Testing get employees...');
      const employeesResponse = await axios.get(`${EASYTIME_PRO_URL}/personnel/api/employees/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Get employees successful');
      console.log('Total employees:', employeesResponse.data.count || 0);
      
      // Test 4: Test adding an employee
      console.log('\n4. Testing add employee...');
      const testEmployee = {
        emp_code: 'TEST001',
        first_name: 'Test User',
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
      
      console.log('✅ Add employee successful');
      console.log('Employee ID:', addResponse.data.id);
      
      // Test 5: Test deleting the test employee
      console.log('\n5. Testing delete employee...');
      await axios.delete(`${EASYTIME_PRO_URL}/personnel/api/employees/${addResponse.data.id}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Delete employee successful');
      
    } else {
      console.log('❌ Authentication failed - no token received');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Run the test
testEasyTimeProConnection();
