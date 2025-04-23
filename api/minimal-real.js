/**
 * Absolutely Minimal Frame Handler - Using only what is 100% KNOWN to work
 */

// Configuration
const BASE_URL = 'https://warplet-traders.vercel.app';

/**
 * Main handler function - kept as simple as humanly possible
 */
export default function handler(req, res) {
  try {
    // Set reliable and consistent headers
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Default to main view
    let frameType = 'main';
    
    // Handle button clicks from POST requests
    if (req.method === 'POST' && req.body?.untrustedData?.buttonIndex) {
      const { buttonIndex } = req.body.untrustedData;
      
      // Ultra-simple button logic
      if (buttonIndex === 1) {
        frameType = '24h';
      } else if (buttonIndex === 2) {
        frameType = '7d';
      } else if (buttonIndex === 3) {
        // Share button - just redirect to compose
        const shareText = encodeURIComponent(
          `Check out the top Warplet traders on BASE!\n\n` +
          `${BASE_URL}/api/minimal-real`
        );
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      }
    }
    
    // Get HTML for the current frame type
    let html = '';
    
    if (frameType === '24h') {
      html = generate24hFrame();
    } else if (frameType === '7d') {
      html = generate7dFrame();
    } else {
      html = generateMainFrame();
    }
    
    // Send the HTML response
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).send(generateErrorFrame());
  }
}

/**
 * Generate HTML for different frame types using fixed, hardcoded image URLs
 * that are KNOWN to work in the production environment
 */
function generateMainFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/api/external-image-frame?type=main" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/minimal-real" />
  <meta property="fc:frame:button:1" content="View 24h Data" />
  <meta property="fc:frame:button:2" content="View 7d Data" />
  <meta property="fc:frame:button:3" content="Share" />
</head>
<body>
  <h1>Top Warplet Traders</h1>
</body>
</html>`;
}

function generate24hFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/api/external-image-frame?type=24h" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/minimal-real" />
  <meta property="fc:frame:button:1" content="View 7d Data" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
</head>
<body>
  <h1>Top Warplet Traders - 24h</h1>
</body>
</html>`;
}

function generate7dFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/api/external-image-frame?type=7d" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/minimal-real" />
  <meta property="fc:frame:button:1" content="View 24h Data" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
</head>
<body>
  <h1>Top Warplet Traders - 7d</h1>
</body>
</html>`;
}

function generateErrorFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/api/external-image-frame?type=error" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/minimal-real" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
}