const fs = require('fs');
const path = require('path');

// Simple 1x1 pixel PNG in base64
// This is a valid 1x1 green PNG that we'll use as placeholder
const greenPixelPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const assetsDir = path.join(__dirname, 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create icon.png (1024x1024 placeholder)
fs.writeFileSync(path.join(assetsDir, 'icon.png'), greenPixelPNG);
console.log('✅ Created icon.png');

// Create splash.png (1242x2436 placeholder)
fs.writeFileSync(path.join(assetsDir, 'splash.png'), greenPixelPNG);
console.log('✅ Created splash.png');

// Create adaptive-icon.png (1024x1024 placeholder)
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), greenPixelPNG);
console.log('✅ Created adaptive-icon.png');

// Create favicon.png (48x48 placeholder)
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), greenPixelPNG);
console.log('✅ Created favicon.png');

console.log('\n✨ All placeholder images created!');
console.log('Note: These are 1x1 pixel placeholders. Replace them with proper images later.');
