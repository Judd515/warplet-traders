/**
 * Minimal Warpcast Frame Handler
 * This is a simplified version that avoids potential issues with the main handler
 */

// Default image URL
const DEFAULT_IMAGE_URL = 'https://i.imgur.com/k9KaLKk.png';

module.exports = (req, res) => {
  console.log('Minimal frame handler request received');
  
  // Set proper content type
  res.setHeader('Content-Type', 'text/html');
  
  // Get button index if available
  let buttonIndex = 1;
  
  try {
    if (req.body && req.body.untrustedData && req.body.untrustedData.buttonIndex) {
      buttonIndex = parseInt(req.body.untrustedData.buttonIndex, 10);
    } else if (req.body && req.body.buttonIndex) {
      buttonIndex = parseInt(req.body.buttonIndex, 10);
    }
  } catch (e) {
    console.error('Error parsing button data:', e);
  }
  
  // Determine timeframe based on button
  let timeframe = '24h';
  if (buttonIndex === 2) {
    timeframe = '7d';
  }
  
  // Sample data for minimal display
  const sampleData = [
    { username: "thcradio", topToken: "BTC", pnl: timeframe === '24h' ? 76 : 34 },
    { username: "wakaflocka", topToken: "USDC", pnl: timeframe === '24h' ? -39 : -12 },
    { username: "hellno.eth", topToken: "DEGEN", pnl: timeframe === '24h' ? 49 : 22 },
    { username: "karima", topToken: "ARB", pnl: timeframe === '24h' ? -55 : -28 },
    { username: "chrislarsc.eth", topToken: "ETH", pnl: timeframe === '24h' ? -63 : -15 }
  ];
  
  // Generate traders list
  const tradersList = sampleData.map((trader, index) => {
    const pnlValue = trader.pnl;
    const pnlColor = pnlValue >= 0 ? 'green' : 'red';
    const pnlSign = pnlValue >= 0 ? '+' : '';
    const pnlFormatted = `${pnlSign}${pnlValue}%`;
    
    return `<li>${index + 1}. ${trader.username} (${trader.topToken}): <span style="color:${pnlColor}">${pnlFormatted}</span></li>`;
  }).join('');
  
  // Special case for share button
  if (buttonIndex === 3) {
    // Simple share view with minimal HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${DEFAULT_IMAGE_URL}" />
          <meta property="fc:frame:button:1" content="Back to Traders" />
          <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/minimal-frame" />
        </head>
        <body>
          <p>Share Top Warplet Traders with your followers!</p>
        </body>
      </html>
    `;
    
    return res.status(200).send(html);
  }
  
  // Standard view with current timeframe
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${DEFAULT_IMAGE_URL}" />
        <meta property="fc:frame:button:1" content="24 Hours" />
        <meta property="fc:frame:button:2" content="7 Days" />
        <meta property="fc:frame:button:3" content="Share" />
        <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/minimal-frame" />
      </head>
      <body>
        <h1>Top Warplet Traders</h1>
        <p>Timeframe: ${timeframe === '24h' ? '24 Hours' : '7 Days'}</p>
        <ul>
          ${tradersList}
        </ul>
      </body>
    </html>
  `;
  
  return res.status(200).send(html);
};