/**
 * Main Frame Handler for Warplet Traders
 */

export default function handler(req, res) {
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // For production, use absolute URL
  const baseUrl = 'https://warplet-traders.vercel.app';
  
  try {
    console.log(`Frame handler called: ${req.method}`);
    
    // For GET requests, return the main frame HTML
    if (req.method === 'GET') {
      return res.status(200).send(generateMainFrame(baseUrl));
    }
    
    // For POST requests (button clicks)
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex, buttonText } = req.body.untrustedData;
      console.log(`Button click: index=${buttonIndex}, text=${buttonText || ''}`);
      
      // Button 1 - "View 24h Data" or "View 7d Data" or "Try Again"
      if (buttonIndex === 1) {
        const btnText = buttonText || '';
        
        if (btnText.includes('24h')) {
          return res.status(200).send(generate24hFrame(baseUrl));
        } else if (btnText.includes('7d')) {
          return res.status(200).send(generate7dFrame(baseUrl));
        } else if (btnText.includes('Try Again')) {
          return res.status(200).send(generateMainFrame(baseUrl));
        }
      }
      // Button 2 - "View 7d Data" or "Main View"
      else if (buttonIndex === 2) {
        const btnText = buttonText || '';
        
        if (btnText.includes('7d')) {
          return res.status(200).send(generate7dFrame(baseUrl));
        } else if (btnText.includes('Main')) {
          return res.status(200).send(generateMainFrame(baseUrl));
        }
      }
      // Button 3 - "Share"
      else if (buttonIndex === 3) {
        const shareText = encodeURIComponent(
          `Check out the top Warplet traders on BASE!\n\n${baseUrl}/api`
        );
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      }
    }
    
    // Default to main frame
    return res.status(200).send(generateMainFrame(baseUrl));
    
  } catch (error) {
    console.error('Error in frame handler:', error);
    return res.status(200).send(generateErrorFrame(baseUrl));
  }
}

// Generate main frame
function generateMainFrame(baseUrl) {
  const imageUrl = `${baseUrl}/api/image?view=main&t=${Date.now()}`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api" />
  <meta property="fc:frame:button:1" content="View 24h Data" />
  <meta property="fc:frame:button:2" content="View 7d Data" />
  <meta property="fc:frame:button:3" content="Share" />
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>`;
}

// Generate 24h frame
function generate24hFrame(baseUrl) {
  const imageUrl = `${baseUrl}/api/image?view=24h&t=${Date.now()}`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api" />
  <meta property="fc:frame:button:1" content="View 7d Data" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
</head>
<body>
  <h1>24h Top Traders</h1>
</body>
</html>`;
}

// Generate 7d frame
function generate7dFrame(baseUrl) {
  const imageUrl = `${baseUrl}/api/image?view=7d&t=${Date.now()}`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api" />
  <meta property="fc:frame:button:1" content="View 24h Data" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
</head>
<body>
  <h1>7d Top Traders</h1>
</body>
</html>`;
}

// Generate error frame
function generateErrorFrame(baseUrl) {
  const errorImageUrl = `${baseUrl}/images/error.svg`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${errorImageUrl}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
}