// Ultra-minimal API implementation with no dependencies
export default function handler(req, res) {
  // Simple rate limiting
  res.setHeader('Cache-Control', 's-maxage=10');
  
  // If it's a POST request, it's a button click
  if (req.method === 'POST') {
    try {
      // Parse the buttonIndex from the request body
      let buttonIndex = 1;
      try {
        const body = req.body;
        buttonIndex = body?.untrustedData?.buttonIndex || 1;
      } catch (e) {
        console.error('Failed to parse button index:', e);
      }
      
      if (buttonIndex === 1) {
        // 24h button
        return res.status(200).send(generate24hFrame());
      } else if (buttonIndex === 2) {
        // 7d button
        return res.status(200).send(generate7dFrame());
      } else if (buttonIndex === 3) {
        // Share button - redirects to Warpcast compose
        return res.status(200).send(generateShareFrame());
      } else {
        // Default to main frame
        return res.status(200).send(generateMainFrame());
      }
    } catch (error) {
      console.error('Error handling frame action:', error);
      return res.status(200).send(generateErrorFrame());
    }
  } else {
    // Initial GET request, show the main frame
    return res.status(200).send(generateMainFrame());
  }
}

function generateMainFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://i.imgur.com/JqPZsZ4.png">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="og:title" content="Warplet Top Traders">
  <meta property="og:description" content="See which traders are making the most with their Warplet">
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>
  `;
}

function generate24hFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://i.imgur.com/U8Aavdu.png">
  <meta property="fc:frame:button:1" content="Back to Main">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="og:title" content="24h Top Warplet Traders">
  <meta property="og:description" content="Top earners over the last 24 hours">
</head>
<body>
  <h1>24h Top Warplet Traders</h1>
</body>
</html>
  `;
}

function generate7dFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://i.imgur.com/YcK03k0.png">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="Back to Main">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="og:title" content="7d Top Warplet Traders">
  <meta property="og:description" content="Top earners over the last 7 days">
</head>
<body>
  <h1>7d Top Warplet Traders</h1>
</body>
</html>
  `;
}

function generateShareFrame() {
  const shareUrl = "https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%243%2C580%20%2F%20%2442.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%242%2C940%20%2F%20%2438.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%242%2C450%20%2F%20%2431.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%241%2C840%20%2F%20%2424.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%241%2C250%20%2F%20%2418.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://i.imgur.com/JqPZsZ4.png">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Open Share URL">
  <meta property="fc:frame:button:3:action" content="link">
  <meta property="fc:frame:button:3:target" content="${shareUrl}">
  <meta property="og:title" content="Warplet Top Traders">
  <meta property="og:description" content="Share your top trader results">
</head>
<body>
  <h1>Share Top Warplet Traders</h1>
</body>
</html>
  `;
}

function generateErrorFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://i.imgur.com/JqPZsZ4.png">
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="og:title" content="Error">
  <meta property="og:description" content="Something went wrong">
</head>
<body>
  <h1>Error</h1>
</body>
</html>
  `;
}