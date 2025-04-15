/**
 * Direct HTML handler with no dependencies
 * Returns a complete HTML page for Warpcast Frame
 */

export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://i.ibb.co/TWSXrFT/og.png">
  <meta property="fc:frame:button:1" content="24h">
  <meta property="fc:frame:button:2" content="7d">
  <meta property="fc:frame:button:3" content="Share">
  <title>Warplet Traders</title>
</head>
<body>
  <h1>Warplet Traders - Direct HTML API</h1>
  <p>View the top 5 traders among your warpcast follows</p>
</body>
</html>`;

  res.status(200).send(html);
}