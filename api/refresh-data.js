/**
 * Standalone handler for refreshing trader data in Vercel
 */

// Set up env vars and storage
require('./serverless-storage');

// Import necessary modules
const { createLogger, format, transports } = require('winston');
const { fetchFollowing, extractWarpletAddresses } = require('./neynar');
const { fetchTradingData, processTradingData } = require('./dune');
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
  defaultMeta: { service: 'warplet-traders-refresh' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Create the handler for POST /api/refresh-data
const handler = async (req, res) => {
  try {
    logger.info('Refreshing trader data');
    
    // Check for Neynar API key
    if (!process.env.NEYNAR_API_KEY) {
      throw new Error('NEYNAR_API_KEY environment variable is not set');
    }
    
    // Check for Dune API key
    if (!process.env.DUNE_API_KEY) {
      throw new Error('DUNE_API_KEY environment variable is not set');
    }
    
    // Extract timeframe from request (default to 24h)
    const timeframe = (req.body && req.body.timeframe) || req.query.timeframe || '24h';
    logger.info(`Using timeframe: ${timeframe}`);
    
    // Get following list from Neynar API (user with FID 12915)
    const followingUsers = await fetchFollowing(12915, process.env.NEYNAR_API_KEY);
    
    // Extract wallet addresses from user profiles
    const addressMap = await extractWarpletAddresses(followingUsers, process.env.NEYNAR_API_KEY);
    
    // Fetch trading data from Dune
    const walletAddresses = Object.values(addressMap);
    const tradingData = await fetchTradingData({
      timeframe,
      walletAddresses
    }, process.env.DUNE_API_KEY);
    
    // Process the data into the format we need
    const formattedTraders = processTradingData(addressMap, timeframe);
    
    // Update the database
    const traders = await storage.updateTraders(formattedTraders);
    
    // Return the updated traders
    return res.status(200).json(traders);
  } catch (error) {
    logger.error('Error refreshing trader data:', error);
    
    // Return an error
    return res.status(500).json({
      error: 'Error refreshing trader data',
      message: error.message
    });
  }
};

// Export the handler for Vercel
module.exports = handler;