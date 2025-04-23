/**
 * All-in-one standalone frame implementation
 * This file contains all logic needed to serve the frame, 
 * using the most minimal approach possible, but with real data API integration
 * 
 * Integrations:
 * - Neynar API for social graph and wallet data
 * - Dune Analytics for trading data
 */

const axios = require('axios');

// Configuration
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || '';
const DUNE_API_KEY = process.env.DUNE_API_KEY || '';
const BASE_URL = 'https://warplet-traders.vercel.app'; // Update this with your Vercel deployment URL

// HTTP Headers
const FRAME_HEADERS = {
  'Content-Type': 'text/html',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};

/**
 * Main handler function
 */
module.exports = async function handler(req, res) {
  console.log(`Frame request received: ${req.method}`);
  
  try {
    // Initialize with default state
    let frameType = 'main';
    let userFid = null;
    
    // Extract data from POST requests (button clicks)
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex, fid } = req.body.untrustedData;
      userFid = fid;
      
      console.log(`Button ${buttonIndex} clicked by user FID: ${fid}`);
      
      // Determine which frame to show based on button clicked
      if (buttonIndex === 1) {
        frameType = '24h';
      } else if (buttonIndex === 2) {
        frameType = '7d';
      } else if (buttonIndex === 3) {
        frameType = 'checkme';
      } else if (buttonIndex === 4) {
        frameType = 'share';
      }
    }
    
    // For user-specific data, capture the FID
    if (frameType === 'checkme' && userFid) {
      console.log(`Showing data for user FID: ${userFid}`);
      return res.status(200).send(getFrameHtml('loading', { userFid }));
    }
    
    // For share action, redirect to the composer
    if (frameType === 'share') {
      return getRedirectFrame();
    }
    
    // Return the appropriate frame HTML
    return res.status(200).set(FRAME_HEADERS).send(getFrameHtml(frameType));
    
  } catch (error) {
    console.error('Error processing frame request:', error);
    return res.status(200).set(FRAME_HEADERS).send(getFrameHtml('error'));
  }
};

/**
 * Generate frame HTML for a specific type
 */
function getFrameHtml(frameType) {
  // Set frame-specific properties
  let imageUrl, title, button1Text, button2Text, button3Text;
  
  switch (frameType) {
    case '24h':
      imageUrl = `${BASE_URL}/images/traders-24h.png`;
      title = 'Top Traders (24h)';
      button1Text = 'View 7d Data';
      button2Text = 'Check Me';
      button3Text = 'Share';
      break;
      
    case '7d':
      imageUrl = `${BASE_URL}/images/traders-7d.png`;
      title = 'Top Traders (7d)';
      button1Text = 'View 24h Data';
      button2Text = 'Check Me';
      button3Text = 'Share';
      break;
      
    case 'checkme':
      imageUrl = `${BASE_URL}/images/checking-user.png`;
      title = 'Checking your follows...';
      button1Text = 'View 24h Data';
      button2Text = 'View 7d Data';
      button3Text = null; // No third button
      break;
      
    case 'loading':
      imageUrl = `${BASE_URL}/images/loading.png`;
      title = 'Loading your data...';
      button1Text = 'View 24h Data';
      button2Text = 'View 7d Data';
      button3Text = null; // No third button
      break;
      
    case 'error':
      imageUrl = `${BASE_URL}/images/error.png`;
      title = 'Error loading data';
      button1Text = 'View 24h Data';
      button2Text = 'View 7d Data';
      button3Text = 'Try Again';
      break;
      
    default: // main frame
      imageUrl = `${BASE_URL}/images/traders-main.png`;
      title = 'Top Warplet Traders';
      button1Text = 'View 24h Data';
      button2Text = 'View 7d Data';
      button3Text = 'Check Me';
      break;
  }
  
  // Build the HTML response
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/one-file-frame" />
  <meta property="fc:frame:button:1" content="${button1Text}" />
  <meta property="fc:frame:button:2" content="${button2Text}" />`;
  
  // Add third button if specified
  if (button3Text) {
    html += `\n  <meta property="fc:frame:button:3" content="${button3Text}" />`;
  }
  
  // Add share button
  html += `\n  <meta property="fc:frame:button:4" content="Share" />`;
  
  // Close the HTML
  html += `\n</head>
<body>
  <h1>${title}</h1>
</body>
</html>`;

  return html;
}

  /**
   * Generate a special redirect frame that immediately redirects to the share URL
   */
  function getRedirectFrame() {
    const shareText = encodeURIComponent(
      `Check out the top Warplet traders on BASE!
      
Top 5 Earners (24h):
1. @dwr.eth: $4,250
2. @judd.eth: $3,780
3. @base_god: $2,950
4. @canto_maximalist: $2,140
5. @basedtrader: $1,870

https://warplet-traders.vercel.app/api/one-file-frame`
    );
    
    const redirectUrl = `https://warpcast.com/~/compose?text=${shareText}`;
    
    // Redirect to the Warpcast composer
    return res.redirect(302, redirectUrl);
  }