/**
 * Frame Action Handler for Warpcast
 * Handles button clicks and generates dynamic responses
 */

module.exports = async function handler(req, res) {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    // Get the button index from request (default to 1 if not provided)
    const buttonIndex = req.body?.untrustedData?.buttonIndex || 1;
    const fid = req.body?.untrustedData?.fid;
    
    console.log('Frame action received:', { buttonIndex, fid });
    
    // Generate dynamic image based on button clicked
    let timeframe = '24h';
    let nextImage;
    let responseButtons;
    
    if (buttonIndex === 1) {
      // 24h timeframe was selected
      timeframe = '24h';
      responseButtons = [
        { label: "24h", action: "post" },
        { label: "7d", action: "post" },
        { label: "Share", action: "post_redirect" }
      ];
      nextImage = generateSvgForTimeframe(timeframe);
    } else if (buttonIndex === 2) {
      // 7d timeframe was selected
      timeframe = '7d';
      responseButtons = [
        { label: "24h", action: "post" },
        { label: "7d", action: "post" },
        { label: "Share", action: "post_redirect" }
      ];
      nextImage = generateSvgForTimeframe(timeframe);
    } else if (buttonIndex === 3) {
      // Share button was clicked
      return res.status(302).setHeader('Location', 'https://warpcast.com/~/compose?text=Check%20out%20my%20top%20traders%20on%20Warplet!%20%0A%0Ahttps://warplet-traders.vercel.app/text-only.html').end();
    } else {
      // Default case
      nextImage = generateSvgForTimeframe('24h');
      responseButtons = [
        { label: "24h", action: "post" },
        { label: "7d", action: "post" },
        { label: "Share", action: "post_redirect" }
      ];
    }
    
    // Return HTML with next frame
    res.setHeader('Content-Type', 'text/html');
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,${Buffer.from(nextImage).toString('base64')}">
  <meta property="fc:frame:button:1" content="24h">
  <meta property="fc:frame:button:2" content="7d">
  <meta property="fc:frame:button:3" content="Share">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/frame-action">
</head>
<body>
  <h1>Warplet Traders - ${timeframe} Data</h1>
</body>
</html>`;
    
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error in frame action handler:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Function to generate SVG for different timeframes
function generateSvgForTimeframe(timeframe) {
  const bgColor = '#1E243B';
  const textColor = '#FFFFFF';
  
  // Sample trader data (in production, this would come from a database or API)
  const traders = [
    { username: "thcradio", topToken: "BTC", pnl24h: "+76", pnl7d: "+124" },
    { username: "wakaflocka", topToken: "USDC", pnl24h: "-39", pnl7d: "+82" },
    { username: "hellno.eth", topToken: "DEGEN", pnl24h: "+49", pnl7d: "-12" },
    { username: "karima", topToken: "ARB", pnl24h: "-55", pnl7d: "-83" },
    { username: "chrislarsc.eth", topToken: "ETH", pnl24h: "-63", pnl7d: "+47" }
  ];
  
  // Create rows for SVG table
  let tableRows = '';
  traders.forEach((trader, index) => {
    const pnlValue = timeframe === '24h' ? trader.pnl24h : trader.pnl7d;
    const pnlColor = pnlValue.startsWith('+') ? '#4ADE80' : '#EF4444';
    
    tableRows += `
      <g transform="translate(0, ${120 + index * 50})">
        <line x1="50" y1="45" x2="750" y2="45" stroke="#40516B" stroke-width="1" />
        <text x="100" y="25" fill="${textColor}" font-family="Arial" font-size="24">@${trader.username}</text>
        <text x="400" y="25" fill="${textColor}" font-family="Arial" font-size="24">${trader.topToken}</text>
        <text x="650" y="25" fill="${pnlColor}" font-family="Arial" font-size="24">${pnlValue}</text>
      </g>
    `;
  });
  
  // Create the complete SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400" fill="none">
    <rect width="800" height="400" fill="${bgColor}"/>
    
    <!-- Title -->
    <text x="60" y="50" font-family="Arial" font-size="36" fill="${textColor}" font-weight="bold">TOP WARPLET TRADERS</text>
    <text x="60" y="90" font-family="Arial" font-size="28" fill="${textColor}">Your Top Traders (${timeframe})</text>
    
    <!-- Table Headers -->
    <text x="100" y="130" font-family="Arial" font-size="24" fill="#94A3B8">Wallet</text>
    <text x="400" y="130" font-family="Arial" font-size="24" fill="#94A3B8">Top Token</text>
    <text x="650" y="130" font-family="Arial" font-size="24" fill="#94A3B8">${timeframe} PnL</text>
    
    <!-- Trader Rows -->
    ${tableRows}
  </svg>`;
}