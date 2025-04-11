/**
 * Standalone handler for retrieving trader data in Vercel
 */

// Set up env vars and storage
require('./serverless-storage');

// Import necessary modules
const { createLogger, format, transports } = require('winston');
const { storage } = require('./storage');

// Create a logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'warplet-traders-api' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Create the handler for GET /api/traders
const handler = async (req, res) => {
  try {
    logger.info('Retrieving trader data');
    
    // Get traders from storage
    const traders = await storage.getTraders();
    
    // Return the traders
    return res.status(200).json(traders);
  } catch (error) {
    logger.error('Error retrieving trader data:', error);
    
    // Return an error
    return res.status(500).json({
      error: 'Error retrieving trader data',
      message: error.message
    });
  }
};

// Export the handler for Vercel
module.exports = handler;