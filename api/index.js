/**
 * This is a single API file that works on Vercel's Hobby plan
 * It handles all frame interactions in one file
 */

module.exports = (req, res) => {
  // Enable CORS - critical for frames
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log the request
  console.log('Frame request received:', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body || {}
  });
  
  // Set content type
  res.setHeader('Content-Type', 'text/html');
  
  // Extract button index
  let buttonIndex = 1;
  if (req.body && req.body.untrustedData && req.body.untrustedData.buttonIndex) {
    buttonIndex = parseInt(req.body.untrustedData.buttonIndex, 10);
  }
  
  console.log(`Button index: ${buttonIndex}`);
  
  // Generate response based on button
  let html = '';
  
  switch(buttonIndex) {
    case 1: // 24h Data
      html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://i.imgur.com/LWL18gi.png">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api">
</head>
<body>
  <h1>24h Top Traders</h1>
</body>
</html>
      `;
      break;
      
    case 2: // 7d Data
      html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://i.imgur.com/0eXt1zi.png">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api">
</head>
<body>
  <h1>7d Top Traders</h1>
</body>
</html>
      `;
      break;
      
    case 3: // Share button
      const shareText = encodeURIComponent(
        `Top Warplet Earners (7d)\n\n1. @thcradio (BTC): $3,580 / $42.5K volume\n2. @wakaflocka (USDC): $2,940 / $38.7K volume\n3. @chrislarsc.eth (ETH): $2,450 / $31.2K volume\n4. @hellno.eth (DEGEN): $1,840 / $24.6K volume\n5. @karima (ARB): $1,250 / $18.9K volume\n\nhttps://warplet-traders.vercel.app`
      );
      return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      
    case 4: // Check My Follows
      html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://i.imgur.com/mfQaxzJ.png">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api">
</head>
<body>
  <h1>Checking Your Follows</h1>
</body>
</html>
      `;
      break;
      
    default: // Default/initial view
      html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://i.imgur.com/QT7rPHB.png">
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
  }
  
  // Send the response
  return res.status(200).send(html);
};