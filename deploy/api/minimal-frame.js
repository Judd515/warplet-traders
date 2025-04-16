/**
 * Ultra-simple minimal frame handler
 * This uses the absolute minimum code required to respond to a frame
 */
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Log everything for debugging
    console.log('Minimal frame request received:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body || {}
    });
    
    // Return the simplest possible frame response
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png">
        <meta property="fc:frame:button:1" content="Success!">
        <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/minimal-frame">
      </head>
      <body>
        <h1>Minimal Frame Response</h1>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in minimal frame:', error);
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png">
        <meta property="fc:frame:button:1" content="Error Occurred">
        <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/minimal-frame">
      </head>
      <body>
        <h1>Error in Minimal Frame</h1>
      </body>
      </html>
    `);
  }
};