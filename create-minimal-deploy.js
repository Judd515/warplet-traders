#!/usr/bin/env node

/**
 * Simple script to create a minimal deployment package
 * This avoids the 12 function limit on Vercel Hobby plan
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create deployment directory
const deployDir = 'deploy';
if (fs.existsSync(deployDir)) {
  console.log('Cleaning up existing deploy directory...');
  execSync(`rm -rf ${deployDir}`);
}

// Create directory structure
console.log('Creating deployment directory structure...');
fs.mkdirSync(deployDir);
fs.mkdirSync(path.join(deployDir, 'api'));
fs.mkdirSync(path.join(deployDir, 'public'));

// Copy essential files
console.log('Copying essential files...');

// Copy all-routes.js (only API file needed)
fs.copyFileSync(
  path.join(__dirname, 'api', 'all-routes.js'),
  path.join(deployDir, 'api', 'all-routes.js')
);

// Copy public files (index.html and images)
try {
  fs.copyFileSync(
    path.join(__dirname, 'public', 'index.html'),
    path.join(deployDir, 'public', 'index.html')
  );
  
  // Copy og.png if it exists (required for frame)
  if (fs.existsSync(path.join(__dirname, 'public', 'og.png'))) {
    fs.copyFileSync(
      path.join(__dirname, 'public', 'og.png'),
      path.join(deployDir, 'public', 'og.png')
    );
  }
} catch (err) {
  console.warn('Warning: Could not copy some public files', err.message);
}

// Copy Vercel configuration
fs.copyFileSync(
  path.join(__dirname, 'vercel.json'),
  path.join(deployDir, 'vercel.json')
);

// Create a minimal package.json
const packageJson = {
  "name": "warplet-top-traders",
  "version": "1.0.0",
  "description": "Top Warplet Traders Frame App",
  "dependencies": {
    "express": "^4.18.2",
    "@neondatabase/serverless": "^0.8.1",
    "ws": "^8.16.0"
  }
};

fs.writeFileSync(
  path.join(deployDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Create a simplified README
const readmeContent = `# Minimal Warplet Top Traders Deployment

This is a minimal deployment package created for the Vercel Hobby plan.
It contains only the essential files needed to run the app while staying
under the 12 serverless function limit.

## Deployment

To deploy this package:

\`\`\`bash
cd deploy
vercel
\`\`\`
`;

fs.writeFileSync(
  path.join(deployDir, 'README.md'),
  readmeContent
);

console.log('\nDeployment package created successfully!');
console.log('Directory contents:');
console.log('-----------------------------------');
execSync(`ls -la ${deployDir}`, { stdio: 'inherit' });
console.log('-----------------------------------');
execSync(`ls -la ${deployDir}/api`, { stdio: 'inherit' });
console.log('-----------------------------------');
execSync(`ls -la ${deployDir}/public`, { stdio: 'inherit' });

console.log('\nTo deploy, run:');
console.log('cd deploy && vercel');