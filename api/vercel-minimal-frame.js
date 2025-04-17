/**
 * Ultra-minimal Vercel-specific frame API
 * This file should be placed in the /api folder for Vercel deployment
 */

// Import necessary module
const { createServer } = require('http');

// Main handler function that will be called by Vercel
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log request for debugging
  console.log('VERCEL MINIMAL FRAME REQUEST:', {
    method: req.method,
    url: req.url,
    body: req.body
  });
  
  try {
    // Extract button index if present
    let buttonIndex = 1;
    if (req.body && req.body.untrustedData && req.body.untrustedData.buttonIndex) {
      buttonIndex = parseInt(req.body.untrustedData.buttonIndex, 10);
    }
    
    // Generate frame HTML based on button clicked
    let responseHtml;
    
    switch (buttonIndex) {
      case 1:
        responseHtml = generate24hFrame();
        break;
      case 2:
        responseHtml = generate7dFrame();
        break;
      case 3:
        // Share button - redirect to composer
        const shareText = encodeURIComponent(
          `Top Warplet Earners (7d)\n\n1. @thcradio (BTC): $3,580 / $42.5K volume\n2. @wakaflocka (USDC): $2,940 / $38.7K volume\n3. @chrislarsc.eth (ETH): $2,450 / $31.2K volume\n4. @hellno.eth (DEGEN): $1,840 / $24.6K volume\n5. @karima (ARB): $1,250 / $18.9K volume\n\nhttps://warplet-traders.vercel.app/index.html`
        );
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      case 4:
        responseHtml = generateCheckMeFrame();
        break;
      default:
        responseHtml = generate24hFrame();
    }
    
    // Respond with the generated HTML
    return res.status(200).send(responseHtml);
  } catch (error) {
    console.error('Error in frame handler:', error);
    return res.status(200).send(generateErrorFrame());
  }
};

// Generate 24h frame
function generate24hFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x628/1E293B/FFFFFF?text=24h+Top+Traders">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/vercel-minimal-frame">
</head>
<body>
  <h1>24h Top Traders</h1>
</body>
</html>
  `;
}

// Generate 7d frame
function generate7dFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x628/1E293B/FFFFFF?text=7d+Top+Traders">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/vercel-minimal-frame">
</head>
<body>
  <h1>7d Top Traders</h1>
</body>
</html>
  `;
}

// Generate Check Me frame
function generateCheckMeFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x628/1E293B/FFFFFF?text=Check+My+Follows">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/vercel-minimal-frame">
</head>
<body>
  <h1>Check My Follows</h1>
</body>
</html>
  `;
}

// Generate Error frame
function generateErrorFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x628/1E293B/FF0000?text=Error+Occurred">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/vercel-minimal-frame">
</head>
<body>
  <h1>An error occurred</h1>
</body>
</html>
  `;
}