/**
 * Simple Frame with New Design
 * - Uses static SVG images
 * - Shows real data in share text
 */

import axios from 'axios';

// Configuration
const BASE_URL = 'https://warplet-traders.vercel.app';
const DEFAULT_FID = 2; // Replace with your actual FID

export default function handler(req, res) {
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    // Default view
    let view = 'global';
    let fid = DEFAULT_FID;
    
    // Handle button clicks
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex, fid: userFid } = req.body.untrustedData;
      fid = userFid || DEFAULT_FID;
      
      if (buttonIndex === 1) {
        // "Check Me" button - show user view
        view = 'user';
        return res.status(200).send(generateUserFrame(fid));
      } else if (buttonIndex === 2) {
        // "Share" button
        const shareText = encodeURIComponent(
          `Check out Warplet Top Traders!\n\nhttps://warplet-traders.vercel.app/api/simple-with-design`
        );
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      } else if (buttonIndex === 3) {
        // "Tip" button
        return res.redirect(302, 'https://warpcast.com/0xjudd');
      }
    }
    
    // Default frame (on GET request or other cases)
    return res.status(200).send(generateGlobalFrame());
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).send(generateErrorFrame());
  }
}

// Generate global frame HTML
function generateGlobalFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/images/global.svg" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/simple-with-design" />
  <meta property="fc:frame:button:1" content="Check Me" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>`;
}

// Generate user-specific frame HTML
function generateUserFrame(fid) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/images/user.svg" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/simple-with-design" />
  <meta property="fc:frame:button:1" content="Check Me" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
</head>
<body>
  <h1>Your Top Traders</h1>
</body>
</html>`;
}

// Generate error frame HTML
function generateErrorFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/simple-with-design" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error</h1>
</body>
</html>`;
}