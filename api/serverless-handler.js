// This adapter is required for Express to work on Vercel serverless functions
const app = require('./index.js');

// This is the handler function for Vercel serverless functions
module.exports = async (req, res) => {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log(`Serverless function called with path: ${req.url}, method: ${req.method}`);
    
    // Run the Express app
    await app(req, res);
    
    // Close database connection if request is finished
    if (res.writableEnded) {
      try {
        const { pool } = require('./db');
        if (pool) {
          await pool.end();
          console.log('Database connection closed after request');
        }
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  } catch (error) {
    console.error('Error in serverless handler details:', error.message);
    console.error('Error stack:', error.stack);
    
    // If response hasn't been sent yet, send an error response
    if (!res.writableEnded) {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong while processing your request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Make sure to always close the connection
    try {
      const { pool } = require('./db');
      if (pool) await pool.end();
    } catch (err) {
      console.error('Error closing database connection:', err);
    }
  }
};