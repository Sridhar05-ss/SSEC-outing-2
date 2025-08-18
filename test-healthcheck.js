const http = require('http');

const PORT = process.env.PORT || 3001;
const HOST = 'localhost';

console.log(`Testing healthcheck on ${HOST}:${PORT}/health`);

const options = {
  hostname: HOST,
  port: PORT,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Healthcheck response:', response);
      console.log('✅ Healthcheck working!');
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Healthcheck failed:', error.message);
});

req.on('timeout', () => {
  console.error('❌ Healthcheck timeout');
  req.destroy();
});

req.end();
