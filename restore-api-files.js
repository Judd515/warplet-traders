/**
 * Script to restore all API files after a minimal deployment
 */

const fs = require('fs');
const path = require('path');

function restoreApiFiles() {
  console.log('Restoring API files from backup...');
  
  const backupDir = path.join(__dirname, '.api_backup');
  const apiDir = path.join(__dirname, 'api');
  
  // Check if backup directory exists
  if (!fs.existsSync(backupDir)) {
    console.error('Error: Backup directory .api_backup/ not found');
    console.log('No files to restore.');
    return;
  }
  
  // Get all files in the backup directory
  const backupFiles = fs.readdirSync(backupDir);
  
  // Restore each file
  let restoredCount = 0;
  backupFiles.forEach(file => {
    const source = path.join(backupDir, file);
    const dest = path.join(apiDir, file);
    
    if (fs.statSync(source).isFile()) {
      fs.copyFileSync(source, dest);
      restoredCount++;
    }
  });
  
  console.log(`Restored ${restoredCount} API files from backup`);
  
  // Reset .vercelignore to its previous state
  if (fs.existsSync(path.join(__dirname, '.vercelignore.bak'))) {
    fs.copyFileSync(
      path.join(__dirname, '.vercelignore.bak'),
      path.join(__dirname, '.vercelignore')
    );
    console.log('Restored original .vercelignore file');
  } else {
    // Create a minimal .vercelignore that doesn't exclude API files
    const vercelIgnore = '# Default .vercelignore\n# No API files excluded\n';
    fs.writeFileSync(path.join(__dirname, '.vercelignore'), vercelIgnore);
    console.log('Created new .vercelignore file (no API files excluded)');
  }
  
  console.log('\nAll API files have been restored!');
}

// Run the script
restoreApiFiles();