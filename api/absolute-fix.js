/**
 * Ultra-minimalist Frame Handler with Real Data
 * This implementation uses the image-endpoint.js to render real-time data
 */

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
      const { buttonIndex, fid } = req.body.untrustedData;
      
      // Button 1 logic
      if (buttonIndex === 1) {
        // Different actions based on button context
        // We reconstruct the current view based on the button text in the untrustedData
        const buttonText = req.body.untrustedData.buttonText || '';
        
        if (buttonText.includes('24h')) {
          view = '24h';
        } else if (buttonText.includes('7d')) {
          view = '7d';
        } else if (buttonText.includes('Try Again')) {
          view = 'main';
        }
      } 
      // Button 2 logic
      else if (buttonIndex === 2) {
        const buttonText = req.body.untrustedData.buttonText || '';
        
        if (buttonText.includes('7d')) {
          view = '7d';
        } else {
          view = 'main';
        }
      }
      // Button 3 (Share) logic
      else if (buttonIndex === 3) {
        // Redirect to share URL
        const shareText = encodeURIComponent(
          `Check out the top Warplet traders on BASE!\n\nhttps://warplet-traders.vercel.app/api/absolute-fix`
        );
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      }
    }
    
    // Generate frame HTML based on the view
    if (view === '24h') {
      return res.status(200).send(generate24hFrame());
    } else if (view === '7d') {
      return res.status(200).send(generate7dFrame());
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
  
  // Use dynamic image for real-time data
  const imageUrl = `${baseUrl}/api/image-endpoint?view=main&t=${Date.now()}`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/absolute-fix" />
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
function generate24hFrame() {
  const baseUrl = 'https://warplet-traders.vercel.app';
  
  // Use dynamic image for real-time data
  const imageUrl = `${baseUrl}/api/image-endpoint?view=24h&t=${Date.now()}`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/absolute-fix" />
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
function generate7dFrame() {
  const baseUrl = 'https://warplet-traders.vercel.app';
  
  // Use dynamic image for real-time data
  const imageUrl = `${baseUrl}/api/image-endpoint?view=7d&t=${Date.now()}`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/absolute-fix" />
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
function generateErrorFrame() {
  const baseUrl = 'https://warplet-traders.vercel.app';
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/absolute-fix" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
}