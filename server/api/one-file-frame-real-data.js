// Import the real handler implementation
const oneFileFrameRealDataHandler = require('../../api/one-file-frame-real-data');

// Simple wrapper for Express integration
module.exports = (req, res) => {
  return oneFileFrameRealDataHandler(req, res);
};