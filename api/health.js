/**
 * Simple health check endpoint for Vercel deployment
 * Can be used to verify the serverless function is running correctly
 */

module.exports = function(req, res) {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Warplet Traders API is running'
  });
};