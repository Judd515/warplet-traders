// This adapter is required for Express to work on Vercel serverless functions
const app = require('./index.js');

module.exports = (req, res) => {
  // Vercel serverless adapter middleware
  app(req, res);
};