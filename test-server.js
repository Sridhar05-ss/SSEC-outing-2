const { spawn } = require('child_process');

console.log('🧪 Testing minimal server...');

// Start the minimal server
const serverProcess = spawn('node', ['BACKEND/server-railway.js'], {
  stdio: 'pipe',
  detached: false,
  env: {
    ...process.env,
    NODE_ENV: 'test',
    PORT: 3002
  }
});

let serverStarted = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`🌐 Server: ${output.trim()}`);
  
  if (output.includes('Server running on port') || output.includes('🚀 Server running on port')) {
    serverStarted = true;
    console.log('✅ Server started successfully');
    
    // Test health check after 2 seconds
    setTimeout(() => {
      testHealthCheck();
    }, 2000);
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error(`🌐 Server Error: ${data.toString().trim()}`);
});

function testHealthCheck() {
  const http = require('http');
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/health',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`🏥 Health check status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('🏥 Health check response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Health check passed!');
      } else {
        console.log('❌ Health check failed!');
      }
      
      // Stop the server
      serverProcess.kill('SIGTERM');
      process.exit(0);
    });
  });
  
  req.on('error', (err) => {
    console.error('❌ Health check request failed:', err.message);
    serverProcess.kill('SIGTERM');
    process.exit(1);
  });
  
  req.end();
}

// Handle server process
serverProcess.on('close', (code) => {
  console.log(`🌐 Server process exited with code ${code}`);
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Test timeout - server did not start within 10 seconds');
  serverProcess.kill('SIGTERM');
  process.exit(1);
}, 10000);
