// Absolute minimal serverless function for Vercel
// No dependencies, no imports, just pure vanilla JavaScript

module.exports = (req, res) => {
  // Set headers
  res.setHeader('Content-Type', 'text/html');
  
  // Static HTML with Farcaster Frame metadata
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Top Warplet Traders</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250412-1&t=${Date.now()}" />
    <meta property="fc:frame:button:1" content="24 Hours" />
    <meta property="fc:frame:button:2" content="7 Days" />
    <meta property="fc:frame:button:3" content="Share Results" />
    <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/minimal" />
  </head>
  <body>
    <h1>Top Warplet Traders</h1>
    <p>Timeframe: 24 Hours</p>
    <ul>
      <li>1. thcradio (BTC): +76%</li>
      <li>2. hellno.eth (DEGEN): +49%</li>
      <li>3. wakaflocka (USDC): -39%</li>
      <li>4. karima (ARB): -55%</li>
      <li>5. chrislarsc.eth (ETH): -63%</li>
    </ul>
  </body>
</html>`;

  // Return simple HTML response
  res.statusCode = 200;
  return res.end(html);
};