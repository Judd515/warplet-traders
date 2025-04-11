// Standalone frame-action handler for Warpcast Frames
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

/**
 * Main handler for Farcaster Frame actions
 */
module.exports = async function frameActionHandler(req, res) {
  try {
    // Log request details
    logger.info(`Frame action request: ${req.method} ${req.url}`);
    
    // Extract frame data if it exists
    const frameData = req.body && req.body.untrustedData;
    let buttonIndex = 1; // Default to 24h view
    
    if (frameData && frameData.buttonIndex) {
      buttonIndex = parseInt(frameData.buttonIndex, 10);
      logger.info(`Button pressed: ${buttonIndex}`);
    }
    
    // Determine which timeframe to use
    let timeframe = '24h';
    if (buttonIndex === 2) {
      timeframe = '7d';
    }
    
    // Handle share action (button 3)
    if (buttonIndex === 3) {
      return generateShareFrame(res);
    }
    
    // Use hardcoded sample traders data to prevent crashes in production
    // These are real usernames but placeholder data for demonstration
    const sampleTraders = [
      { 
        username: "thcradio", 
        topToken: "BTC", 
        pnl24h: "76", 
        pnl7d: "34" 
      },
      { 
        username: "wakaflocka", 
        topToken: "USDC", 
        pnl24h: "-39", 
        pnl7d: "-12" 
      },
      { 
        username: "hellno.eth", 
        topToken: "DEGEN", 
        pnl24h: "49", 
        pnl7d: "22" 
      },
      { 
        username: "karima", 
        topToken: "ARB", 
        pnl24h: "-55", 
        pnl7d: "-28" 
      },
      { 
        username: "chrislarsc.eth", 
        topToken: "ETH", 
        pnl24h: "-63", 
        pnl7d: "-15" 
      }
    ];
    
    // Process traders for the requested timeframe
    const traders = sampleTraders.map(trader => ({
      ...trader,
      pnl: timeframe === '24h' ? trader.pnl24h : trader.pnl7d
    }));
      
    // Generate frame HTML with trader data
    return generateTraderFrame(res, traders, timeframe);
  } catch (error) {
    logger.error('Error handling frame action:', error);
    return generateErrorFrame(res, 'An unexpected error occurred');
  }
};

/**
 * Helper function to generate a frame with trader data
 */
function generateTraderFrame(res, traders, timeframe) {
  // Format trader data for display
  const tradersHtml = traders.map((trader, index) => {
    const pnlValue = parseFloat(trader.pnl);
    const pnlColor = pnlValue >= 0 ? 'green' : 'red';
    const pnlSign = pnlValue >= 0 ? '+' : '';
    const pnlFormatted = `${pnlSign}${pnlValue}%`;
    
    return `
      <div style="display:flex; margin-bottom:8px; align-items:center;">
        <div style="width:20px; margin-right:8px;">${index + 1}.</div>
        <div style="flex-grow:1; font-weight:bold;">${trader.username}</div>
        <div style="width:70px; text-align:right; color:${pnlColor};">${pnlFormatted}</div>
        <div style="width:60px; text-align:right; margin-left:8px; font-size:0.8em; color:#888;">${trader.topToken || 'N/A'}</div>
      </div>
    `;
  }).join('');
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://topwarplettraders.vercel.app/og.png" />
        <meta property="fc:frame:button:1" content="24 Hours" />
        <meta property="fc:frame:button:2" content="7 Days" />
        <meta property="fc:frame:button:3" content="Share Results" />
        <meta property="fc:frame:post_url" content="https://topwarplettraders.vercel.app/api/frame-action" />
        <style>
          body {
            font-family: sans-serif;
            background-color: #1e293b;
            color: white;
            padding: 20px;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 16px;
          }
          .timeframe {
            color: #94a3b8;
            font-size: 16px;
            margin-bottom: 20px;
          }
          .trader-list {
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <h1>Top Warplet Traders</h1>
        <div class="timeframe">Timeframe: ${timeframe === '24h' ? '24 Hours' : '7 Days'}</div>
        <div class="trader-list">
          ${tradersHtml}
        </div>
      </body>
    </html>
  `;
  
  return res.status(200).send(html);
}

/**
 * Generate a share frame
 */
function generateShareFrame(res) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://topwarplettraders.vercel.app/og.png" />
        <meta property="fc:frame:button:1" content="View Top Traders" />
        <meta property="fc:frame:post_url" content="https://topwarplettraders.vercel.app/api/frame-action" />
        <meta property="og:title" content="Warpcast Top Traders" />
        <meta property="og:description" content="Check out who among the people you follow are the top traders on BASE!" />
      </head>
      <body>
        <p>Share this with your followers!</p>
      </body>
    </html>
  `;
  
  return res.status(200).send(html);
}

/**
 * Generate an error frame
 */
function generateErrorFrame(res, errorMessage) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://topwarplettraders.vercel.app/error.png" />
        <meta property="fc:frame:button:1" content="Try Again" />
        <meta property="fc:frame:post_url" content="https://topwarplettraders.vercel.app/api/frame-action" />
      </head>
      <body>
        <p>Error: ${errorMessage}</p>
      </body>
    </html>
  `;
  
  return res.status(200).send(html);
}