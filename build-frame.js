/**
 * Build script for creating the production-ready clean-frame.html
 * This replaces relative URLs with absolute URLs for Vercel deployment
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Define the URL for production
const PRODUCTION_URL = 'https://warplet-traders.vercel.app';

// Get current file directory with ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the clean-frame.html file
const framePath = path.join(__dirname, 'public', 'clean-frame.html');
let frameContent = fs.readFileSync(framePath, 'utf8');

// Replace the relative post_url with absolute URL
frameContent = frameContent.replace(
  '<meta property="fc:frame:post_url" content="/api/simple-frame">',
  `<meta property="fc:frame:post_url" content="${PRODUCTION_URL}/api/simple-frame">`
);

// Write the production version
const prodFramePath = path.join(__dirname, 'public', 'prod-frame.html');
fs.writeFileSync(prodFramePath, frameContent);

console.log('✅ Production frame file created at: public/prod-frame.html');