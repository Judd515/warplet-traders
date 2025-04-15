/**
 * Bare-minimum standalone handler for Farcaster Frame with no dependencies
 */

// Main handler function
module.exports = function frameActionHandler(req, res) {
  try {
    console.log('Frame action request received');
    
    // Get button index from request if available
    let buttonIndex = 1; // Default to 24h view
    
    if (req.body && req.body.untrustedData && req.body.untrustedData.buttonIndex) {
      buttonIndex = parseInt(req.body.untrustedData.buttonIndex, 10);
    }
    
    // Determine timeframe based on button
    let timeframe = '24h';
    if (buttonIndex === 2) {
      timeframe = '7d';
    }
    
    // Handle share action (button 3)
    if (buttonIndex === 3) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250415&t=${Date.now()}" />
            <meta property="fc:frame:button:1" content="View Top Traders" />
            <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/frame-action" />
          </head>
          <body>
            <p>Share this with your followers!</p>
          </body>
        </html>
      `);
    }
    
    // Fixed sample data with no dependencies
    const sampleData = [
      { username: "thcradio", topToken: "BTC", pnl: timeframe === '24h' ? 76 : 34 },
      { username: "wakaflocka", topToken: "USDC", pnl: timeframe === '24h' ? -39 : -12 },
      { username: "hellno.eth", topToken: "DEGEN", pnl: timeframe === '24h' ? 49 : 22 },
      { username: "karima", topToken: "ARB", pnl: timeframe === '24h' ? -55 : -28 },
      { username: "chrislarsc.eth", topToken: "ETH", pnl: timeframe === '24h' ? -63 : -15 }
    ];
      
    // Generate HTML rows for traders
    const tradersHtml = sampleData.map((trader, index) => {
      const pnlValue = trader.pnl;
      const pnlColor = pnlValue >= 0 ? 'green' : 'red';
      const pnlSign = pnlValue >= 0 ? '+' : '';
      const pnlFormatted = `${pnlSign}${pnlValue}%`;
      
      return `
        <div style="display:flex; margin-bottom:8px; align-items:center;">
          <div style="width:20px; margin-right:8px;">${index + 1}.</div>
          <div style="flex-grow:1; font-weight:bold;">${trader.username}</div>
          <div style="width:70px; text-align:right; color:${pnlColor};">${pnlFormatted}</div>
          <div style="width:60px; text-align:right; margin-left:8px; font-size:0.8em; color:#888;">${trader.topToken}</div>
        </div>
      `;
    }).join('');
    
    // Return the complete HTML
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250415&t=${Date.now()}" />
          <meta property="fc:frame:button:1" content="24 Hours" />
          <meta property="fc:frame:button:2" content="7 Days" />
          <meta property="fc:frame:button:3" content="Share Results" />
          <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/frame-action" />
        </head>
        <body>
          <h1>Top Warplet Traders</h1>
          <div>Timeframe: ${timeframe === '24h' ? '24 Hours' : '7 Days'}</div>
          <div>${tradersHtml}</div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in frame action:', error);
    
    // Return error frame
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250415&t=${Date.now()}" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/frame-action" />
        </head>
        <body>
          <p>An error occurred. Please try again.</p>
        </body>
      </html>
    `);
  }
};