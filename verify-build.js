import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying build output...');

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Check if dist folder exists
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found!');
  console.log('📁 Current directory contents:');
  fs.readdirSync(__dirname).forEach(file => {
    console.log(`  - ${file}`);
  });
  process.exit(1);
}

// Check if index.html exists
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found in dist folder!');
  console.log('📁 dist folder contents:');
  fs.readdirSync(distPath).forEach(file => {
    console.log(`  - ${file}`);
  });
  process.exit(1);
}

// Check dist folder contents
const distContents = fs.readdirSync(distPath);
console.log('✅ dist folder found');
console.log('📁 dist folder contents:');
distContents.forEach(file => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    console.log(`  📁 ${file}/`);
  } else {
    console.log(`  📄 ${file} (${stats.size} bytes)`);
  }
});

console.log('✅ Build verification completed successfully!');
console.log('🚀 Frontend is ready to be served');
