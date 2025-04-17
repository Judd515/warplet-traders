/**
 * Crash-proof Warpcast Frame API
 * This is the simplest possible API that cannot fail
 */

module.exports = (req, res) => {
  try {
    // Set basic headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html');
    
    // Always respond with the same frame
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x630/1e293b/FFFFFF?text=Working+Frame">
  <meta property="fc:frame:button:1" content="Option 1">
  <meta property="fc:frame:button:2" content="Option 2">
  <meta property="fc:frame:button:3" content="Option 3">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api">
</head>
<body>
  <h1>Basic Frame Response</h1>
</body>
</html>
    `;
    
    // Always return 200 OK
    return res.status(200).send(html);
  } catch (error) {
    // Absolute fallback - should never reach here
    return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x630/1e293b/FFFFFF?text=Fallback+Frame">
  <meta property="fc:frame:button:1" content="Retry">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api">
</head>
<body>
  <h1>Fallback Response</h1>
</body>
</html>
    `);
  }
};