/**
 * Direct HTML handler with no dependencies
 * Returns a complete HTML page for Warpcast Frame
 */

module.exports = (req, res) => {
  // Set content type
  res.setHeader('Content-Type', 'text/html');
  
  // Create HTML directly
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Top Warplet Traders</title>
        
        <!-- Farcaster Frame Tags -->
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://topwarplettraders.vercel.app/og.png" />
        <meta property="fc:frame:button:1" content="24 Hours" />
        <meta property="fc:frame:button:2" content="7 Days" />
        <meta property="fc:frame:button:3" content="Share Results" />
        <meta property="fc:frame:post_url" content="https://topwarplettraders.vercel.app/api/direct-html" />
        
        <style>
          body {
            font-family: sans-serif;
            background-color: #1e293b;
            color: white;
            padding: 20px;
            margin: 0;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 16px;
          }
          .trader-row {
            display: flex;
            margin-bottom: 8px;
            align-items: center;
          }
          .rank {
            width: 20px;
            margin-right: 8px;
          }
          .username {
            flex-grow: 1;
            font-weight: bold;
          }
          .pnl {
            width: 70px;
            text-align: right;
          }
          .token {
            width: 60px;
            text-align: right;
            margin-left: 8px;
            font-size: 0.8em;
            color: #888;
          }
        </style>
      </head>
      <body>
        <h1>Top Warplet Traders</h1>
        <div style="color: #94a3b8; margin-bottom: 20px;">Timeframe: 24 Hours</div>
        
        <div class="trader-row">
          <div class="rank">1.</div>
          <div class="username">thcradio</div>
          <div class="pnl" style="color: green;">+76%</div>
          <div class="token">BTC</div>
        </div>
        
        <div class="trader-row">
          <div class="rank">2.</div>
          <div class="username">hellno.eth</div>
          <div class="pnl" style="color: green;">+49%</div>
          <div class="token">DEGEN</div>
        </div>
        
        <div class="trader-row">
          <div class="rank">3.</div>
          <div class="username">wakaflocka</div>
          <div class="pnl" style="color: red;">-39%</div>
          <div class="token">USDC</div>
        </div>
        
        <div class="trader-row">
          <div class="rank">4.</div>
          <div class="username">karima</div>
          <div class="pnl" style="color: red;">-55%</div>
          <div class="token">ARB</div>
        </div>
        
        <div class="trader-row">
          <div class="rank">5.</div>
          <div class="username">chrislarsc.eth</div>
          <div class="pnl" style="color: red;">-63%</div>
          <div class="token">ETH</div>
        </div>
      </body>
    </html>
  `;
  
  // Send HTML
  res.status(200).send(html);
};