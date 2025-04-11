/**
 * Root API handler for Vercel serverless deployment
 */

// Import frame handler
const frameHandler = require('./frame-action');

module.exports = async (req, res) => {
  // Simple redirect to frame-action for the root endpoint
  return frameHandler(req, res);
};