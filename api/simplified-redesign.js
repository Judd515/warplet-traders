/**
 * Simplified Redesigned Warplet Traders Frame
 * Using static images first to ensure stability
 */

import axios from 'axios';

// Configuration
const BASE_URL = 'https://warplet-traders.vercel.app';
const DEFAULT_FID = 3; // Your FID

export default async function handler(req, res) {
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    // Default values
    let view = 'global'; // Can be 'global' or 'user'
    let fid = DEFAULT_FID;
    
    // Handle button clicks
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex, fid: userFid } = req.body.untrustedData;
      fid = userFid || DEFAULT_FID;
      
      if (buttonIndex === 1) {
        // "Check Me" button - Switch to user-specific view
        view = 'user';
      } else if (buttonIndex === 2) {
        // "Share" button
        try {
          // Fetch data for share text
          const timeframe = '7d';
          let traderData;
          
          if (view === 'user') {
            // If in user view, share user-specific data
            traderData = await fetchUserSpecificData(fid);
          } else {
            // Otherwise share global data
            traderData = await fetchGlobalData();
          }
          
          // Generate share text
          const shareText = formatShareText(traderData, view === 'user', fid);
          return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
        } catch (error) {
          console.error('Error generating share text:', error);
          // Fallback share text
          const shareText = encodeURIComponent(
            `Check out Warplet Top Traders on BASE!\n\nhttps://warplet-traders.vercel.app/api/simplified-redesign`
          );
          return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
        }
      } else if (buttonIndex === 3) {
        // "Tip" button - redirect to your profile
        return res.redirect(302, 'https://warpcast.com/0xjudd');
      }
    }
    
    // Generate HTML for the frame
    let frameHtml;
    if (view === 'user') {
      frameHtml = getUserSpecificFrame(fid);
    } else {
      frameHtml = getGlobalFrame();
    }
    
    return res.status(200).send(frameHtml);
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).send(getErrorFrame());
  }
}

// Fetch global top trader data
async function fetchGlobalData() {
  try {
    const duneApiKey = process.env.DUNE_API_KEY;
    if (!duneApiKey) {
      throw new Error('DUNE_API_KEY not set');
    }
    
    // Query for 7-day data
    const queryId = '3184030'; // 7-day query
    
    const response = await axios.post(
      'https://api.dune.com/api/v1/graphql',
      {
        query: `query DuneQuery {
          query_result(query_id: ${queryId}, 
          parameters: { text_trading_period: "7d" }) {
            data
          }
        }`
      },
      { 
        headers: { 
          'x-dune-api-key': duneApiKey 
        }
      }
    );
    
    // Process results
    const results = response?.data?.data?.query_result?.data || [];
    
    const processedData = results
      .map(item => ({
        username: item.username || 'Unknown',
        address: item.address || '',
        earnings: item.earnings || 0,
        volume: item.volume || 0,
        token: item.token || 'ETH'
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
    
    return processedData;
  } catch (error) {
    console.error('Error fetching global data:', error);
    throw error;
  }
}

// Fetch user-specific top trader data
async function fetchUserSpecificData(fid) {
  try {
    // Get API keys
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    const duneApiKey = process.env.DUNE_API_KEY;
    
    if (!neynarApiKey || !duneApiKey) {
      throw new Error('API keys not set');
    }
    
    // 1. Get user's following list
    const followingResponse = await axios.get(
      `https://api.neynar.com/v2/farcaster/user/following?fid=${fid}&limit=100`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': neynarApiKey
        }
      }
    );
    
    const following = followingResponse.data?.users || [];
    
    // 2. Get global trading data from Dune
    const queryId = '3184030'; // 7-day query
    
    const response = await axios.post(
      'https://api.dune.com/api/v1/graphql',
      {
        query: `query DuneQuery {
          query_result(query_id: ${queryId}, 
          parameters: { text_trading_period: "7d" }) {
            data
          }
        }`
      },
      { 
        headers: { 
          'x-dune-api-key': duneApiKey 
        }
      }
    );
    
    // Process results
    const results = response?.data?.data?.query_result?.data || [];
    
    // 3. Filter to show only users that appear in the following list
    const followingUsernames = following.map(user => user.username.toLowerCase());
    
    const processedData = results
      .filter(item => {
        const itemUsername = (item.username || '').toLowerCase();
        return followingUsernames.includes(itemUsername);
      })
      .map(item => ({
        username: item.username || 'Unknown',
        address: item.address || '',
        earnings: item.earnings || 0,
        volume: item.volume || 0,
        token: item.token || 'ETH'
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
    
    return processedData;
  } catch (error) {
    console.error(`Error fetching user data for FID ${fid}:`, error);
    throw error;
  }
}

// Format trader data for share text
function formatShareText(traders, isUserSpecific, fid) {
  const header = isUserSpecific 
    ? `My Top Warplet Traders (7d)` 
    : `Top Warplet Traders on BASE (7d)`;
    
  const traderList = traders
    .map((trader, index) => {
      const formattedEarnings = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(trader.earnings);
      
      const formattedVolume = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(trader.volume);
      
      return `${index + 1}. @${trader.username}: ${formattedEarnings} / ${formattedVolume} volume (${trader.token})`;
    })
    .join('\n');
  
  return encodeURIComponent(
    `${header}\n\n${traderList}\n\nCheck your own follows: https://warplet-traders.vercel.app/api/simplified-redesign`
  );
}

// Get global frame
function getGlobalFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/images/global.png" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/simplified-redesign" />
  <meta property="fc:frame:button:1" content="Check Me" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
</head>
<body>
  <h1>Warplet Top Traders (Global)</h1>
</body>
</html>`;
}

// Get user-specific frame
function getUserSpecificFrame(fid) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/images/user.png" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/simplified-redesign" />
  <meta property="fc:frame:button:1" content="Check Me" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
</head>
<body>
  <h1>Warplet Top Traders (User ${fid})</h1>
</body>
</html>`;
}

// Get error frame
function getErrorFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/images/error.png" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/simplified-redesign" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error</h1>
</body>
</html>`;
}