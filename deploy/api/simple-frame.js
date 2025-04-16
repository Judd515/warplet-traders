/**
 * Simple Frame Handler for Warpcast
 * This is a simplified version without complex logic to ensure basic reliability
 */

module.exports = (req, res) => {
  try {
    console.log('Simple frame request received:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body || {}
    });
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Content-Type', 'text/html');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Extract button index from request
    let buttonIndex = 1;
    if (req.body?.untrustedData?.buttonIndex) {
      buttonIndex = parseInt(req.body.untrustedData.buttonIndex, 10);
    }
    
    console.log(`Button index: ${buttonIndex}`);
    
    // Switch based on button index
    let frameHtml;
    switch (buttonIndex) {
      case 1:
        frameHtml = generate24hFrame();
        break;
      case 2:
        frameHtml = generate7dFrame();
        break;
      case 3:
        // Share button - redirect to composer
        const shareText = encodeURIComponent(
          `Top Warplet Earners (7d)\n\n1. @thcradio (BTC): $3,580 / $42.5K volume\n2. @wakaflocka (USDC): $2,940 / $38.7K volume\n3. @chrislarsc.eth (ETH): $2,450 / $31.2K volume\n4. @hellno.eth (DEGEN): $1,840 / $24.6K volume\n5. @karima (ARB): $1,250 / $18.9K volume\n\nhttps://warplet-traders.vercel.app`
        );
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      case 4:
        frameHtml = generateCheckMeFrame();
        break;
      default:
        frameHtml = generate7dFrame();
    }
    
    return res.status(200).send(frameHtml);
  } catch (error) {
    console.error('Error in simple frame handler:', error);
    return res.status(200).send(generateErrorFrame());
  }
};

// Generate 24h data frame
function generate24hFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/simple-frame">
  <title>24h Top Warplet Traders</title>
</head>
<body>
  <h1>Top Warplet Earners (24h)</h1>
</body>
</html>
  `;
}

// Generate 7d data frame
function generate7dFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/simple-frame">
  <title>7d Top Warplet Traders</title>
</head>
<body>
  <h1>Top Warplet Earners (7d)</h1>
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
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/simple-frame">
  <title>Check My Follows</title>
</head>
<body>
  <h1>Checking Your Follows</h1>
</body>
</html>
  `;
}

// Generate User Loading frame (when we have a FID)
function generateUserLoadingFrame(fid) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png">
  <meta property="fc:frame:button:1" content="View Results">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/simple-frame">
  <title>Loading Your Data</title>
</head>
<body>
  <h1>Loading Data for FID: ${fid}</h1>
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
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png">
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/simple-frame">
  <title>Error</title>
</head>
<body>
  <h1>An error occurred</h1>
</body>
</html>
  `;
}