/**
 * Ultra-simple root API handler for Vercel serverless deployment
 */

module.exports = function(req, res) {
  // Just return a basic response for testing
  // Static sample data
  const sampleData = [
    { username: "thcradio", topToken: "BTC", pnl: 76 },
    { username: "wakaflocka", topToken: "USDC", pnl: -39 },
    { username: "hellno.eth", topToken: "DEGEN", pnl: 49 },
    { username: "karima", topToken: "ARB", pnl: -55 },
    { username: "chrislarsc.eth", topToken: "ETH", pnl: -63 }
  ];
  
  // Generate HTML for display
  const tradersHtml = sampleData.map((trader, index) => {
    const pnlColor = trader.pnl >= 0 ? 'green' : 'red';
    const pnlSign = trader.pnl >= 0 ? '+' : '';
    const pnlFormatted = `${pnlSign}${trader.pnl}%`;
    
    return `
      <div style="display:flex; margin-bottom:8px; align-items:center;">
        <div style="width:20px; margin-right:8px;">${index + 1}.</div>
        <div style="flex-grow:1; font-weight:bold;">${trader.username}</div>
        <div style="width:70px; text-align:right; color:${pnlColor};">${pnlFormatted}</div>
        <div style="width:60px; text-align:right; margin-left:8px; color:#888;">${trader.topToken}</div>
      </div>
    `;
  }).join('');
  
  // Return HTML with frame headers
  return res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://topwarplettraders.vercel.app/og.png" />
        <meta property="fc:frame:button:1" content="24 Hours" />
        <meta property="fc:frame:button:2" content="7 Days" />
        <meta property="fc:frame:button:3" content="Share Results" />
        <meta property="fc:frame:post_url" content="https://topwarplettraders.vercel.app/api/frame-action" />
      </head>
      <body>
        <h1>Top Warplet Traders</h1>
        <div>Timeframe: 24 Hours</div>
        <div>${tradersHtml}</div>
      </body>
    </html>
  `);
};