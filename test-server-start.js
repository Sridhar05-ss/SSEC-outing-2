const { spawn } = require('child_process');

console.log('🧪 Testing server startup...');

const serverProcess = spawn('bun', ['BACKEND/server.js'], {
  stdio: 'pipe',
  detached: false
});

let output = '';
let errorOutput = '';

serverProcess.stdout.on('data', (data) => {
  output += data.toString();
  console.log(`📤 ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log(`❌ ${data.toString().trim()}`);
});

serverProcess.on('close', (code) => {
  console.log(`\n🏁 Server process exited with code ${code}`);
  if (code === 0) {
    console.log('✅ Server started successfully');
  } else {
    console.log('❌ Server failed to start');
    console.log('Error output:', errorOutput);
  }
  process.exit(code);
});

// Kill server after 10 seconds
setTimeout(() => {
  console.log('⏰ Killing server after 10 seconds...');
  serverProcess.kill('SIGTERM');
}, 10000);
