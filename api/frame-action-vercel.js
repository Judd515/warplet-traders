/**
 * Standalone handler for Farcaster Frame actions in Vercel
 * This is a simplified version of the frame-action.js code specifically for serverless deployment
 */

// Import necessary modules for the handler
const { createLogger, format, transports } = require('winston');

// Create a logger for debugging
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
  defaultMeta: { service: 'warplet-traders-frame' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Import the frame-action handler from the main file
const frameActionHandler = require('./frame-action');

// Create a simplified handler for Vercel
const handler = async (req, res) => {
  try {
    logger.info('Frame action request received', {
      method: req.method,
      url: req.url,
      body: req.body || {},
      headers: req.headers
    });

    // Call the main frame action handler
    return await frameActionHandler(req, res);
  } catch (error) {
    logger.error('Error in frame action handler:', error);
    
    // Return a fallback frame response in case of error
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://topwarplettraders.vercel.app/error.png" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/frame-action" />
        </head>
        <body>
          <p>Error processing frame action. Please try again.</p>
        </body>
      </html>
    `);
  }
};

// Export the handler for Vercel
module.exports = handler;