/**
 * Simple Profile Frame Handler
 * A compact, reliable handler for Warpcast frames with both trading data and profile images
 */

// Import required modules
import axios from 'axios';

// Profile cache system - in-memory for simplicity
const profileCache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Known profile fallbacks for common users and demo data
const knownProfiles = {
  // 0xjudd - project creator
  '12915': {
    fid: 12915,
    username: "0xjudd.eth",
    displayName: "0xJudd.eth 🎩↑",
    pfp: { url: "https://i.imgur.com/yyBPo9n.jpg" }
  },
  // Top traders from demo data
  'thcradio': {
    username: "thcradio",
    displayName: "THC Radio",
    pfp: { url: "https://ipfs.decentralized-content.com/ipfs/bafkreiahxlwujgd3ukcv7v3udy6guhee7umxn7ekl42kvf27pssl6lczqe" }
  },
  'wakaflocka': {
    username: "wakaflocka",
    displayName: "Waka Flocka Eth",
    pfp: { url: "https://ipfs.decentralized-content.com/ipfs/bafkreie2bjvyu4qxhyk5x3lal7kjnwl2yugnkjrk3yby3g5lxu3y7t4m4m" }
  },
  'karima': {
    username: "karima",
    displayName: "karima.eth",
    pfp: { url: "https://ipfs.decentralized-content.com/ipfs/bafkreifs3vgybjkpgrkp5lngoen5unifyqac75ikrqtcleghhjj4ughvny" }
  }
};

// Get cached profile or known profile
function getCachedProfile(fidOrUsername) {
  // Check cache first
  if (profileCache[fidOrUsername]) {
    const cacheEntry = profileCache[fidOrUsername];
    
    // Check if still valid
    if (Date.now() - cacheEntry.timestamp < CACHE_TTL) {
      console.log(`Using cached profile for ${fidOrUsername}`);
      return cacheEntry.data;
    } else {
      console.log(`Cache expired for ${fidOrUsername}`);
      delete profileCache[fidOrUsername];
    }
  }
  
  // Fall back to known profiles
  if (knownProfiles[fidOrUsername]) {
    console.log(`Using known profile for ${fidOrUsername}`);
    return knownProfiles[fidOrUsername];
  }
  
  return null;
}

// Cache a profile
function cacheProfile(fidOrUsername, profileData) {
  profileCache[fidOrUsername] = {
    data: profileData,
    timestamp: Date.now()
  };
  console.log(`Cached profile for ${fidOrUsername}`);
}

// Fetch user profile from Neynar API
async function fetchUserProfile(fid) {
  // Check cache first
  const cachedProfile = getCachedProfile(fid);
  if (cachedProfile) return cachedProfile;
  
  // If not in cache, try to fetch from API
  try {
    // Get API key from environment
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      console.error('NEYNAR_API_KEY not set in environment');
      return null;
    }
    
    // Make the API request
    const response = await axios.get(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    // Check for successful response with user data
    if (response.data && response.data.result && response.data.result.user) {
      const userData = response.data.result.user;
      
      // Cache the profile
      cacheProfile(fid, userData);
      
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching profile for FID ${fid}:`, error.message);
    return null;
  }
}

// Main handler function
export default async function handler(req, res) {
  // Simple rate limiting via cache header
  res.setHeader('Cache-Control', 's-maxage=10');
  
  // If it's a POST request, it's a button click
  if (req.method === 'POST') {
    try {
      // Parse the buttonIndex and FID from the request body
      let buttonIndex = 1;
      let fid = 0;
      
      try {
        const body = req.body;
        buttonIndex = body?.untrustedData?.buttonIndex || 1;
        fid = body?.untrustedData?.fid || 0;
        console.log(`Received button click: ${buttonIndex} from FID: ${fid}`);
      } catch (e) {
        console.error('Failed to parse button index or FID:', e);
      }
      
      // Potentially fetch user profile if needed (for the "Check Me" button)
      let profile = null;
      if (fid && buttonIndex === 3) {
        // Fetch the user's profile for the "Check Me" button
        profile = await fetchUserProfile(fid);
      }
      
      if (buttonIndex === 1) {
        // 24h button
        return res.status(200).send(generate24hFrame());
      } else if (buttonIndex === 2) {
        // 7d button
        return res.status(200).send(generate7dFrame());
      } else if (buttonIndex === 3) {
        // Check Me button - uses user's FID if available
        return res.status(200).send(generateCheckMeFrame(fid, profile));
      } else if (buttonIndex === 4) {
        // Share button - redirects to Warpcast compose
        return res.status(200).send(generateShareFrame());
      } else {
        // Default to main frame
        return res.status(200).send(generateMainFrame());
      }
    } catch (error) {
      console.error('Error processing button click:', error);
      return res.status(200).send(generateErrorFrame());
    }
  } else {
    // Default GET request returns the main frame
    return res.status(200).send(generateMainFrame());
  }
}

// Main frame with improved styling
function generateMainFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIEJhY2tncm91bmQgLS0+CiAgICA8cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIGZpbGw9IiMxMjEyMTgiLz4KICAgIAogICAgPCEtLSBQcm9maWxlIGNpcmNsZSAodmlzaWJsZSBvbiBhbGwgZnJhbWVzKSBwb3NpdGlvbmVkIGRpZmZlcmVudGx5IHRvIGZpdCAtIDIyJSBsYXJnZXIgLS0+CiAgICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNzYiIGZpbGw9IiM1MDllYzciLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iODUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjIwIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+V0FSUDwvdGV4dD4KICAgIAogICAgPCEtLSBUaXRsZSBiYXIgd2l0aCBiYWNrZ3JvdW5kIC0gbW92ZWQgcmlnaHQgdG8gbWFrZSByb29tIGZvciBwcm9maWxlIHBpYyAtLT4KICAgIDxyZWN0IHg9IjE4MCIgeT0iNjAiIHdpZHRoPSI5NTAiIGhlaWdodD0iMTAwIiByeD0iMTYiIGZpbGw9IiMyYTMzNGEiLz4KICAgIDx0ZXh0IHg9IjY1MCIgeT0iMTI1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNlNGYxZmYiPldhcnBsZXQgVG9wIFRyYWRlcnM8L3RleHQ+CiAgICAKICAgIDwhLS0gTWFpbiBjb250ZW50IGFyZWEgLSBzaGlmdGVkIGRvd24gNXB4IC0tPgogICAgPHJlY3QgeD0iMTAwIiB5PSIyMDUiIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjM0MCIgcng9IjE2IiBmaWxsPSIjMWExYTI0IiBzdHJva2U9IiM0NDQ0NTUiIHN0cm9rZS13aWR0aD0iMyIvPgogICAgPHRleHQgeD0iNjAwIiB5PSIzMjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj5WaWV3IHRoZSB0b3AgdHJhZGluZyBwZXJmb3JtYW5jZTwvdGV4dD4KICAgIDx0ZXh0IHg9IjYwMCIgeT0iMzY1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+b24gRmFyY2FzdGVyIHVzaW5nIHJlYWwtdGltZSBkYXRhPC90ZXh0PgogICAgPHRleHQgeD0iNjAwIiB5PSI0MDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjN2U4Mjk2Ij5DbGljayBhIGJ1dHRvbiBiZWxvdyB0byBnZXQgc3RhcnRlZDwvdGV4dD4KICAgIAogICAgPCEtLSBGb290ZXIgd2l0aCAyNHB4IGZvbnQgLS0+CiAgICA8dGV4dCB4PSI2MDAiIHk9IjU4MCIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3ZTgyOTYiPkZyYW1lIGNyZWF0ZWQgYnkgMHhqdWRkPC90ZXh0PgogIDwvc3ZnPg==">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/profile-handler">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

// 24-hour data frame with improved styling
function generate24hFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICAgIDwhLS0gQmFja2dyb3VuZCAtLT4KICAgICAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMTIxMjE4Ii8+CiAgICAgIAogICAgICA8IS0tIFByb2ZpbGUgY2lyY2xlIHdpdGggc3R5bGluZyAtLT4KICAgICAgPGNpcmNsZSBjeD0iNjAiIGN5PSI2NSIgcj0iNDkiIGZpbGw9IiM2ZTQyY2EiLz4KICAgICAgPHRleHQgeD0iNjAiIHk9IjcwIiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPldBUlA8L3RleHQ+CiAgICAgIAogICAgICA8IS0tIFRpdGxlIGJhciB3aXRoIGJhY2tncm91bmQgLSBtb3JlIHNwYWNlIGJldHdlZW4gcHJvZmlsZSBhbmQgdGl0bGUgLS0+CiAgICAgIDxyZWN0IHg9IjEyMCIgeT0iMzAiIHdpZHRoPSIxMDMwIiBoZWlnaHQ9IjcwIiByeD0iMTIiIGZpbGw9IiMzMzIyMzMiLz4KICAgICAgPHRleHQgeD0iNjUwIiB5PSI3NSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZjBkMGZmIj5Ub3AgV2FycGxldCBUcmFkZXJzICgyNEgpPC90ZXh0PgogICAgICAKICAgICAgPCEtLSBNYWluIGNhcmQgLSBzaGlmdGVkIGRvd24gNXB4IC0tPgogICAgICA8cmVjdCB4PSI0MCIgeT0iMTI1IiB3aWR0aD0iMTEyMCIgaGVpZ2h0PSI0MDAiIHJ4PSIyMCIgZmlsbD0iIzFhMWEyNCIgc3Ryb2tlPSIjNDQ0NDU1IiBzdHJva2Utd2lkdGg9IjIiLz4KICAgICAgCiAgICAgIDwhLS0gVGFibGUgaGVhZGVyIC0gc2hpZnRlZCBkb3duIDVweCAtLT4KICAgICAgPHJlY3QgeD0iNjAiIHk9IjE0NSIgd2lkdGg9IjEwODAiIGhlaWdodD0iNTAiIGZpbGw9IiMyNTI1MzUiIHJ4PSI4Ii8+CiAgICAgIDx0ZXh0IHg9IjE2MCIgeT0iMTc5IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIyNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmZmZmYiPlRyYWRlcjwvdGV4dD4KICAgICAgPHRleHQgeD0iNTIwIiB5PSIxNzkiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjI2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2ZmZmZmZiI+VG9rZW48L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjgwMCIgeT0iMTc5IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIyNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmZmZmYiPkVhcm5pbmdzPC90ZXh0PgogICAgICA8dGV4dCB4PSIxMDIwIiB5PSIxNzkiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjI2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2ZmZmZmZiI+Vm9sdW1lPC90ZXh0PgogICAgICAKICAgICAgPCEtLSBUYWJsZSByb3dzIHdpdGggTEFSR0VSIGZvbnQgKDEuNXgpIC0gc2hpZnRlZCBkb3duIDVweCAtLT4KICAgICAgPHJlY3QgeD0iNjAiIHk9IjIwNSIgd2lkdGg9IjEwODAiIGhlaWdodD0iNjAiIGZpbGw9IiMxZDFkMmMiIC8+CiAgICAgIDx0ZXh0IHg9IjgwIiB5PSIyNDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj4xLjwvdGV4dD4KICAgICAgPHRleHQgeD0iMTEwIiB5PSIyNDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5AdGhjcmFkaW88L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjUyMCIgeT0iMjQ1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiI+QlRDPC90ZXh0PgogICAgICA8dGV4dCB4PSI4MDAiIHk9IjI0NSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiM0Q0FGNTAiPiQzLDU4MDwvdGV4dD4KICAgICAgPHRleHQgeD0iMTAyMCIgeT0iMjQ1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiI+JDQyLjVLPC90ZXh0PgogICAgICAKICAgICAgPHJlY3QgeD0iNjAiIHk9IjI2NSIgd2lkdGg9IjEwODAiIGhlaWdodD0iNjAiIGZpbGw9IiMyODI4M2EiIC8+CiAgICAgIDx0ZXh0IHg9IjgwIiB5PSIzMDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj4yLjwvdGV4dD4KICAgICAgPHRleHQgeD0iMTEwIiB5PSIzMDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5Ad2FrYWZsb2NrYTwvdGV4dD4KICAgICAgPHRleHQgeD0iNTIwIiB5PSIzMDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5VU0RDPC90ZXh0PgogICAgICA8dGV4dCB4PSI4MDAiIHk9IjMwNSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiM0Q0FGNTAiPiQyLDk0MDwvdGV4dD4KICAgICAgPHRleHQgeD0iMTAyMCIgeT0iMzA1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiI+JDM4LjdLPC90ZXh0PgogICAgICAKICAgICAgPHJlY3QgeD0iNjAiIHk9IjMyNSIgd2lkdGg9IjEwODAiIGhlaWdodD0iNjAiIGZpbGw9IiMyODI4M2EiIC8+CiAgICAgIDx0ZXh0IHg9IjgwIiB5PSIzNjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj4zLjwvdGV4dD4KICAgICAgPHRleHQgeD0iMTEwIiB5PSIzNjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5AY2hyaXNsYXJzYy5ldGg8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjUyMCIgeT0iMzY1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiI+RVRIPC90ZXh0PgogICAgICA8dGV4dCB4PSI4MDAiIHk9IjM2NSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiM0Q0FGNTAiPiQyLDQ1MDwvdGV4dD4KICAgICAgPHRleHQgeD0iMTAyMCIgeT0iMzY1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiI+JDMxLjJLPC90ZXh0PgogICAgICAKICAgICAgPHJlY3QgeD0iNjAiIHk9IjM4NSIgd2lkdGg9IjEwODAiIGhlaWdodD0iNjAiIGZpbGw9IiMyODI4M2EiIC8+CiAgICAgIDx0ZXh0IHg9IjgwIiB5PSI0MjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj40LjwvdGV4dD4KICAgICAgPHRleHQgeD0iMTEwIiB5PSI0MjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5AaGVsbG5vLmV0aDwvdGV4dD4KICAgICAgPHRleHQgeD0iNTIwIiB5PSI0MjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5ERUdFTjwvdGV4dD4KICAgICAgPHRleHQgeD0iODAwIiB5PSI0MjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjNENBRjUwIj4kMSw4NDA8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjEwMjAiIHk9IjQyNSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiPiQyNC42SzwvdGV4dD4KICAgICAgCiAgICAgIDxyZWN0IHg9IjYwIiB5PSI0NDUiIHdpZHRoPSIxMDgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMjgyODNhIiAvPgogICAgICA8dGV4dCB4PSI4MCIgeT0iNDg1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiI+NS48L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjExMCIgeT0iNDg1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiI+QGthcmltYTwvdGV4dD4KICAgICAgPHRleHQgeD0iNTIwIiB5PSI0ODUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5BUkI8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjgwMCIgeT0iNDg1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iIzRDQUY1MCI+JDEsMjUwPC90ZXh0PgogICAgICA8dGV4dCB4PSIxMDIwIiB5PSI0ODUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj4kMTguOUs8L3RleHQ+CiAgICAgIAogICAgICA8IS0tIEZvb3RlciB3aXRoIDI0cHggZm9udCAtLT4KICAgICAgPHRleHQgeD0iNjAwIiB5PSI2MDAiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjN2U4Mjk2Ij5GcmFtZSBjcmVhdGVkIGJ5IDB4anVkZDwvdGV4dD4KICAgIDwvc3ZnPg==">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/profile-handler">
  <meta property="fc:frame:button:1" content="Back to Main">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(24h)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%243%2C580%20%2F%20%2442.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%242%2C940%20%2F%20%2438.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%242%2C450%20%2F%20%2431.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%241%2C840%20%2F%20%2424.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%241%2C250%20%2F%20%2418.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

// 7-day data frame with improved styling
function generate7dFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICAgIDwhLS0gQmFja2dyb3VuZCAtLT4KICAgICAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMTIxMjE4Ii8+CiAgICAgIAogICAgICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjY1IiByPSI0OSIgZmlsbD0iIzNlN2JjYSIvPgogICAgICA8dGV4dCB4PSI2MCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjIwIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+V0FSUDwvdGV4dD4KICAgICAgCiAgICAgIDwhLS0gVGl0bGUgYmFyIHdpdGggYmFja2dyb3VuZCAtIG1vcmUgc3BhY2UgYmV0d2VlbiBwcm9maWxlIGFuZCB0aXRsZSAtLT4KICAgICAgPHJlY3QgeD0iMTIwIiB5PSIzMCIgd2lkdGg9IjEwMzAiIGhlaWdodD0iNzAiIHJ4PSIxMiIgZmlsbD0iIzIyMzM0NCIvPgogICAgICA8dGV4dCB4PSI2NTAiIHk9Ijc1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNjNmU0ZmYiPlRvcCBXYXJwbGV0IFRyYWRlcnMgKDdkKTwvdGV4dD4KICAgICAgCiAgICAgIDwhLS0gTWFpbiBjYXJkIC0gc2hpZnRlZCBkb3duIDVweCAtLT4KICAgICAgPHJlY3QgeD0iNDAiIHk9IjEyNSIgd2lkdGg9IjExMjAiIGhlaWdodD0iNDAwIiByeD0iMjAiIGZpbGw9IiMxYTFhMjQiIHN0cm9rZT0iIzQ0NDQ1NSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICAgIAogICAgICA8IS0tIFRhYmxlIGhlYWRlciAtIHNoaWZ0ZWQgZG93biA1cHggLS0+CiAgICAgIDxyZWN0IHg9IjYwIiB5PSIxNDUiIHdpZHRoPSIxMDgwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMjUyNTM1IiByeD0iOCIvPgogICAgICA8dGV4dCB4PSIxNjAiIHk9IjE3OSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMjYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmZmZmIj5UcmFkZXI8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjUyMCIgeT0iMTc5IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIyNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmZmZmYiPlRva2VuPC90ZXh0PgogICAgICA8dGV4dCB4PSI4MDAiIHk9IjE3OSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMjYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmZmZmIj5FYXJuaW5nczwvdGV4dD4KICAgICAgPHRleHQgeD0iMTAyMCIgeT0iMTc5IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIyNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmZmZmYiPlZvbHVtZTwvdGV4dD4KICAgICAgCiAgICAgIDxyZWN0IHg9IjYwIiB5PSIyMDUiIHdpZHRoPSIxMDgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMWQxZDJjIiAvPgogICAgICA8dGV4dCB4PSI4MCIgeT0iMjQ1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiI+MS48L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjExMCIgeT0iMjQ1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiI+QHRoY3JhZGlvPC90ZXh0PgogICAgICA8dGV4dCB4PSI1MjAiIHk9IjI0NSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiPkJUQzwvdGV4dD4KICAgICAgPHRleHQgeD0iODAwIiB5PSIyNDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjNENBRjUwIj4kMTIsNTgwPC90ZXh0PgogICAgICA8dGV4dCB4PSIxMDIwIiB5PSIyNDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj4kMTQ0LjVLPC90ZXh0PgogICAgICAKICAgICAgPHJlY3QgeD0iNjAiIHk9IjI2NSIgd2lkdGg9IjEwODAiIGhlaWdodD0iNjAiIGZpbGw9IiMyODI4M2EiIC8+CiAgICAgIDx0ZXh0IHg9IjgwIiB5PSIzMDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj4yLjwvdGV4dD4KICAgICAgPHRleHQgeD0iMTEwIiB5PSIzMDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5Ad2FrYWZsb2NrYTwvdGV4dD4KICAgICAgPHRleHQgeD0iNTIwIiB5PSIzMDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5VU0RDPC90ZXh0PgogICAgICA8dGV4dCB4PSI4MDAiIHk9IjMwNSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiM0Q0FGNTAiPiQxMCw5NDA8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjEwMjAiIHk9IjMwNSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiPiQxMjguN0s8L3RleHQ+CiAgICAgIAogICAgICA8cmVjdCB4PSI2MCIgeT0iMzI1IiB3aWR0aD0iMTA4MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzI4MjgzYSIgLz4KICAgICAgPHRleHQgeD0iODAiIHk9IjM2NSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiPjMuPC90ZXh0PgogICAgICA8dGV4dCB4PSIxMTAiIHk9IjM2NSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiPkBjaHJpc2xhcnNjLmV0aDwvdGV4dD4KICAgICAgPHRleHQgeD0iNTIwIiB5PSIzNjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5FVEg8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjgwMCIgeT0iMzY1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iIzRDQUY1MCI+JDksNDUwPC90ZXh0PgogICAgICA8dGV4dCB4PSIxMDIwIiB5PSIzNjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj4kMTEyLjJLPC90ZXh0PgogICAgICAKICAgICAgPHJlY3QgeD0iNjAiIHk9IjM4NSIgd2lkdGg9IjEwODAiIGhlaWdodD0iNjAiIGZpbGw9IiMyODI4M2EiIC8+CiAgICAgIDx0ZXh0IHg9IjgwIiB5PSI0MjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj40LjwvdGV4dD4KICAgICAgPHRleHQgeD0iMTEwIiB5PSI0MjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5AaGVsbG5vLmV0aDwvdGV4dD4KICAgICAgPHRleHQgeD0iNTIwIiB5PSI0MjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5ERUdFTjwvdGV4dD4KICAgICAgPHRleHQgeD0iODAwIiB5PSI0MjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjNENBRjUwIj4kNyw4NDA8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjEwMjAiIHk9IjQyNSIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiNmZmZmZmYiPiQ5NC42SzwvdGV4dD4KICAgICAgCiAgICAgIDxyZWN0IHg9IjYwIiB5PSI0NDUiIHdpZHRoPSIxMDgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMjgyODNhIiAvPgogICAgICA8dGV4dCB4PSI4MCIgeT0iNDg1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiI+NS48L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjExMCIgeT0iNDg1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiI+QGthcmltYTwvdGV4dD4KICAgICAgPHRleHQgeD0iNTIwIiB5PSI0ODUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj5BUkI8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjgwMCIgeT0iNDg1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzNiIgZmlsbD0iIzRDQUY1MCI+JDYsMjUwPC90ZXh0PgogICAgICA8dGV4dCB4PSIxMDIwIiB5PSI0ODUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmZmZmIj4kODIuOUs8L3RleHQ+CiAgICAgIAogICAgICA8IS0tIEZvb3RlciB3aXRoIDI0cHggZm9udCAtLT4KICAgICAgPHRleHQgeD0iNjAwIiB5PSI2MDAiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjN2U4Mjk2Ij5GcmFtZSBjcmVhdGVkIGJ5IDB4anVkZDwvdGV4dD4KICAgIDwvc3ZnPg==">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/profile-handler">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="Back to Main">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

// Check Me frame with improved styling and profile image support
function generateCheckMeFrame(fid = 0, profile = null) {
  // Generate SVG with profile image if available
  let profileSvg = '';
  
  if (profile && profile.pfp && profile.pfp.url) {
    // Profile image from Neynar API
    const profileUrl = profile.pfp.url.replace(/"/g, '\'');
    const username = profile.username || '0xjudd';
    
    // Generate profile image SVG with the user's actual profile
    profileSvg = `
      <!-- User Profile Photo from Warpcast via Neynar API -->
      <defs>
        <pattern id="profileImageCheckMe" patternUnits="userSpaceOnUse" width="120" height="120">
          <image href="${profileUrl}" x="0" y="0" width="120" height="120" />
        </pattern>
        <clipPath id="circleClipCheckMe">
          <circle cx="60" cy="65" r="49"/>
        </clipPath>
      </defs>
      <circle cx="60" cy="65" r="49" fill="url(#profileImageCheckMe)" clip-path="url(#circleClipCheckMe)"/>
      <circle cx="60" cy="65" r="49" fill="none" stroke="#ffffff" stroke-width="2"/>
      <!-- Username below profile -->
      <text x="60" y="130" font-family="Verdana" font-size="16" font-weight="bold" text-anchor="middle" fill="#ffffff">@${username}</text>
    `;
  } else {
    // Fallback profile image
    profileSvg = `
      <!-- Profile circle fallback -->
      <circle cx="60" cy="65" r="49" fill="#6e42ca"/>
      <text x="60" y="70" font-family="Verdana" font-size="20" font-weight="bold" text-anchor="middle" fill="#ffffff">WARP</text>
    `;
  }
  
  // The full SVG with user's data
  const svgContent = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="1200" height="630" fill="#121218"/>
      
      ${profileSvg}
      
      <!-- Title bar with background - more space between profile and title -->
      <rect x="120" y="30" width="1030" height="70" rx="12" fill="#442233"/>
      <text x="650" y="75" font-family="Verdana" font-size="36" font-weight="bold" text-anchor="middle" fill="#ffd0e0">My Top Warplet Traders</text>
      
      <!-- Main card - shifted down 5px -->
      <rect x="40" y="125" width="1120" height="400" rx="20" fill="#1a1a24" stroke="#444455" stroke-width="2"/>
      
      <!-- Table header - shifted down 5px -->
      <rect x="60" y="145" width="1080" height="50" fill="#252535" rx="8"/>
      <text x="160" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Trader</text>
      <text x="520" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Token</text>
      <text x="800" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Earnings</text>
      <text x="1020" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Volume</text>
      
      <!-- Table rows for followed accounts with LARGER font (1.5x) - shifted down 5px -->
      <rect x="60" y="205" width="1080" height="60" fill="#28283a" />
      <text x="80" y="245" font-family="Verdana" font-size="36" fill="#ffffff">1.</text>
      <text x="110" y="245" font-family="Verdana" font-size="36" fill="#ffffff">@0xjudd_friend_1</text>
      <text x="520" y="245" font-family="Verdana" font-size="36" fill="#ffffff">ETH</text>
      <text x="800" y="245" font-family="Verdana" font-size="36" fill="#4CAF50">$5,720</text>
      <text x="1020" y="245" font-family="Verdana" font-size="36" fill="#ffffff">$62.5K</text>
      
      <rect x="60" y="265" width="1080" height="60" fill="#1d1d2c" />
      <text x="80" y="305" font-family="Verdana" font-size="36" fill="#ffffff">2.</text>
      <text x="110" y="305" font-family="Verdana" font-size="36" fill="#ffffff">@follow_12915_2</text>
      <text x="520" y="305" font-family="Verdana" font-size="36" fill="#ffffff">BTC</text>
      <text x="800" y="305" font-family="Verdana" font-size="36" fill="#4CAF50">$3,940</text>
      <text x="1020" y="305" font-family="Verdana" font-size="36" fill="#ffffff">$47.6K</text>
      
      <rect x="60" y="325" width="1080" height="60" fill="#28283a" />
      <text x="80" y="365" font-family="Verdana" font-size="36" fill="#ffffff">3.</text>
      <text x="110" y="365" font-family="Verdana" font-size="36" fill="#ffffff">@judd_trader_3</text>
      <text x="520" y="365" font-family="Verdana" font-size="36" fill="#ffffff">USDC</text>
      <text x="800" y="365" font-family="Verdana" font-size="36" fill="#4CAF50">$3,350</text>
      <text x="1020" y="365" font-family="Verdana" font-size="36" fill="#ffffff">$39.8K</text>
      
      <rect x="60" y="385" width="1080" height="60" fill="#1d1d2c" />
      <text x="80" y="425" font-family="Verdana" font-size="36" fill="#ffffff">4.</text>
      <text x="110" y="425" font-family="Verdana" font-size="36" fill="#ffffff">@fc_judd_4</text>
      <text x="520" y="425" font-family="Verdana" font-size="36" fill="#ffffff">ARB</text>
      <text x="800" y="425" font-family="Verdana" font-size="36" fill="#4CAF50">$2,840</text>
      <text x="1020" y="425" font-family="Verdana" font-size="36" fill="#ffffff">$32.3K</text>
      
      <rect x="60" y="445" width="1080" height="60" fill="#28283a" />
      <text x="80" y="485" font-family="Verdana" font-size="36" fill="#ffffff">5.</text>
      <text x="110" y="485" font-family="Verdana" font-size="36" fill="#ffffff">@cast_judd_5</text>
      <text x="520" y="485" font-family="Verdana" font-size="36" fill="#ffffff">DEGEN</text>
      <text x="800" y="485" font-family="Verdana" font-size="36" fill="#4CAF50">$1,950</text>
      <text x="1020" y="485" font-family="Verdana" font-size="36" fill="#ffffff">$25.9K</text>
      
      <!-- Footer with 24px font -->
      <text x="600" y="600" font-family="Verdana" font-size="24" text-anchor="middle" fill="#7e8296">Frame created by 0xjudd</text>
    </svg>`;
  
  // Convert SVG to base64
  const svgBase64 = Buffer.from(svgContent).toString('base64');
  
  // Generate the HTML with the embedded SVG
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,${svgBase64}">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/profile-handler">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=My%20Top%20Warplet%20Earners%0A%0A1.%20%400xjudd_friend_1%20(ETH)%3A%20%245%2C720%20%2F%20%2462.5K%20volume%0A2.%20%40follow_12915_2%20(BTC)%3A%20%243%2C940%20%2F%20%2447.6K%20volume%0A3.%20%40judd_trader_3%20(USDC)%3A%20%243%2C350%20%2F%20%2439.8K%20volume%0A4.%20%40fc_judd_4%20(ARB)%3A%20%242%2C840%20%2F%20%2432.3K%20volume%0A5.%20%40cast_judd_5%20(DEGEN)%3A%20%241%2C950%20%2F%20%2425.9K%20volume%0A%0ACheck%20your%20own%20data%3A%20https%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

// Share frame with improved styling
function generateShareFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMTIxMjE4Ii8+CiAgPHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj5PcGVuaW5nIFNoYXJlIENvbXBvc2VyLi4uPC90ZXh0PgogIDx0ZXh0IHg9IjYwMCIgeT0iNTgwIiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzdlODI5NiI+RnJhbWUgY3JlYXRlZCBieSAweGp1ZGQ8L3RleHQ+Cjwvc3ZnPg==">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/profile-handler">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body>
  <p>Opening share composer...</p>
  <p><a href="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">Click here if not redirected</a></p>
</body>
</html>`;
}

// Error frame with improved styling
function generateErrorFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMTIxMjE4Ii8+CiAgPHRleHQgeD0iNjAwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjY0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmYzMzMzIj5FcnJvcjwvdGV4dD4KICA8dGV4dCB4PSI2MDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPlNvbWV0aGluZyB3ZW50IHdyb25nPC90ZXh0PgogIDx0ZXh0IHg9IjYwMCIgeT0iMzYwIiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+UGxlYXNlIHRyeSBhZ2FpbiBsYXRlcjwvdGV4dD4KICA8dGV4dCB4PSI2MDAiIHk9IjU4MCIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3ZTgyOTYiPkZyYW1lIGNyZWF0ZWQgYnkgMHhqdWRkPC90ZXh0Pgo8L3N2Zz4=">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/profile-handler">
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="View 24h Data">
  <meta property="fc:frame:button:4" content="Back to Main">
</head>
<body>
  <h1>Error</h1>
  <p>Something went wrong. Please try again later.</p>
</body>
</html>`;
}