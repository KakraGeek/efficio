// This script generates two PNG icons for PWA: 192x192 and 512x512 with a colored background and the letter 'E'.
// Run: npm install canvas
// Then: node generate-pwa-icons.js

const { createCanvas } = require('canvas');
const fs = require('fs');

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background color
  ctx.fillStyle = '#2563eb'; // Efficio blue
  ctx.fillRect(0, 0, size, size);

  // Draw the letter 'E'
  ctx.font = `${size * 0.7}px sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', size / 2, size / 2);

  // Save to file
  const out = fs.createWriteStream(`public/${filename}`);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => console.log(`Created ${filename}`));
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

createIcon(192, 'icon-192x192.png');
createIcon(512, 'icon-512x512.png');
