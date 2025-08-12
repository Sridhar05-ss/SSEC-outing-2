const axios = require('axios');

const baseUrl = 'http://localhost:8081/api/zkteco';

async function testEndpoints() {
  try {
    console.log('Testing /status');
    let res = await axios.get(\`\${baseUrl}/status\`);
    console.log('Status:', res.data);

    console.log('Testing /sync');
    res = await axios.post(\`\${baseUrl}/sync\`);
    console.log('Sync:', res.data);

    console.log('Testing /attendance');
    res = await axios.get(\`\${baseUrl}/attendance\`);
    console.log('Attendance:', res.data);

    console.log('Testing /users');
    res = await axios.get(\`\${baseUrl}/users\`);
    console.log('Users:', res.data);

    console.log('Testing /logs');
    res = await axios.get(\`\${baseUrl}/logs\`);
    console.log('Logs:', res.data);

  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testEndpoints();
