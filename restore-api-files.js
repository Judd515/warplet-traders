// A simple Node.js script to restore API files from the temporary directory
// This is an alternative approach to the shell script

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if backup directory exists
const backupDir = '.api_backup';
if (!fs.existsSync(backupDir)) {
  console.log('Backup directory not found. Nothing to restore.');
  process.exit(0);
}

// Get all files in the backup directory
const files = fs.readdirSync(backupDir);
const apiDir = path.join(__dirname, 'api');

console.log('Current API files:', fs.readdirSync(apiDir));
console.log('Files to restore:', files);

// Restore files from backup
for (const file of files) {
  const srcPath = path.join(backupDir, file);
  const destPath = path.join(apiDir, file);
  
  console.log(`Restoring ${file}`);
  fs.renameSync(srcPath, destPath);
}

// Remove the backup directory
fs.rmdirSync(backupDir);

console.log('Restored API files:', fs.readdirSync(apiDir));
console.log('API files successfully restored');