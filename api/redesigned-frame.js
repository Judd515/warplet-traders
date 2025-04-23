/**
 * Redesigned Warplet Traders Frame
 * - Clean user interface with profile photos
 * - Default 7-day timeframe
 * - User-specific data via "Check Me" button
 * - Share and Tip functionality
 */

import axios from 'axios';

// Configuration
const BASE_URL = 'https://warplet-traders.vercel.app';
const DEFAULT_FID = 2; // Replace with your actual FID

// Cache for trader data
const dataCache = {
  global: null,
  userSpecific: {},
  lastUpdated: null,
  ttl: 5 * 60 * 1000 // 5 minutes
};

export default async function handler(req, res) {
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    // Determine the current view and FID
    let isUserSpecific = false;
    let fid = DEFAULT_FID;
    
    // Handle button clicks
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex, fid: userFid } = req.body.untrustedData;
      fid = userFid || DEFAULT_FID;
      
      // Button actions
      if (buttonIndex === 1) {
        // "Check Me" button
        isUserSpecific = true;
      } else if (buttonIndex === 2) {
        // "Share" button
        // Get data based on current view
        const dataToShare = isUserSpecific 
          ? await fetchUserSpecificData(fid)
          : await fetchGlobalData();
        
        const shareText = formatShareText(dataToShare, isUserSpecific, fid);
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      } else if (buttonIndex === 3) {
        // "Tip" button - redirect to your Warpcast profile
        return res.redirect(302, 'https://warpcast.com/0xjudd');
      }
    }
    
    // Generate frame HTML
    const frame = await generateFrame(isUserSpecific, fid);
    return res.status(200).send(frame);
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(200).send(generateErrorFrame());
  }
}

// Fetch global top trader data (7-day timeframe)
async function fetchGlobalData() {
  // Check cache first
  if (dataCache.global && 
      dataCache.lastUpdated && 
      (Date.now() - dataCache.lastUpdated) < dataCache.ttl) {
    return dataCache.global;
  }
  
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
    
    // Update cache
    dataCache.global = processedData;
    dataCache.lastUpdated = Date.now();
    
    return processedData;
  } catch (error) {
    console.error('Error fetching global data:', error);
    throw error;
  }
}

// Fetch user-specific top trader data
async function fetchUserSpecificData(fid) {
  // Check cache first
  const cacheKey = `user-${fid}`;
  if (dataCache.userSpecific[cacheKey] && 
      dataCache.lastUpdated && 
      (Date.now() - dataCache.lastUpdated) < dataCache.ttl) {
    return dataCache.userSpecific[cacheKey];
  }
  
  try {
    // Get Neynar API key
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    if (!neynarApiKey) {
      throw new Error('NEYNAR_API_KEY not set');
    }
    
    // 1. Fetch user's following list
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
    
    // 2. Extract wallet addresses from following users
    const followedAddresses = [];
    for (const user of following) {
      if (user.verified_addresses?.length > 0) {
        followedAddresses.push({
          username: user.username,
          address: user.verified_addresses[0].toLowerCase(),
          fid: user.fid
        });
      }
    }
    
    // 3. Get trading data for these addresses from Dune
    const duneApiKey = process.env.DUNE_API_KEY;
    if (!duneApiKey) {
      throw new Error('DUNE_API_KEY not set');
    }
    
    // If we have addresses, query Dune for their trading activity
    if (followedAddresses.length > 0) {
      // For simplicity, we're using the same query as global data
      // In a real implementation, you would filter by addresses
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
      
      // Filter and map to get only followed users' data
      const followedAddressesLower = followedAddresses.map(item => item.address.toLowerCase());
      
      const processedData = results
        .filter(item => {
          const itemAddress = (item.address || '').toLowerCase();
          return followedAddressesLower.includes(itemAddress);
        })
        .map(item => {
          // Find the matching username from our following list
          const matchedUser = followedAddresses.find(
            user => user.address.toLowerCase() === (item.address || '').toLowerCase()
          );
          
          return {
            username: matchedUser?.username || item.username || 'Unknown',
            address: item.address || '',
            earnings: item.earnings || 0,
            volume: item.volume || 0,
            token: item.token || 'ETH'
          };
        })
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 5);
      
      // Update cache
      dataCache.userSpecific[cacheKey] = processedData;
      dataCache.lastUpdated = Date.now();
      
      return processedData;
    }
    
    return [];
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
    `${header}\n\n${traderList}\n\nCheck your own follows: https://warplet-traders.vercel.app/api/redesigned-frame`
  );
}

// Fetch user profile from Neynar
async function fetchUserProfile(fid) {
  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY not set');
    }
    
    const response = await axios.get(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    return response.data?.result?.user || null;
  } catch (error) {
    console.error(`Error fetching user profile for FID ${fid}:`, error);
    return null;
  }
}

// Generate SVG with top trader data
async function generateTraderImage(traders, isUserSpecific, fid) {
  try {
    // If user-specific, get their profile
    let profileUrl = null;
    let username = 'User';
    
    if (isUserSpecific) {
      const profile = await fetchUserProfile(fid);
      if (profile) {
        profileUrl = profile.pfp?.url || null;
        username = profile.username || 'User';
      }
    }
    
    // Start SVG
    let svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="630" fill="#ffffff" />
  
  <!-- Profile Circle -->
  <circle cx="90" cy="90" r="60" fill="#8b5cf6" />`;
    
    // Add profile image if available
    if (profileUrl) {
      svg += `
  <!-- Profile Image Clip Path -->
  <clipPath id="profileClip">
    <circle cx="90" cy="90" r="58" />
  </clipPath>
  <!-- Profile Image -->
  <image href="${profileUrl}" x="32" y="32" width="116" height="116" clip-path="url(#profileClip)" />`;
    } else {
      // Add text alternative if no profile image
      svg += `
  <!-- Profile Text Alternative -->
  <text x="90" y="90" font-family="Verdana" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">Profile Photo
of user FID</text>`;
    }
    
    // Add title
    svg += `
  <!-- Title Background -->
  <rect x="160" y="60" width="500" height="60" rx="10" fill="#dbeafe" />
  
  <!-- Title Text -->
  <text x="410" y="100" font-family="Verdana" font-size="26" font-weight="bold" fill="#000000" text-anchor="middle">My Top Warplet Traders</text>
  
  <!-- Table Container -->
  <rect x="90" y="160" width="1020" height="320" rx="20" fill="none" stroke="#000000" stroke-width="2" />
  
  <!-- Table Header -->
  <rect x="91" y="161" width="1018" height="40" fill="#f5f5f5" />
  <line x1="90" y1="200" x2="1110" y2="200" stroke="#000000" stroke-width="1" />
  
  <!-- Table Header Text -->
  <text x="270" y="185" font-family="Verdana" font-size="18" fill="#000000" text-anchor="middle">User</text>
  <text x="600" y="185" font-family="Verdana" font-size="18" fill="#000000" text-anchor="middle">Token</text>
  <text x="930" y="185" font-family="Verdana" font-size="18" fill="#000000" text-anchor="middle">Earnings</text>`;
    
    // Add trader rows or placeholder
    if (traders.length > 0) {
      traders.forEach((trader, index) => {
        const yPos = 240 + (index * 40);
        
        // Format earnings for display
        const formattedEarnings = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(trader.earnings);
        
        svg += `
  <!-- Trader ${index + 1} -->
  <text x="270" y="${yPos}" font-family="Verdana" font-size="18" fill="#000000" text-anchor="middle">@${trader.username}</text>
  <text x="600" y="${yPos}" font-family="Verdana" font-size="18" fill="#000000" text-anchor="middle">${trader.token}</text>
  <text x="930" y="${yPos}" font-family="Verdana" font-size="18" fill="#000000" text-anchor="middle">${formattedEarnings}</text>`;
      });
    } else {
      // No data placeholder
      svg += `
  <!-- No Data Placeholder -->
  <text x="600" y="280" font-family="Verdana" font-size="20" fill="#000000" text-anchor="middle">User Data Goes Here</text>`;
    }
    
    // Add buttons and footer
    svg += `
  <!-- Buttons -->
  <rect x="150" y="520" width="150" height="40" rx="5" fill="white" stroke="#000000" stroke-width="1" />
  <text x="225" y="545" font-family="Verdana" font-size="16" fill="#000000" text-anchor="middle">Check Me</text>
  
  <rect x="350" y="520" width="150" height="40" rx="5" fill="white" stroke="#000000" stroke-width="1" />
  <text x="425" y="545" font-family="Verdana" font-size="16" fill="#000000" text-anchor="middle">Share</text>
  
  <rect x="550" y="520" width="150" height="40" rx="5" fill="white" stroke="#000000" stroke-width="1" />
  <text x="625" y="545" font-family="Verdana" font-size="16" fill="#000000" text-anchor="middle">Tip</text>
  
  <!-- Footer -->
  <rect x="750" y="520" width="150" height="30" rx="5" fill="white" />
  <text x="825" y="540" font-family="Verdana" font-size="12" fill="#000000" text-anchor="middle">Frame created by 0xJudd</text>
</svg>`;
    
    return svg;
  } catch (error) {
    console.error('Error generating trader image:', error);
    return generateErrorSvg();
  }
}

// Generate error SVG
function generateErrorSvg() {
  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="630" fill="#ffffff" />
  
  <!-- Error Message -->
  <text x="600" y="300" font-family="Verdana" font-size="32" fill="#ff0000" text-anchor="middle">Error loading data</text>
  <text x="600" y="350" font-family="Verdana" font-size="24" fill="#000000" text-anchor="middle">Please try again later</text>
  
  <!-- Footer -->
  <rect x="525" y="520" width="150" height="30" rx="5" fill="white" />
  <text x="600" y="540" font-family="Verdana" font-size="12" fill="#000000" text-anchor="middle">Frame created by 0xJudd</text>
</svg>`;
}

// Generate the frame HTML
async function generateFrame(isUserSpecific, fid) {
  try {
    // Get trader data
    const traders = isUserSpecific 
      ? await fetchUserSpecificData(fid)
      : await fetchGlobalData();
    
    // Generate SVG image
    const svg = await generateTraderImage(traders, isUserSpecific, fid);
    
    // Encode SVG for use in image URL
    const encodedSvg = Buffer.from(svg).toString('base64');
    const dataUri = `data:image/svg+xml;base64,${encodedSvg}`;
    
    // Generate frame HTML
    return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${dataUri}" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/redesigned-frame" />
  <meta property="fc:frame:button:1" content="Check Me" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>`;
  } catch (error) {
    console.error('Error generating frame:', error);
    return generateErrorFrame();
  }
}

// Generate error frame
function generateErrorFrame() {
  const errorSvg = generateErrorSvg();
  const encodedSvg = Buffer.from(errorSvg).toString('base64');
  const dataUri = `data:image/svg+xml;base64,${encodedSvg}`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${dataUri}" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/redesigned-frame" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
}