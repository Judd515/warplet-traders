// This adapter is required for Express to work on Vercel serverless functions
const app = require('./index.js');

// This is the handler function for Vercel serverless functions
module.exports = async (req, res) => {
  try {
    // Run the Express app
    await app(req, res);
    
    // Close database connection if request is finished
    const { pool } = require('./db');
    if (pool && res.writableEnded) {
      await pool.end();
      console.log('Database connection closed after request');
    }
  } catch (error) {
    console.error('Error in serverless handler:', error);
    // If response hasn't been sent yet, send an error response
    if (!res.writableEnded) {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong while processing your request'
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