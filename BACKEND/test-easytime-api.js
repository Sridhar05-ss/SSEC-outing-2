// Test script for EasyTime Pro API integration
const { easyTimeProAPI } = require('./services/apiService');

async function testEasyTimeProAPI() {
  console.log('🧪 Testing EasyTime Pro API Integration...\n');

  try {
    // Test 1: Authentication
    console.log('1. Testing Authentication...');
    const authResult = await easyTimeProAPI.authenticate({
      username: 'admin',
      password: 'Admin@123'
    });

    if (authResult.success) {
      console.log('✅ Authentication successful!');
      console.log('Token received:', authResult.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Authentication failed:', authResult.error);
      return;
    }

    // Test 2: Add Staff Member
    console.log('\n2. Testing Add Staff Member...');
    const testStaffData = {
      emp_code: 'TEST001',
      first_name: 'John Doe',
      department: 1,
      position: 1,
      area: 2
    };

    const addResult = await easyTimeProAPI.addStaffMember(testStaffData);

    if (addResult.success) {
      console.log('✅ Staff member added successfully!');
      console.log('Response data:', addResult.data);
    } else {
      console.log('❌ Failed to add staff member:', addResult.error);
    }

    // Test 3: Get Staff Members
    console.log('\n3. Testing Get Staff Members...');
    const getResult = await easyTimeProAPI.getStaffMembers();

    if (getResult.success) {
      console.log('✅ Staff members retrieved successfully!');
      console.log('Number of staff members:', getResult.data?.length || 'Unknown');
    } else {
      console.log('❌ Failed to get staff members:', getResult.error);
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testEasyTimeProAPI();
