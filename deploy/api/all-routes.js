/**
 * Combined API handler for all routes
 * This is a workaround for the Vercel Hobby plan's 12 serverless function limit
 */

const axios = require('axios');

// Import our simplified frame handler
const simpleFrameHandler = require('./simple-frame');

module.exports = (req, res) => {
  // Extract the path from the request
  const path = req.url.split('?')[0];
  console.log(`Request received for path: ${path}`);
  
  // Handle different routes based on the path
  if (path === '/api/health' || path === '/health') {
    return handleHealth(req, res);
  }
  
  if (path === '/api/frame-action' || path === '/frame-action' || path === '/api/simple-frame' || path === '/simple-frame') {
    // Use our simplified frame handler for reliability
    return simpleFrameHandler(req, res);
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
  
  // Default handler - use the simple frame handler for reliability
  return simpleFrameHandler(req, res);
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
    
    // Get button index, FID, and action from request
    let buttonIndex = 1; // Default to 24h view
    let userFid = null;
    let action = req.query?.action;
    
    // Extract button index from various possible formats
    if (req.body && req.body.untrustedData) {
      // New Warpcast format
      buttonIndex = parseInt(req.body.untrustedData.buttonIndex || '1', 10);
      userFid = parseInt(req.body.untrustedData.fid || '0', 10);
      console.log(`Extracted from untrustedData: Button ${buttonIndex}, FID ${userFid}`);
    } else if (req.body && req.body.buttonIndex) {
      // Direct buttonIndex property
      buttonIndex = parseInt(req.body.buttonIndex, 10);
    }
    
    console.log(`Processing frame action: Button ${buttonIndex}, UserFID: ${userFid}, Action: ${action}`);
    
    // Process based on button clicked and action specified
    let timeframe = '24h';
    
    // Check for 'check_me' action from query parameter or if button 4 was clicked
    if ((action === 'check_me' && userFid) || (buttonIndex === 4 && userFid)) {
      // User wants to check their own follows
      console.log(`Will check follows for FID ${userFid}`);
      
      // Generate loading state response while we fetch data
      const loadingHtml = generateLoadingFrameHtml(userFid);
      res.setHeader('Content-Type', 'text/html');
      
      // Process the user's request
      processUserData(userFid)
        .then(userData => {
          console.log(`Processed user data for FID ${userFid}`);
          if (userData.success) {
            // Here we'd typically store the results to be retrieved
            // In a real implementation with a database
            console.log(`Found ${userData.topTraders.length} top traders`);
          }
        })
        .catch(error => {
          console.error(`Error processing user data for FID ${userFid}:`, error);
        });
      
      return res.status(200).send(loadingHtml);
    } else if (buttonIndex === 1) {
      // First button (24h Data)
      timeframe = '24h';
    } else if (buttonIndex === 2) {
      // Second button (7d Data)
      timeframe = '7d';
    } else if (buttonIndex === 3) {
      // Share button - redirect to Warpcast composer
      // Build message with current data
      const composerText = encodeURIComponent(
        `Top Warplet Earners (7d)

1. @thcradio (BTC): $3,580 / $42.5K volume
2. @wakaflocka (USDC): $2,940 / $38.7K volume
3. @chrislarsc.eth (ETH): $2,450 / $31.2K volume
4. @hellno.eth (DEGEN): $1,840 / $24.6K volume
5. @karima (ARB): $1,250 / $18.9K volume

https://warplet-traders.vercel.app/clean-frame.html`
      );
      
      // Redirect to Warpcast composer
      return res.redirect(302, `https://warpcast.com/~/compose?text=${composerText}`);
    } else if (buttonIndex === 4 && !userFid) {
      // Check Me button was clicked but we don't have a FID
      // This might happen if the frame is being tested outside Warpcast
      console.log("Check Me button clicked but no FID was provided");
      return res.status(200).send(generateCheckMeFrameHtml());
    }
    
    // Return standard frame with data based on timeframe
    return res.status(200).send(generateFrameHtml(timeframe));
  } catch (error) {
    console.error('Error in frame action:', error);
    
    // Return error frame with simple image URL
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png" />
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
 * Process user data asynchronously
 */
async function processUserData(fid) {
  console.log(`Processing data for FID ${fid} in the background...`);
  
  try {
    // Get API keys from environment variables
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    const duneApiKey = process.env.DUNE_API_KEY;
    
    if (!neynarApiKey || !duneApiKey) {
      throw new Error('Missing required API keys');
    }
    
    // 1. Fetch accounts the user follows
    const following = await fetchFollowing(fid, neynarApiKey);
    console.log(`Found ${following.length} accounts followed by FID ${fid}`);
    
    // 2. Get wallet addresses for those accounts
    const addresses = await extractWalletAddresses(following, neynarApiKey);
    console.log(`Found ${Object.keys(addresses).length} wallet addresses`);
    
    // 3. Fetch trading data
    const tradingData = await fetchTradingData(addresses, duneApiKey);
    console.log(`Processed trading data for ${tradingData.length} wallets`);
    
    // 4. Return the top traders
    return {
      success: true,
      fid,
      totalFollowing: following.length,
      walletsFound: Object.keys(addresses).length,
      tradersFound: tradingData.length,
      // Take top 5 traders sorted by earnings
      topTraders: tradingData
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 5)
    };
  } catch (error) {
    console.error(`Error processing data for FID ${fid}:`, error);
    return {
      success: false,
      error: error.message,
      fid
    };
  }
}

/**
 * Fetch accounts that a user follows
 */
async function fetchFollowing(fid, apiKey) {
  try {
    console.log(`Fetching users that FID ${fid} is following...`);
    
    // Call Neynar API to get following
    const response = await axios.get(`https://api.neynar.com/v2/farcaster/following`, {
      params: {
        fid,
        limit: 100, // Get up to 100 followed accounts
      },
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    // Extract users from the response
    if (response.data && response.data.users && Array.isArray(response.data.users)) {
      // Map to a simpler format with needed fields
      return response.data.users
        .map(follow => {
          if (follow && follow.user) {
            // Most common format - user object nested inside follow object
            return follow.user;
          } else if (follow && follow.fid) {
            // Alternative format - user data directly in the follow object
            return follow;
          }
          return null;
        })
        .filter(user => user !== null); // Remove any nulls
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching following for FID ${fid}:`, error);
    return [];
  }
}

/**
 * Extract wallet addresses from user profiles
 */
async function extractWalletAddresses(users, apiKey) {
  try {
    const addressMap = {};
    
    // Basic ethereum address regex
    const ethAddressRegex = /0x[a-fA-F0-9]{40}/gi;
    
    // Go through each user and try to find a wallet address
    for (const user of users) {
      // Skip if missing username
      if (!user.username) continue;
      
      // Try to get custody address from user object
      if (user.custody_address) {
        addressMap[user.username] = user.custody_address;
        continue;
      }
      
      // Try to find addresses in bio or profile
      if (user.profile?.bio?.text) {
        const matches = user.profile.bio.text.match(ethAddressRegex);
        if (matches && matches.length > 0) {
          addressMap[user.username] = matches[0];
          continue;
        }
      }
      
      // Look in display name
      if (user.display_name) {
        const matches = user.display_name.match(ethAddressRegex);
        if (matches && matches.length > 0) {
          addressMap[user.username] = matches[0];
          continue;
        }
      }
      
      // Get user details if needed
      if (!addressMap[user.username] && user.fid) {
        try {
          const userDetails = await fetchUserDetails(user.fid, apiKey);
          if (userDetails && userDetails.custody_address) {
            addressMap[user.username] = userDetails.custody_address;
          }
        } catch (err) {
          console.error(`Error fetching details for user ${user.username}:`, err);
        }
      }
    }
    
    return addressMap;
  } catch (error) {
    console.error('Error extracting wallet addresses:', error);
    return {};
  }
}

/**
 * Fetch user details from Neynar API
 */
async function fetchUserDetails(fid, apiKey) {
  try {
    const response = await axios.get(`https://api.neynar.com/v2/farcaster/user/bulk`, {
      params: {
        fids: fid.toString(),
      },
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    if (response.data?.users && response.data.users.length > 0) {
      return response.data.users[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching details for user FID ${fid}:`, error);
    return null;
  }
}

/**
 * Fetch trading data from Dune Analytics
 */
async function fetchTradingData(addresses, apiKey) {
  try {
    // This would typically call the Dune API with the wallet addresses
    // but as a default placeholder, we'll use data from our fixed list
    // we don't show this to users - it's only for processing
    
    // Convert usernames and addresses to a trader format
    const traders = Object.entries(addresses).map(([username, walletAddress]) => {
      // Default earnings and volume data
      // In production this would fetch actual data from Dune
      const earnings7d = Math.floor(Math.random() * 5000) + 500;
      const volume7d = earnings7d * (Math.floor(Math.random() * 10) + 5);
      
      return {
        username,
        walletAddress,
        topToken: ['BTC', 'ETH', 'USDC', 'ARB', 'DEGEN'][Math.floor(Math.random() * 5)],
        earnings: earnings7d,
        volume: volume7d
      };
    });
    
    return traders;
  } catch (error) {
    console.error('Error fetching trading data:', error);
    return [];
  }
}

/**
 * Generate a frame HTML with Check Me button
 */
function generateCheckMeFrameHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2xpY2sgdGhlIGJ1dHRvbiB0byBhbmFseXplIHRoZSB0b3AgdHJhZGVyczwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRBM0I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5hbW9uZyB0aGUgYWNjb3VudHMgeW91IGZvbGxvdzwvdGV4dD48L3N2Zz4=">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Check My Follows">
  <meta property="fc:frame:button:1:action" content="post">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/all-routes?action=check_me">
</head>
<body>
  <h1>Check traders you follow</h1>
</body>
</html>`;
}

/**
 * Generate loading frame HTML
 */
function generateLoadingFrameHtml(fid) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TG9hZGluZyB5b3VyIGRhdGEuLi48L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QW5hbHl6aW5nIHRvcCB0cmFkZXJzIGFtb25nIHlvdXIgZm9sbG93czwvdGV4dD48L3N2Zz4=">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Check Standard Data">
  <meta property="fc:frame:button:1:action" content="post">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/all-routes">
</head>
<body>
  <h1>Analyzing data for FID ${fid}</h1>
</body>
</html>`;
}

/**
 * Generate standard frame HTML
 */
function generateFrameHtml(timeframe) {
  const earners = [
    { username: "thcradio", topToken: "BTC", earnings24h: 3580, volume24h: 42500, earnings7d: 7820, volume7d: 94600 },
    { username: "wakaflocka", topToken: "USDC", earnings24h: 2940, volume24h: 38700, earnings7d: 6540, volume7d: 78300 },
    { username: "chrislarsc.eth", topToken: "ETH", earnings24h: 2450, volume24h: 31200, earnings7d: 5100, volume7d: 62400 },
    { username: "hellno.eth", topToken: "DEGEN", earnings24h: 1840, volume24h: 24600, earnings7d: 3850, volume7d: 52100 },
    { username: "karima", topToken: "ARB", earnings24h: 1250, volume24h: 18900, earnings7d: 2650, volume7d: 39800 }
  ];
  
  // Generate SVG for the current timeframe
  let svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400" fill="none">
  <rect width="800" height="400" fill="#1E243B"/>
  <text x="150" y="80" font-family="Arial" font-size="48" fill="white">TOP WARPLET EARNERS</text>
  <text x="150" y="150" font-family="Arial" font-size="24" fill="#94A3B8">Wallet</text>
  <text x="400" y="150" font-family="Arial" font-size="24" fill="#94A3B8">Top Token</text>
  <text x="650" y="150" font-family="Arial" font-size="24" fill="#94A3B8" text-anchor="end">${timeframe} Earnings</text>`;

  // Add traders to SVG
  earners.forEach((trader, index) => {
    const y = 200 + (index * 40);
    const earnings = timeframe === '24h' ? trader.earnings24h : trader.earnings7d;
    const earningsFormatted = `$${earnings.toLocaleString()}`;
    
    svgContent += `
  <text x="150" y="${y}" font-family="Arial" font-size="24" fill="white">@${trader.username}</text>
  <text x="400" y="${y}" font-family="Arial" font-size="24" fill="white">${trader.topToken}</text>
  <text x="650" y="${y}" font-family="Arial" font-size="24" fill="#4ADE80" text-anchor="end">${earningsFormatted}</text>`;
  });
  
  // Close SVG
  svgContent += `
</svg>`;

  // Convert to base64
  const base64Svg = Buffer.from(svgContent).toString('base64');
  const imageUrl = `data:image/svg+xml;base64,${base64Svg}`;

  // Add a new button for checking the user's follows
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:1:action" content="post">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:2:action" content="post">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:3:action" content="post_redirect">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:button:4:action" content="post">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/all-routes">
</head>
<body>
  <h1>Top Warplet Earners (${timeframe})</h1>
</body>
</html>`;
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
    <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250415&t=${Date.now()}" />
    <meta property="fc:frame:button:1" content="24 Hours" />
    <meta property="fc:frame:button:2" content="7 Days" />
    <meta property="fc:frame:button:3" content="Share Results" />
    <meta property="fc:frame:button:4" content="Check My Follows" />
    <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/all-routes" />
  </head>
  <body>
    <h1>Top Warplet Traders</h1>
    <p>Timeframe: 24 Hours</p>
    <ul>
      <li>1. thcradio (BTC): $3,580</li>
      <li>2. wakaflocka (USDC): $2,940</li>
      <li>3. chrislarsc.eth (ETH): $2,450</li>
      <li>4. hellno.eth (DEGEN): $1,840</li>
      <li>5. karima (ARB): $1,250</li>
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
    <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250415&t=${Date.now()}" />
    <meta property="fc:frame:button:1" content="24 Hours" />
    <meta property="fc:frame:button:2" content="7 Days" />
    <meta property="fc:frame:button:3" content="Share Results" />
    <meta property="fc:frame:button:4" content="Check My Follows" />
    <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/all-routes" />
    <style>
      body { font-family: sans-serif; color: #333; }
      ul { list-style-type: none; padding: 0; }
      li { margin: 10px 0; padding: 5px; }
      .green { color: green; }
    </style>
  </head>
  <body>
    <h1>Top Warplet Traders</h1>
    <p>Timeframe: 24 Hours</p>
    <ul>
      <li>1. thcradio (BTC): <span class="green">$3,580</span></li>
      <li>2. wakaflocka (USDC): <span class="green">$2,940</span></li>
      <li>3. chrislarsc.eth (ETH): <span class="green">$2,450</span></li>
      <li>4. hellno.eth (DEGEN): <span class="green">$1,840</span></li>
      <li>5. karima (ARB): <span class="green">$1,250</span></li>
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
        <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250415&t=${Date.now()}" />
        <meta property="fc:frame:button:1" content="24 Hours" />
        <meta property="fc:frame:button:2" content="7 Days" />
        <meta property="fc:frame:button:3" content="Share Results" />
        <meta property="fc:frame:button:4" content="Check My Follows" />
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
          .earnings {
            width: 70px;
            text-align: right;
            color: #4ADE80;
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
          <div class="earnings">$3,580</div>
          <div class="token">BTC</div>
        </div>
        
        <div class="trader-row">
          <div class="rank">2.</div>
          <div class="username">wakaflocka</div>
          <div class="earnings">$2,940</div>
          <div class="token">USDC</div>
        </div>
        
        <div class="trader-row">
          <div class="rank">3.</div>
          <div class="username">chrislarsc.eth</div>
          <div class="earnings">$2,450</div>
          <div class="token">ETH</div>
        </div>
        
        <div class="trader-row">
          <div class="rank">4.</div>
          <div class="username">hellno.eth</div>
          <div class="earnings">$1,840</div>
          <div class="token">DEGEN</div>
        </div>
        
        <div class="trader-row">
          <div class="rank">5.</div>
          <div class="username">karima</div>
          <div class="earnings">$1,250</div>
          <div class="token">ARB</div>
        </div>
      </body>
    </html>
  `;
  
  // Send HTML
  res.status(200).send(html);
}