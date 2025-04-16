/**
 * Ultra-minimal test endpoint
 */
module.exports = (req, res) => {
  try {
    // Log everything we get
    console.log('Test endpoint hit with request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
    
    // Return the most basic possible response
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png">
        <meta property="fc:frame:button:1" content="It Worked!">
        <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/test">
      </head>
      <body>
        <h1>Button Clicked Successfully!</h1>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return res.status(500).send('Error');
  }
};