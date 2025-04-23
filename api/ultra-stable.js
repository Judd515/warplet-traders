/**
 * Ultra-stable frame implementation for Vercel Hobby plan
 * No external API calls or database dependencies
 */

// Export a default handler function for the serverless function
export default function handler(req, res) {
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    // Fixed data for top traders to ensure stability
    const topTraders = [
      { username: 'dwr.eth', wallet: '0x24c7...eB2', earnings: 4250, volume: 42500, token: 'ETH' },
      { username: 'judd.eth', wallet: '0x0000...D5', earnings: 3780, volume: 37800, token: 'BTC' },
      { username: 'base_god', wallet: '0xcF1F...882', earnings: 2950, volume: 29500, token: 'DEGEN' },
      { username: 'canto_maximalist', wallet: '0xa4C7...46F', earnings: 2140, volume: 21400, token: 'USDC' },
      { username: 'basedtrader', wallet: '0x38fD...DeF', earnings: 1870, volume: 18700, token: 'ARB' }
    ];
    
    // Get user FID if this is a POST request
    let fid = null;
    let buttonIndex = null;
    let frameState = {};
    
    if (req.method === 'POST' && req.body?.untrustedData) {
      fid = req.body.untrustedData.fid;
      buttonIndex = req.body.untrustedData.buttonIndex;
      
      try {
        // Parse state if present
        if (req.body.untrustedData.state) {
          frameState = JSON.parse(req.body.untrustedData.state);
        }
      } catch (e) {
        console.error('Error parsing state:', e);
      }
      
      console.log(`Button ${buttonIndex} clicked by FID ${fid}`);
    }
    
    // Handle different actions based on button clicked
    if (buttonIndex === 1) {
      // Show 24h frame
      return res.status(200).send(get24hFrameHtml(topTraders, fid));
    } else if (buttonIndex === 2) {
      // Show 7d frame
      return res.status(200).send(get7dFrameHtml(topTraders, fid));
    } else if (buttonIndex === 3) {
      // Check Me button - show user-specific frame
      return res.status(200).send(getCheckMeFrameHtml(topTraders, fid));
    } else if (buttonIndex === 4) {
      // Share button - redirect to composer
      return res.redirect(302, getShareUrl());
    }
    
    // Default (GET request or initial view)
    return res.status(200).send(getMainFrameHtml());
    
  } catch (error) {
    console.error('Error processing frame request:', error);
    return res.status(200).send(getErrorFrameHtml());
  }
}

function getShareUrl() {
  // Prepare share text with top trader data
  const shareText = encodeURIComponent(`Check out the top Warplet traders on BASE!

Top 5 Earners (24h):
1. @dwr.eth: $4,250 / $42.5K volume
2. @judd.eth: $3,780 / $37.8K volume
3. @base_god: $2,950 / $29.5K volume
4. @canto_maximalist: $2,140 / $21.4K volume
5. @basedtrader: $1,870 / $18.7K volume

https://warplet-traders.vercel.app/api/ultra-stable`);
  
  return `https://warpcast.com/~/compose?text=${shareText}`;
}

function getMainFrameHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/main.png" />
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-stable" />
  <meta property="fc:frame:button:1" content="24h Data" />
  <meta property="fc:frame:button:2" content="7d Data" />
  <meta property="fc:frame:button:3" content="Check Me" />
  <meta property="fc:frame:button:4" content="Share" />
</head>
<body>
  <h1>Top Warplet Traders</h1>
</body>
</html>`;
}

function get24hFrameHtml(traders, fid) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/24h.png" />
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-stable" />
  <meta property="fc:frame:button:1" content="View 7d" />
  <meta property="fc:frame:button:2" content="Check Me" />
  <meta property="fc:frame:button:3" content="Main" />
  <meta property="fc:frame:button:4" content="Share" />
</head>
<body>
  <h1>Top Warplet Traders (24h)</h1>
</body>
</html>`;
}

function get7dFrameHtml(traders, fid) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/7d.png" />
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-stable" />
  <meta property="fc:frame:button:1" content="View 24h" />
  <meta property="fc:frame:button:2" content="Check Me" />
  <meta property="fc:frame:button:3" content="Main" />
  <meta property="fc:frame:button:4" content="Share" />
</head>
<body>
  <h1>Top Warplet Traders (7d)</h1>
</body>
</html>`;
}

function getCheckMeFrameHtml(traders, fid) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/check-me.png" />
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-stable" />
  <meta property="fc:frame:button:1" content="View 24h" />
  <meta property="fc:frame:button:2" content="View 7d" />
  <meta property="fc:frame:button:3" content="Main" />
  <meta property="fc:frame:button:4" content="Share" />
</head>
<body>
  <h1>Your Top Traders (FID: ${fid})</h1>
</body>
</html>`;
}

function getErrorFrameHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/images/error.png" />
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-stable" />
  <meta property="fc:frame:button:1" content="View 24h" />
  <meta property="fc:frame:button:2" content="View 7d" />
  <meta property="fc:frame:button:3" content="Main" />
  <meta property="fc:frame:button:4" content="Try Again" />
</head>
<body>
  <h1>Error Fetching Data</h1>
</body>
</html>`;
}

function getShareRedirectHtml(shareUrl) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=${shareUrl}" />
</head>
<body>
  <p>Redirecting to Warpcast...</p>
</body>
</html>`;
}