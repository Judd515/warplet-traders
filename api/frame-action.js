// API endpoint to handle Farcaster Frame button clicks
const express = require('express');
const { storage } = require('./storage');

// Create router
const router = express.Router();

router.post('/api/frame-action', async (req, res) => {
  try {
    console.log('Frame action received:', req.body);
    
    // Extract data from the Farcaster Frame
    const { untrustedData } = req.body;
    
    // Default to 24h if button index not provided
    let timeframe = '24h';
    
    if (untrustedData && untrustedData.buttonIndex) {
      switch (untrustedData.buttonIndex) {
        case 1:
          timeframe = '24h';
          break;
        case 2:
          timeframe = '7d';
          break;
        case 3:
          // For share button, we'll still return a frame with data
          timeframe = '24h';
          break;
        default:
          timeframe = '24h';
      }
    }
    
    // Fetch the traders from storage
    const traders = await storage.getTraders();
    
    // Generate frame response HTML
    let frameImage = `https://topwarplettraders.vercel.app/api/og-image?timeframe=${timeframe}`;
    
    if (untrustedData && untrustedData.buttonIndex === 3) {
      // For share button, include a special parameter
      frameImage += '&share=true';
    }
    
    // Create HTML response for the frame
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${frameImage}" />
          <meta property="fc:frame:button:1" content="24 Hours" />
          <meta property="fc:frame:button:2" content="7 Days" />
          <meta property="fc:frame:button:3" content="Share Results" />
          <meta property="fc:frame:post_url" content="https://topwarplettraders.vercel.app/api/frame-action" />
          <meta property="og:title" content="Warpcast Top Traders" />
          <meta property="og:description" content="See which of the people you follow are the top traders on BASE" />
        </head>
        <body>
          <p>Loading traders data...</p>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Error handling frame action:', error);
    
    // Return a basic error frame
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://topwarplettraders.vercel.app/error.png" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:post_url" content="https://topwarplettraders.vercel.app/api/frame-action" />
        </head>
        <body>
          <p>Error loading data</p>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(errorHtml);
  }
});

module.exports = router;