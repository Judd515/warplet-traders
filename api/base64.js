// Base64 image API
export default function handler(req, res) {
  // Cache for 10 seconds
  res.setHeader('Cache-Control', 's-maxage=10');
  
  // Handle POST requests (button clicks)
  if (req.method === 'POST') {
    try {
      // Parse button index
      let buttonIndex = 1;
      try {
        const body = JSON.parse(req.body || '{}');
        buttonIndex = body?.untrustedData?.buttonIndex || 1;
      } catch (e) {
        console.error('Failed to parse request body:', e);
      }
      
      if (buttonIndex === 1) {
        // 24h button
        return res.status(200).send(generate24hFrame());
      } else if (buttonIndex === 2) {
        // 7d button
        return res.status(200).send(generate7dFrame());
      } else if (buttonIndex === 3) {
        // Share button
        return res.status(200).send(generateShareFrame());
      } else {
        // Default
        return res.status(200).send(generateMainFrame());
      }
    } catch (error) {
      console.error('Error handling frame action:', error);
      return res.status(200).send(generateErrorFrame());
    }
  } else {
    // GET requests - show main frame
    return res.status(200).send(generateMainFrame());
  }
}

// Simple single-color SVG to base64
function getBase64Svg(text, background = '#1e293b', foreground = '#ffffff') {
  const svgContent = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${background}"/>
  <text x="600" y="315" font-family="Arial" font-size="60" text-anchor="middle" fill="${foreground}">${text}</text>
</svg>`;
  
  // Convert SVG to base64
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Frame generation functions
function generateMainFrame() {
  const imageUrl = getBase64Svg('Warplet Top Traders');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
</head>
<body></body>
</html>`;
}

function generate24hFrame() {
  const imageUrl = getBase64Svg('24h Top Traders');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:button:1" content="Back to Main">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
</head>
<body></body>
</html>`;
}

function generate7dFrame() {
  const imageUrl = getBase64Svg('7d Top Traders');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="Back to Main">
  <meta property="fc:frame:button:3" content="Share Results">
</head>
<body></body>
</html>`;
}

function generateShareFrame() {
  const imageUrl = getBase64Svg('Share Top Traders');
  const shareUrl = "https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%243%2C580%20%2F%20%2442.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%242%2C940%20%2F%20%2438.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%242%2C450%20%2F%20%2431.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%241%2C840%20%2F%20%2424.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%241%2C250%20%2F%20%2418.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Open Share URL">
  <meta property="fc:frame:button:3:action" content="link">
  <meta property="fc:frame:button:3:target" content="${shareUrl}">
</head>
<body></body>
</html>`;
}

function generateErrorFrame() {
  const imageUrl = getBase64Svg('Error Occurred');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:button:1" content="Try Again">
</head>
<body></body>
</html>`;
}