/**
 * Minimal Frame for Production
 */

export default function handler(req, res) {
  try {
    // Log the request
    console.log('Minimal frame request received:', req.method);
    
    // Always set proper content type
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // For POST requests, handle button clicks
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex } = req.body.untrustedData;
      console.log('Button clicked:', buttonIndex);
      
      // Handle Share button
      if (buttonIndex === 2) {
        const shareText = encodeURIComponent(
          `Check out the top Warplet traders on BASE!\n\nhttps://warplet-traders.vercel.app/api`
        );
        return res.status(302).setHeader('Location', `https://warpcast.com/~/compose?text=${shareText}`).send();
      }
      
      // Handle Tip button
      if (buttonIndex === 3) {
        return res.status(302).setHeader('Location', `https://warpcast.com/0xjudd`).send();
      }
    }
    
    // Default response for GET and other cases
    return res.status(200).send(generateFrameHtml());
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).send(generateFrameHtml());
  }
}

function generateFrameHtml() {
  // Hard-coded URLs with absolute paths
  const baseUrl = 'https://warplet-traders.vercel.app';
  const imagePath = '/static-image.svg';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Warplet Traders</title>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}${imagePath}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/minimal-frame" />
  <meta property="fc:frame:button:1" content="View 7d Data" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
  <meta property="og:image" content="${baseUrl}${imagePath}" />
</head>
<body>
  <h1>Warplet Traders</h1>
</body>
</html>`;
}