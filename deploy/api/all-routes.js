/**
 * Combined API handler for all routes
 * This is a workaround for the Vercel Hobby plan's 12 serverless function limit
 */

module.exports = (req, res) => {
  // Extract the path from the request
  const path = req.url.split('?')[0];
  console.log(`Request received for path: ${path}`);
  
  // Handle different routes based on the path
  if (path === '/api/health' || path === '/health') {
    return handleHealth(req, res);
  }
  
  if (path === '/api/frame-action' || path === '/frame-action') {
    return handleFrame(req, res);
  }
  
  if (path === '/api/minimal' || path === '/minimal') {
    return handleMinimal(req, res);
  }
  
  if (path === '/api/edge' || path === '/edge') {
    return handleEdge(req, res);
  }
  
  if (path === '/api/direct-html' || path === '/direct-html') {
    return handleDirectHtml(req, res);
  }
  
  // Default handler
  return handleFrame(req, res);
};

/**
 * Health check handler
 */
function handleHealth(req, res) {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Warplet Traders API is running'
  });
}

/**
 * Frame action handler
 */
function handleFrame(req, res) {
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
      // Special share view
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250412-1&t=${Date.now()}" />
            <meta property="fc:frame:button:1" content="View Top Traders" />
            <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/all-routes" />
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
          <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/all-routes" />
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
          <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/all-routes" />
        </head>
        <body>
          <p>An error occurred. Please try again.</p>
        </body>
      </html>
    `);
  }
}

/**
 * Minimal handler
 */
function handleMinimal(req, res) {
  // Static HTML with Farcaster Frame metadata
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Top Warplet Traders</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250412-1&t=${Date.now()}" />
    <meta property="fc:frame:button:1" content="24 Hours" />
    <meta property="fc:frame:button:2" content="7 Days" />
    <meta property="fc:frame:button:3" content="Share Results" />
    <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/all-routes" />
  </head>
  <body>
    <h1>Top Warplet Traders</h1>
    <p>Timeframe: 24 Hours</p>
    <ul>
      <li>1. thcradio (BTC): +76%</li>
      <li>2. hellno.eth (DEGEN): +49%</li>
      <li>3. wakaflocka (USDC): -39%</li>
      <li>4. karima (ARB): -55%</li>
      <li>5. chrislarsc.eth (ETH): -63%</li>
    </ul>
  </body>
</html>`;

  // Return simple HTML response
  res.statusCode = 200;
  return res.end(html);
}

/**
 * Edge API handler
 */
function handleEdge(req, res) {
  // HTML with Farcaster Frame metadata
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Top Warplet Traders</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250412-1&t=${Date.now()}" />
    <meta property="fc:frame:button:1" content="24 Hours" />
    <meta property="fc:frame:button:2" content="7 Days" />
    <meta property="fc:frame:button:3" content="Share Results" />
    <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/all-routes" />
    <style>
      body { font-family: sans-serif; color: #333; }
      ul { list-style-type: none; padding: 0; }
      li { margin: 10px 0; padding: 5px; }
      .green { color: green; }
      .red { color: red; }
    </style>
  </head>
  <body>
    <h1>Top Warplet Traders</h1>
    <p>Timeframe: 24 Hours</p>
    <ul>
      <li>1. thcradio (BTC): <span class="green">+76%</span></li>
      <li>2. hellno.eth (DEGEN): <span class="green">+49%</span></li>
      <li>3. wakaflocka (USDC): <span class="red">-39%</span></li>
      <li>4. karima (ARB): <span class="red">-55%</span></li>
      <li>5. chrislarsc.eth (ETH): <span class="red">-63%</span></li>
    </ul>
  </body>
</html>`;

  // Return HTML response
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;
  return res.end(html);
}

/**
 * Direct HTML handler
 */
function handleDirectHtml(req, res) {
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
        <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250412-1&t=${Date.now()}" />
        <meta property="fc:frame:button:1" content="24 Hours" />
        <meta property="fc:frame:button:2" content="7 Days" />
        <meta property="fc:frame:button:3" content="Share Results" />
        <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/all-routes" />
        
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
}