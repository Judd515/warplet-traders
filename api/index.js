/**
 * Ultra-minimal frame API for Warpcast
 * This is a very simple API that handles all frame interactions
 */

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Set content type
  res.setHeader('Content-Type', 'text/html');
  
  // Default image
  let imageUrl = "https://i.imgur.com/QT7rPHB.png";
  
  // Log request for debugging
  console.log(`Frame API request: ${req.method} ${req.url}`);
  try {
    console.log('Request body:', JSON.stringify(req.body || {}));
  } catch (e) {
    console.log('Error logging body:', e.message);
  }
  
  // Get button index from request
  let buttonIndex = 1;
  try {
    if (req.body && req.body.untrustedData && req.body.untrustedData.buttonIndex) {
      buttonIndex = parseInt(req.body.untrustedData.buttonIndex, 10);
      console.log(`Button index: ${buttonIndex}`);
    }
  } catch (e) {
    console.log('Error parsing button index:', e.message);
  }
  
  // Change image based on button
  if (buttonIndex === 1) {
    imageUrl = "https://i.imgur.com/LWL18gi.png"; // 24h data
  } else if (buttonIndex === 2) {
    imageUrl = "https://i.imgur.com/0eXt1zi.png"; // 7d data
  } else if (buttonIndex === 3) {
    // Share button - redirect to Warpcast composer
    const shareText = encodeURIComponent(
      `Top Warplet Earners (7d)\n\n1. @thcradio (BTC): $3,580 / $42.5K volume\n2. @wakaflocka (USDC): $2,940 / $38.7K volume\n3. @chrislarsc.eth (ETH): $2,450 / $31.2K volume\n4. @hellno.eth (DEGEN): $1,840 / $24.6K volume\n5. @karima (ARB): $1,250 / $18.9K volume\n\nhttps://warplet-traders.vercel.app/clean-frame.html`
    );
    return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
  } else if (buttonIndex === 4) {
    imageUrl = "https://i.imgur.com/mfQaxzJ.png"; // Check my follows
  }
  
  // Minimal frame HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api">
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>
  `;
  
  return res.status(200).send(html);
};