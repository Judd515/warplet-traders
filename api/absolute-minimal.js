// Absolute minimal frame implementation
// Based on "Hello World" example from frames.js
export default function handler(req, res) {
  // Return the HTML with ABSOLUTE image URLs
  if (req.method === "POST") {
    // Handle button clicks based on buttonIndex
    const { buttonIndex } = req.body?.untrustedData || {};
    
    if (buttonIndex === 1) {
      // Return a different frame
      return res.status(200).send(`
<!DOCTYPE html>
<html>
  <head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/24h.png" />
    <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/absolute-minimal" />
    <meta property="fc:frame:button:1" content="View Main" />
    <meta property="fc:frame:button:2" content="View 7d" />
  </head>
  <body>24h Data</body>
</html>
      `);
    } else if (buttonIndex === 2) {
      // Return a different frame
      return res.status(200).send(`
<!DOCTYPE html>
<html>
  <head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/7d.png" />
    <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/absolute-minimal" />
    <meta property="fc:frame:button:1" content="View 24h" />
    <meta property="fc:frame:button:2" content="View Main" />
  </head>
  <body>7d Data</body>
</html>
      `);
    }
  }
  
  // Default HTML for GET requests
  return res.status(200).send(`
<!DOCTYPE html>
<html>
  <head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/main.png" />
    <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/absolute-minimal" />
    <meta property="fc:frame:button:1" content="View 24h" />
    <meta property="fc:frame:button:2" content="View 7d" />
  </head>
  <body>Main Frame</body>
</html>
  `);
}