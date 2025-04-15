/**
 * Script to update all OG image references in the project
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Current version tag for cache-busting
const NEW_VERSION = '20250415';

// Files to update
const filesToUpdate = [
  'client/index.html',
  'public/index.html',
  'api/all-routes.js',
  'api/frame-action.js',
  'api/index.js',
  'api/direct-html.js',
  'api/minimal.js',
  'api/edge.js',
  'deploy/api/all-routes.js',
  'deploy/public/index.html'
];

// Patterns to replace
const replacements = [
  // Fix old domain references
  { 
    pattern: /https:\/\/topwarplettraders\.vercel\.app\/og\.png/g, 
    replacement: `https://warplet-traders.vercel.app/og.png?v=${NEW_VERSION}`
  },
  // Fix old version tags with static version
  { 
    pattern: /https:\/\/warplet-traders\.vercel\.app\/og\.png\?v=\d+-?\d*/g, 
    replacement: `https://warplet-traders.vercel.app/og.png?v=${NEW_VERSION}` 
  },
  // Fix dynamic version tags (used with Date.now())
  { 
    pattern: /https:\/\/warplet-traders\.vercel\.app\/og\.png\?v=\d+&t=\$\{Date\.now\(\)\}/g, 
    replacement: `https://warplet-traders.vercel.app/og.png?v=${NEW_VERSION}&t=\${Date.now()}`
  },
  // Fix malformed URLs with duplicate parameters
  {
    pattern: /v=\d+v=\d+/g,
    replacement: `v=${NEW_VERSION}`
  },
  {
    pattern: /t=\$\{Date\.now\(\)\}t=\$\{Date\.now\(\)\}/g,
    replacement: 't=${Date.now()}'
  },
  // Fix old API endpoints
  {
    pattern: /https:\/\/topwarplettraders\.vercel\.app\/api/g,
    replacement: 'https://warplet-traders.vercel.app/api'
  }
];

// Process each file
filesToUpdate.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  replacements.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
});

// Recreate the deployment package
console.log('\nRecreating deployment package...');
try {
  execSync('node create-minimal-deploy.js', { stdio: 'inherit' });
  console.log('Deployment package updated successfully!');
} catch (error) {
  console.error('Failed to create deployment package:', error.message);
}