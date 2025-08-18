const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build process...');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ dist directory not found! Build may have failed.');
  process.exit(1);
}

// Check if index.html exists
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found in dist directory!');
  process.exit(1);
}

// Check if assets directory exists
const assetsPath = path.join(distPath, 'assets');
if (!fs.existsSync(assetsPath)) {
  console.error('❌ assets directory not found in dist directory!');
  process.exit(1);
}

console.log('✅ Build verification successful!');
console.log('📁 dist directory exists');
console.log('📄 index.html exists');
console.log('📦 assets directory exists');

// List some files in dist for debugging
console.log('\n📋 Files in dist directory:');
const files = fs.readdirSync(distPath);
files.forEach(file => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    console.log(`  📁 ${file}/`);
  } else {
    console.log(`  📄 ${file}`);
  }
});
