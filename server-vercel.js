// This file is used by Vercel to correctly serve the static build
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'public')));

// The catchall handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return;
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the app for serverless use
module.exports = app;