// Script to prepare a minimal deployable version
// This creates a new directory with only the essential files needed for deployment

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create deployment directory
const deployDir = 'deploy';
if (fs.existsSync(deployDir)) {
  console.log('Cleaning up existing deploy directory...');
  execSync(`rm -rf ${deployDir}`);
}

console.log('Creating deployment directory...');
fs.mkdirSync(deployDir);
fs.mkdirSync(path.join(deployDir, 'api'));
fs.mkdirSync(path.join(deployDir, 'public'));

// Copy only the essential files
console.log('Copying essential files...');

// Copy all-routes.js (only API file needed)
fs.copyFileSync(
  path.join(__dirname, 'api', 'all-routes.js'),
  path.join(deployDir, 'api', 'all-routes.js')
);

// Copy public files
const publicFiles = fs.readdirSync(path.join(__dirname, 'public'));
for (const file of publicFiles) {
  if (file.endsWith('.png') || file === 'index.html') {
    fs.copyFileSync(
      path.join(__dirname, 'public', file),
      path.join(deployDir, 'public', file)
    );
  }
}

// Copy Vercel configuration
fs.copyFileSync(
  path.join(__dirname, 'vercel.json'),
  path.join(deployDir, 'vercel.json')
);

// Create a basic package.json
const packageJson = {
  name: "warplet-top-traders",
  version: "1.0.0",
  description: "Top Warplet Traders App",
  dependencies: {
    "express": "^4.18.2"
  }
};

fs.writeFileSync(
  path.join(deployDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

console.log('Deployment directory created successfully:');
console.log('-----------------------------------');
execSync(`ls -la ${deployDir}`, { stdio: 'inherit' });
console.log('-----------------------------------');
execSync(`ls -la ${deployDir}/api`, { stdio: 'inherit' });
console.log('-----------------------------------');
execSync(`ls -la ${deployDir}/public`, { stdio: 'inherit' });

console.log('\nTo deploy, run:');
console.log('cd deploy && vercel');