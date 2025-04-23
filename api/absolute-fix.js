/**
 * Absolute Last Resort Frame Handler
 * Ultra-minimal implementation with zero dependencies
 */

export default function handler(req, res) {
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Determine action based on request
  let view = 'main';
  let fid = null;
  
  if (req.method === 'POST' && req.body?.untrustedData) {
    const { buttonIndex, fid: userFid } = req.body.untrustedData;
    fid = userFid;
    
    // Ultra-simple button handling
    if (buttonIndex === 1) {
      view = '24h';
    } else if (buttonIndex === 2) {
      view = '7d';
    } else if (buttonIndex === 3) {
      // Redirect to share URL
      const shareText = encodeURIComponent(
        `Check out the top Warplet traders on BASE!\n\nhttps://warplet-traders.vercel.app/api/absolute-fix`
      );
      return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
    }
  }
  
  // Generate appropriate frame HTML
  const frame = generateFrame(view, fid);
  return res.status(200).send(frame);
}

// Generate frame HTML
function generateFrame(view, fid) {
  // Base URL for the app
  const baseUrl = 'https://warplet-traders.vercel.app';
  
  // Select the proper image and buttons based on the view
  let image = `${baseUrl}/images/main.png`;
  let button1 = 'View 24h Data';
  let button2 = 'View 7d Data';
  let button3 = 'Share';
  
  if (view === '24h') {
    image = `${baseUrl}/images/24h.png`;
    button1 = 'View 7d Data';
    button2 = 'Main View';
    button3 = 'Share';
  } else if (view === '7d') {
    image = `${baseUrl}/images/7d.png`;
    button1 = 'View 24h Data';
    button2 = 'Main View';
    button3 = 'Share';
  }
  
  // Return the HTML for the frame
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${image}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/absolute-fix" />
  <meta property="fc:frame:button:1" content="${button1}" />
  <meta property="fc:frame:button:2" content="${button2}" />
  <meta property="fc:frame:button:3" content="${button3}" />
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>`;
}