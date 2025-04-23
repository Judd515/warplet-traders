/**
 * Fast Frame Handler for Warpcast
 * Optimized for quick response time with serverless functions
 */

export default function handler(req, res) {
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Set base URL 
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://warplet-traders.vercel.app'
    : `${req.protocol}://${req.headers.host}`;
  
  try {
    console.log(`Fast Frame handler called: ${req.method}`);
    
    // For GET requests, just return the main frame HTML immediately
    if (req.method === 'GET') {
      return res.status(200).send(generateMainFrame(baseUrl));
    }
    
    // For POST requests (button clicks)
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex, buttonText, fid } = req.body.untrustedData;
      console.log(`Button click: index=${buttonIndex}, text=${buttonText}, fid=${fid || 0}`);
      
      // Button 1 - "Check Me" or "Try Again"
      if (buttonIndex === 1) {
        const btnText = buttonText || '';
        
        if (btnText.includes('Try Again')) {
          return res.status(200).send(generateMainFrame(baseUrl));
        } else if (btnText.includes('Check Me')) {
          return res.status(200).send(generateLoadingFrame(baseUrl, fid));
        }
      }
      // Button 2 - "Share" 
      else if (buttonIndex === 2) {
        // Simple share text to avoid API calls
        const shareText = encodeURIComponent(
          `Check out the top Warplet traders on BASE!\n\nhttps://warplet-traders.vercel.app/api/fast-frame`
        );
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      }
      // Button 3 - "Tip"
      else if (buttonIndex === 3) {
        return res.redirect(302, 'https://warpcast.com/0xjudd');
      }
    }
    
    // Default response
    return res.status(200).send(generateMainFrame(baseUrl));
    
  } catch (error) {
    console.error('Error in fast-frame handler:', error);
    return res.status(200).send(generateErrorFrame(baseUrl));
  }
}

/**
 * Generate the main frame HTML
 */
function generateMainFrame(baseUrl) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/global.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/fast-frame" />
  <meta property="fc:frame:button:1" content="Check Me" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
  <meta property="og:image" content="${baseUrl}/images/global.svg" />
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>`;
}

/**
 * Generate the loading frame while data is being processed
 */
function generateLoadingFrame(baseUrl, fid) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/user.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/fast-frame" />
  <meta property="fc:frame:button:1" content="Try Again" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
</head>
<body>
  <h1>My Top Traders</h1>
</body>
</html>`;
}

/**
 * Generate an error frame
 */
function generateErrorFrame(baseUrl) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/fast-frame" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
}