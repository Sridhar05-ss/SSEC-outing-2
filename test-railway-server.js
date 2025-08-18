const { spawn } = require('child_process');
const http = require('http');

console.log('🧪 Testing Railway server with external dependencies...');

// Start the Railway server
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
let testsCompleted = 0;
const totalTests = 5;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`🌐 Server: ${output.trim()}`);
  
  if (output.includes('Server successfully started') || output.includes('Server is ready')) {
    serverStarted = true;
    console.log('✅ Server started successfully');
    
    // Run tests after server is ready
    setTimeout(() => {
      runTests();
    }, 2000); // Give more time for dependencies to load
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error(`🌐 Server Error: ${data.toString().trim()}`);
});

function runTests() {
  console.log('\n🧪 Running Railway health check tests...\n');
  
  // Test 1: Root endpoint (Railway requirement)
  testEndpoint('/', 'Root endpoint', () => {
    // Test 2: Health endpoint
    testEndpoint('/health', 'Health endpoint', () => {
      // Test 3: API status endpoint
      testEndpoint('/api/status', 'API status endpoint', () => {
        // Test 4: Check services status
        testServicesStatus(() => {
          // Test 5: Catch-all endpoint
          testEndpoint('/random-path', 'Catch-all endpoint', () => {
            console.log('\n🎉 All tests completed!');
            serverProcess.kill('SIGTERM');
            process.exit(0);
          });
        });
      });
    });
  });
}

function testEndpoint(path, description, callback) {
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: path,
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      testsCompleted++;
      
      if (res.statusCode === 200) {
        console.log(`✅ ${description} (${path}) - Status: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(data);
          console.log(`   Response: ${jsonData.message || 'OK'}`);
          
          // Check if services are loaded
          if (jsonData.services) {
            console.log(`   Services: ZKTeco=${jsonData.services.zkteco}, EasyTime=${jsonData.services.easytime}, Firebase=${jsonData.services.firebase}`);
          }
        } catch (e) {
          console.log(`   Response: ${data.substring(0, 100)}...`);
        }
      } else {
        console.log(`❌ ${description} (${path}) - Status: ${res.statusCode}`);
        console.log(`   Response: ${data}`);
      }
      
      callback();
    });
  });
  
  req.on('error', (err) => {
    console.error(`❌ ${description} (${path}) - Request failed: ${err.message}`);
    testsCompleted++;
    callback();
  });
  
  req.end();
}

function testServicesStatus(callback) {
  console.log('\n🔍 Testing external services status...');
  
  // Test ZKTeco endpoint if available
  testEndpoint('/api/zkteco/status', 'ZKTeco service', () => {
    // Test EasyTime endpoint if available
    testEndpoint('/api/easytime/status', 'EasyTime service', () => {
      callback();
    });
  });
}

// Handle server process
serverProcess.on('close', (code) => {
  console.log(`🌐 Server process exited with code ${code}`);
  if (code !== 0) {
    console.error('❌ Server failed to start properly');
    process.exit(1);
  }
});

serverProcess.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Timeout after 20 seconds (more time for dependencies)
setTimeout(() => {
  console.error('❌ Test timeout - server did not start within 20 seconds');
  serverProcess.kill('SIGTERM');
  process.exit(1);
}, 20000);
