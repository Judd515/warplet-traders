// This script is used during Vercel's build process to ensure proper configuration
const fs = require('fs');
const path = require('path');

// Create dist folder if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Create a simple _redirects file to handle client-side routing
const redirects = `
# Handle SPA routing (client-side)
/*  /index.html  200

# API routes
/api/*  /api/:splat  200
`;

fs.writeFileSync(path.join('dist', '_redirects'), redirects);

// Create simple web server for Vercel's serverless environment
const serverCode = `
// This file is used by Vercel to serve the static files
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));

// Handle client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return;
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
`;

fs.writeFileSync(path.join('dist', 'server.js'), serverCode);

console.log('Vercel build configuration completed');