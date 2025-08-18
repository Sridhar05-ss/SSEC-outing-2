import http from 'http';

console.log('🔍 Testing health check endpoint...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Health check response: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Health check JSON response:');
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.status === 'ok') {
        console.log('🎉 Health check PASSED!');
        process.exit(0);
      } else {
        console.log('❌ Health check FAILED - status not ok');
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Health check FAILED - invalid JSON response');
      console.log('Response data:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Health check FAILED - connection error:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Health check FAILED - timeout');
  req.destroy();
  process.exit(1);
});

req.end();
