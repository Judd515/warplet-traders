// Enhanced serverless handler with robust error handling
// First load the serverless storage which contains fallbacks
require('./serverless-storage');

// Then load the app which will use the enhanced storage
const app = require('./index');

// Import necessary modules
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
  defaultMeta: { service: 'warplet-traders' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Process uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { error });
  // Don't exit the process in serverless environment as it will restart
});

// Process unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  // Don't exit the process in serverless environment as it will restart
});

// Function to verify environment variables are set
function checkRequiredEnvVars() {
  const required = ['DATABASE_URL', 'NEYNAR_API_KEY', 'DUNE_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.warn(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

// Check environment variables
const envVarsOk = checkRequiredEnvVars();
if (!envVarsOk) {
  logger.warn('Some environment variables are missing. App may not function correctly.');
}

// Modify Express error handling for serverless
app.use((err, req, res, next) => {
  logger.error('Serverless API Error:', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body
  });
  
  // Return a more helpful error response
  res.status(500).json({ 
    error: 'An error occurred processing your request',
    message: err.message,
    path: req.path,
    success: false
  });
});

// Create a serverless handler specifically for Vercel
const handler = (req, res) => {
  // Log incoming requests
  logger.info(`Serverless handler received ${req.method} request to ${req.url}`, {
    path: req.url,
    method: req.method,
    headers: req.headers
  });
  
  return app(req, res);
};

// Export the handler as the default export for Vercel
module.exports = handler;

// Export individual HTTP methods for Vercel
module.exports.GET = handler;
module.exports.POST = handler;
module.exports.PUT = handler;
module.exports.DELETE = handler;