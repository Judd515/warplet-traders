/**
 * External Image Frame Handler
 * Based on the previously working implementation that used external image URLs
 * With relative URLs for post_url to support any domain
 */

export default function handler(req, res) {
  // Set Cache-Control header for better performance
  res.setHeader('Cache-Control', 's-maxage=10');
  
  // Get button index from request (if it's a POST)
  let buttonIndex = 1;
  let fid = 0;
  
  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (body?.untrustedData?.buttonIndex) {
        buttonIndex = body.untrustedData.buttonIndex;
      }
      if (body?.untrustedData?.fid) {
        fid = body.untrustedData.fid;
      }
      console.log(`Button clicked: ${buttonIndex} by FID: ${fid}`);
    } catch (e) {
      console.error('Error parsing request:', e);
    }
    
    // Process button clicks
    if (buttonIndex === 1) {
      return res.status(200).send(generate24hFrame());
    } else if (buttonIndex === 2) {
      return res.status(200).send(generate7dFrame());
    } else if (buttonIndex === 3) {
      return res.status(200).send(generateCheckMeFrame(fid));
    } else if (buttonIndex === 4) {
      return res.status(200).send(generateShareFrame());
    }
  }
  
  // Default to main frame for all other cases
  return res.status(200).send(generateMainFrame());
}

function generateMainFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/main.png">
  <meta property="fc:frame:post_url" content="/api/external-image-frame-rel">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>`;
}

function generate24hFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/24h.png">
  <meta property="fc:frame:post_url" content="/api/external-image-frame-rel">
  <meta property="fc:frame:button:1" content="Back to Main">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(24h)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%243%2C580%20%2F%20%2442.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%242%2C940%20%2F%20%2438.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%242%2C450%20%2F%20%2431.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%241%2C840%20%2F%20%2424.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%241%2C250%20%2F%20%2418.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body>
  <h1>24h Top Warplet Traders</h1>
</body>
</html>`;
}

function generate7dFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/7d.png">
  <meta property="fc:frame:post_url" content="/api/external-image-frame-rel">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="Back to Main">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body>
  <h1>7d Top Warplet Traders</h1>
</body>
</html>`;
}

function generateCheckMeFrame(fid) {
  // For the check me button, we can use the main image for now
  // Later, this can be replaced with a user-specific image
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/check-me.png">
  <meta property="fc:frame:post_url" content="/api/external-image-frame-rel">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Back to Main">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=My%20Top%20Warplet%20Earners%0A%0A1.%20%400xjudd_friend_1%20(ETH)%3A%20%245%2C720%20%2F%20%2462.5K%20volume%0A2.%20%40follow_12915_2%20(BTC)%3A%20%243%2C940%20%2F%20%2447.6K%20volume%0A3.%20%40judd_trader_3%20(USDC)%3A%20%243%2C350%20%2F%20%2439.8K%20volume%0A4.%20%40fc_judd_4%20(ARB)%3A%20%242%2C840%20%2F%20%2432.3K%20volume%0A5.%20%40cast_judd_5%20(DEGEN)%3A%20%241%2C950%20%2F%20%2425.9K%20volume%0A%0ACheck%20your%20own%20data%3A%20https%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body>
  <h1>My Top Warplet Traders (FID: ${fid})</h1>
</body>
</html>`;
}

function generateShareFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/share.png">
  <meta property="fc:frame:post_url" content="/api/external-image-frame-rel">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Back to Main">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body>
  <p>Opening share composer...</p>
</body>
</html>`;
}