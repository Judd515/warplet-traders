// A simple Node.js script to move unwanted API files to a temporary directory
// This is an alternative approach to the shell script

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create backup directory
const backupDir = '.api_backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Get all files in the API directory
const apiDir = path.join(__dirname, 'api');
const files = fs.readdirSync(apiDir);

console.log('Current API files:', files);

// Keep only all-routes.js
for (const file of files) {
  if (file !== 'all-routes.js' && file !== 'tsconfig.json') {
    const srcPath = path.join(apiDir, file);
    const destPath = path.join(backupDir, file);
    
    console.log(`Moving ${file} to backup`);
    fs.renameSync(srcPath, destPath);
  } else {
    console.log(`Keeping ${file}`);
  }
}

console.log('Remaining API files:', fs.readdirSync(apiDir));
console.log('API files successfully hidden for Vercel deployment');