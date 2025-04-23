/**
 * Working Warplet Traders Frame with New Design
 * Based on absolute-fix.js which is known to work
 */

// Export the handler function
export default function handler(req, res) {
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Base URL for the app
  const baseUrl = 'https://warplet-traders.vercel.app';
  
  try {
    // Default view is main
    let view = 'main';
    
    // Handle button clicks
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex } = req.body.untrustedData;
      
      // "Check Me" button
      if (buttonIndex === 1) {
        view = 'user';
      } 
      // "Main View" button
      else if (buttonIndex === 2) {
        view = 'main';
      }
      // "Share" button
      else if (buttonIndex === 3) {
        // Redirect to share URL
        const shareText = encodeURIComponent(
          `Check out the top Warplet traders on BASE!\n\nhttps://warplet-traders.vercel.app/api/working-with-redesign`
        );
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      }
      // "Tip" button
      else if (buttonIndex === 4) {
        return res.redirect(302, 'https://warpcast.com/0xjudd');
      }
    }
    
    // Generate frame HTML based on the view
    if (view === 'user') {
      return res.status(200).send(generateUserFrame());
    } else {
      return res.status(200).send(generateMainFrame());
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).send(generateErrorFrame());
  }
}

// Generate main frame
function generateMainFrame() {
  const baseUrl = 'https://warplet-traders.vercel.app';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/global.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Check Me" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
  <meta property="fc:frame:button:4" content="Tip" />
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>`;
}

// Generate user-specific frame
function generateUserFrame() {
  const baseUrl = 'https://warplet-traders.vercel.app';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/user.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Check Me" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
  <meta property="fc:frame:button:4" content="Tip" />
</head>
<body>
  <h1>My Top Traders</h1>
</body>
</html>`;
}

// Generate error frame
function generateErrorFrame() {
  const baseUrl = 'https://warplet-traders.vercel.app';
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
}