// Import the real handler implementation
const oneFileFrameHandler = require('../../api/one-file-frame');

// Simple wrapper for Express integration
module.exports = (req, res) => {
  return oneFileFrameHandler(req, res);
};