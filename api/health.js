/**
 * Simple health check endpoint for Vercel deployment
 * Can be used to verify the serverless function is running correctly
 */
module.exports = (req, res) => {
  // Return basic status information
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Warplet Top Traders API is operational',
    version: '1.0.0',
    // Include partial environment variable info for debugging (without exposing secrets)
    env: {
      database: process.env.DATABASE_URL ? 'configured' : 'missing',
      neynar: process.env.NEYNAR_API_KEY ? 'configured' : 'missing', 
      dune: process.env.DUNE_API_KEY ? 'configured' : 'missing'
    }
  });
};