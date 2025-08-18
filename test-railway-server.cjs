const { spawn } = require('child_process');
const http = require('http');

console.log('🧪 Testing Railway server startup...');

// Start the server
const serverProcess = spawn('node', ['BACKEND/server-railway.js'], {
  stdio: 'pipe',
  env: {
    ...process.env,
    PORT: 3002,
    NODE_ENV: 'test'
  }
});

let serverStarted = false;
let healthCheckPassed = false;

// Monitor server output
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`🌐 Server: ${output.trim()}`);
  
  if (output.includes('Server successfully started')) {
    serverStarted = true;
    console.log('✅ Server started successfully');
    
    // Test health check after 1 second
    setTimeout(testHealthCheck, 1000);
  }
});

serverProcess.stderr.on('data', (data) => {
  const error = data.toString();
  console.error(`🌐 Server Error: ${error.trim()}`);
});

// Test health check
function testHealthCheck() {
  console.log('🏥 Testing health check...');
  
  const req = http.get('http://localhost:3002/health', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.status === 'ok') {
          healthCheckPassed = true;
          console.log('✅ Health check passed');
          console.log('📊 Response:', response);
        } else {
          console.error('❌ Health check failed - invalid status');
        }
      } catch (error) {
        console.error('❌ Health check failed - invalid JSON');
      }
      
      // Clean up
      serverProcess.kill('SIGTERM');
      setTimeout(() => {
        if (healthCheckPassed) {
          console.log('🎉 All tests passed!');
          process.exit(0);
        } else {
          console.error('❌ Tests failed');
          process.exit(1);
        }
      }, 1000);
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Health check request failed:', error.message);
    serverProcess.kill('SIGTERM');
    process.exit(1);
  });
  
  req.setTimeout(5000, () => {
    console.error('❌ Health check timeout');
    serverProcess.kill('SIGTERM');
    process.exit(1);
  });
}

// Handle server process exit
serverProcess.on('close', (code) => {
  console.log(`🌐 Server process exited with code ${code}`);
});

// Handle test timeout
setTimeout(() => {
  console.error('❌ Test timeout - server did not start within 10 seconds');
  serverProcess.kill('SIGTERM');
  process.exit(1);
}, 10000);
