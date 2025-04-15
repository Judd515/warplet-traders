/**
 * Ultra-basic Warpcast Frame
 * Uses the absolute minimum HTML required
 */

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  
  const html = `<!DOCTYPE html>
<html>
<head>
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://i.imgur.com/k9KaLKk.png" />
<meta property="fc:frame:button:1" content="24 Hours" />
<meta property="fc:frame:button:2" content="7 Days" />
<meta property="fc:frame:button:3" content="Share" />
<meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/simple" />
</head>
<body>
<p>Warplet Traders</p>
</body>
</html>`;
  
  return res.status(200).send(html);
};