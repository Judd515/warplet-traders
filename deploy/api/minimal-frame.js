/**
 * Ultra-minimal frame handler
 * Contains only the absolute essentials needed for a working frame
 */

module.exports = function minimalFrameHandler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log request for debugging
  console.log('MINIMAL FRAME REQUEST:', {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers
  });
  
  // Extract button index if present
  let buttonIndex = 1;
  if (req.body && req.body.untrustedData && req.body.untrustedData.buttonIndex) {
    buttonIndex = parseInt(req.body.untrustedData.buttonIndex, 10);
  }
  
  // Simple HTML response - use external image URL
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x628/1E293B/FFFFFF?text=Button+${buttonIndex}+Response">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/minimal-frame">
</head>
<body>
  <h1>Button ${buttonIndex} was clicked</h1>
</body>
</html>
  `;
  
  // Return the HTML, always using status 200
  return res.status(200).send(html);
};