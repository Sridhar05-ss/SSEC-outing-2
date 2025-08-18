#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Setting up Railway Environment Variables...\n');

// Get Railway app name from user
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your Railway app name (e.g., ssec-outing-2): ', (appName) => {
  const railwayUrl = `https://${appName}.up.railway.app`;
  
  console.log(`\n📋 Setting up environment variables for: ${railwayUrl}\n`);
  
  // Environment variables to set
  const envVars = [
    { name: 'PORT', value: '3001' },
    { name: 'NODE_ENV', value: 'production' },
    { name: 'VITE_BACKEND_URL', value: railwayUrl },
    { name: 'VITE_EASYTIMEPRO_API_URL', value: 'http://127.0.0.1:8081' },
    { name: 'VITE_EASYTIMEPRO_USERNAME', value: 'admin' },
    { name: 'VITE_EASYTIMEPRO_PASSWORD', value: 'Admin@123' },
    { name: 'VITE_ZKTECO_API_URL', value: 'http://localhost:8000' },
    { name: 'VITE_FIREBASE_API_KEY', value: 'AIzaSyAWKmpLqiOApfLb9OGa2WEfs_AmPiItA2g' },
    { name: 'VITE_FIREBASE_AUTH_DOMAIN', value: 'ssec-outing.firebaseapp.com' },
    { name: 'VITE_FIREBASE_DATABASE_URL', value: 'https://ssec-outing-default-rtdb.asia-southeast1.firebasedatabase.app' },
    { name: 'VITE_FIREBASE_PROJECT_ID', value: 'ssec-outing' },
    { name: 'VITE_FIREBASE_STORAGE_BUCKET', value: 'ssec-outing.firebasestorage.app' },
    { name: 'VITE_FIREBASE_MESSAGING_SENDER_ID', value: '286869609907' },
    { name: 'VITE_FIREBASE_APP_ID', value: '1:286869609907:web:91bee1c3ddbdffdaa47fc6' },
    { name: 'VITE_FIREBASE_MEASUREMENT_ID', value: 'G-3DPMH890P2' }
  ];
  
  console.log('🔧 Setting environment variables...\n');
  
  envVars.forEach((envVar, index) => {
    try {
      console.log(`[${index + 1}/${envVars.length}] Setting ${envVar.name}...`);
      execSync(`railway variables set ${envVar.name}=${envVar.value}`, { stdio: 'pipe' });
      console.log(`✅ ${envVar.name} set successfully`);
    } catch (error) {
      console.log(`❌ Failed to set ${envVar.name}: ${error.message}`);
    }
  });
  
  console.log('\n🎉 Environment variables setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Check your Railway dashboard to verify all variables are set');
  console.log('2. Trigger a new deployment');
  console.log('3. Test your application at:', railwayUrl);
  
  rl.close();
});
