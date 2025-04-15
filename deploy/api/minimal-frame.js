/**
 * Ultra-minimal Warpcast Frame Handler
 * Optimized for direct casting compatibility
 */

// Image URLs - fully qualified to avoid CORS and path issues
const IMAGE_URL = 'https://i.imgur.com/k9KaLKk.png';
const IMAGE_URL_24H = 'https://i.imgur.com/k9KaLKk.png';
const IMAGE_URL_7D = 'https://i.imgur.com/k9KaLKk.png';
const IMAGE_URL_SHARE = 'https://i.imgur.com/k9KaLKk.png';

// The deployment URL - make sure this matches your Vercel deployment
const BASE_URL = 'https://warplet-traders.vercel.app';

module.exports = (req, res) => {
  console.log('Frame handler called');
  
  // For debugging - log the entire request
  console.log('Request body:', JSON.stringify(req.body || {}));
  
  // Improve content-type handling
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  // Enhanced button handling for all Warpcast frame request formats
  let buttonIndex = 1;
  try {
    // Handle direct cast format
    if (req.body && req.body.untrustedData && req.body.untrustedData.buttonIndex) {
      buttonIndex = parseInt(req.body.untrustedData.buttonIndex, 10);
      console.log('Button index from untrustedData:', buttonIndex);
    } 
    // Handle frame validator format
    else if (req.body && req.body.buttonIndex) {
      buttonIndex = parseInt(req.body.buttonIndex, 10);
      console.log('Button index from direct body:', buttonIndex);
    }
    // Handle query param format (for debugging and direct access)
    else if (req.query && req.query.buttonIndex) {
      buttonIndex = parseInt(req.query.buttonIndex, 10);
      console.log('Button index from query param:', buttonIndex);
    }
  } catch (e) {
    console.error('Error parsing button data:', e);
    // Fall back to default
    buttonIndex = 1;
  }
  
  // Select timeframe based on button
  const timeframe = buttonIndex === 2 ? "7-Day View" : "24-Hour View";
  const imageUrl = buttonIndex === 2 ? IMAGE_URL_7D : IMAGE_URL_24H;
  
  // Handle share view (button 3)
  if (buttonIndex === 3) {
    console.log('Rendering share view');
    return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${IMAGE_URL_SHARE}" />
  <meta property="fc:frame:button:1" content="Back" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api" />
</head>
<body>
  <p>Share Top Warplet Traders with your followers!</p>
</body>
</html>
`);
  }
  
  // Main view (buttons 1 and 2)
  console.log('Rendering main view with timeframe:', timeframe);
  return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:button:1" content="24 Hours" />
  <meta property="fc:frame:button:2" content="7 Days" />
  <meta property="fc:frame:button:3" content="Share" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api" />
</head>
<body>
  <h1>Top Warplet Traders - ${timeframe}</h1>
</body>
</html>
`);
};