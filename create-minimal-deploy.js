/**
 * Simple script to create a minimal deployment package
 * This avoids the 12 function limit on Vercel Hobby plan
 */

const fs = require('fs');
const path = require('path');

// Define the essential API files to keep
const essentialApiFiles = [
  'warpcast-stable.js',   // Our new ultra-stable endpoint
  'health.js',            // Health check endpoint
  'index.js',             // Main API entry point
  'frame-action.js',      // Frame action handler
  'minimal.js'            // Minimal implementation
];

// Create a .vercelignore file that excludes everything except essentials
function createVercelIgnore() {
  console.log('Creating .vercelignore file...');
  
  // Start with ignoring all API files
  const apiDir = path.join(__dirname, 'api');
  const apiFiles = fs.readdirSync(apiDir);
  
  // Create the ignore content
  let ignoreContent = '# Auto-generated .vercelignore\n';
  ignoreContent += '# Excludes all API files except essentials\n\n';
  
  // Add all API files except essentials to ignore list
  apiFiles.forEach(file => {
    if (!essentialApiFiles.includes(file)) {
      ignoreContent += `api/${file}\n`;
    }
  });
  
  // Write the file
  fs.writeFileSync(path.join(__dirname, '.vercelignore'), ignoreContent);
  console.log(`Created .vercelignore with ${apiFiles.length - essentialApiFiles.length} API files excluded`);
}

// Create a hidden backup of each file in the api folder
function backupApiFiles() {
  console.log('Backing up API files...');
  
  const apiDir = path.join(__dirname, 'api');
  const apiFiles = fs.readdirSync(apiDir);
  
  // Create backup folder if it doesn't exist
  const backupDir = path.join(__dirname, '.api_backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  // Copy each file to the backup
  apiFiles.forEach(file => {
    const source = path.join(apiDir, file);
    const dest = path.join(backupDir, file);
    
    if (fs.statSync(source).isFile()) {
      fs.copyFileSync(source, dest);
    }
  });
  
  console.log(`Backed up ${apiFiles.length} API files to .api_backup/`);
}

// Main function
function createMinimalDeploy() {
  console.log('Creating minimal deployment package...');
  
  // 1. Backup all API files
  backupApiFiles();
  
  // 2. Create .vercelignore
  createVercelIgnore();
  
  console.log('\nMinimal deployment package created!');
  console.log('Deploy with: vercel --prod');
  console.log('\nTo restore all API files after deployment, run:');
  console.log('node restore-api-files.js');
}

// Run the script
createMinimalDeploy();