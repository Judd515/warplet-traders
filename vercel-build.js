// This file is used by Vercel to build the project
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Print environment for debugging
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);

// Function to execute shell commands
function exec(cmd) {
  console.log(`Executing: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${cmd}`);
    console.error(error);
    process.exit(1);
  }
}

// Ensure the build directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Run the build script
exec('bash ./build.sh');

console.log('Build completed successfully!');