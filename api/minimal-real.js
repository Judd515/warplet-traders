/**
 * Minimal API-powered Frame Handler
 * Ultra-minimal implementation for reliability with real data
 */

import axios from 'axios';

// Configuration
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || '';
const DUNE_API_KEY = process.env.DUNE_API_KEY || '';
const BASE_URL = 'https://warplet-traders.vercel.app';

// HTTP Headers
const FRAME_HEADERS = {
  'Content-Type': 'text/html',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};

// Simple in-memory cache for better performance
const dataCache = {
  last24h: null,
  last7d: null,
  lastUpdate: null
};

export default async function handler(req, res) {
  // Set reliable headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    // Parse request
    let frameType = 'main';
    let fid = null;
    
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex, fid: userFid } = req.body.untrustedData;
      fid = userFid || 0;
      
      // Simple button logic
      if (buttonIndex === 1) {
        frameType = '24h';
      } else if (buttonIndex === 2) {
        frameType = '7d';
      } else if (buttonIndex === 3 && frameType !== 'share') {
        // Handle share action
        if (frameType === '24h' || frameType === '7d') {
          const traders = await fetchTraderData(frameType);
          const formattedData = formatTraderDataForShare(traders);
          const shareText = encodeURIComponent(
            `Check out the top Warplet traders on BASE!\n\n` +
            `${formattedData}\n` +
            `${BASE_URL}/api/minimal-real`
          );
          return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
        } else {
          // Default share action
          const shareText = encodeURIComponent(
            `Check out the top Warplet traders on BASE!\n\n` +
            `${BASE_URL}/api/minimal-real`
          );
          return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
        }
      }
    }
    
    // Generate HTML response based on frame type
    let html = '';
    
    if (frameType === '24h') {
      // Fetch data for 24h view
      const traders = await fetchTraderData('24h');
      html = get24hFrameHtml(traders, fid);
    } else if (frameType === '7d') {
      // Fetch data for 7d view
      const traders = await fetchTraderData('7d');
      html = get7dFrameHtml(traders, fid);
    } else {
      // Main view
      html = getMainFrameHtml();
    }
    
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error in minimal-real handler:', error);
    return res.status(200).send(getErrorFrameHtml());
  }
}

/**
 * Fetch real trader data from APIs
 */
async function fetchTraderData(timeframe = '24h') {
  try {
    // Check cache first
    const cacheKey = timeframe === '24h' ? 'last24h' : 'last7d';
    const cacheTtl = 5 * 60 * 1000; // 5 minutes
    
    if (dataCache[cacheKey] && dataCache.lastUpdate && (Date.now() - dataCache.lastUpdate) < cacheTtl) {
      return dataCache[cacheKey];
    }
    
    // Make Dune API request
    const response = await axios.post(
      'https://api.dune.com/api/v1/graphql',
      {
        query: `query DuneQuery($timeframe: String!) {
          query_result(query_id: ${timeframe === '24h' ? '3184028' : '3184030'}, 
          parameters: { text_trading_period: $timeframe }) {
            data
          }
        }`,
        variables: { timeframe }
      },
      { headers: { 'x-dune-api-key': DUNE_API_KEY } }
    );
    
    // Process the response
    const results = response?.data?.data?.query_result?.data || [];
    const formattedResults = results.map(item => ({
      username: item.username || 'Unknown',
      address: item.address || '',
      earnings: item.earnings || 0,
      volume: item.volume || 0,
      trades: item.trades || 0
    })).sort((a, b) => b.earnings - a.earnings).slice(0, 5);
    
    // Update cache
    dataCache[cacheKey] = formattedResults;
    dataCache.lastUpdate = Date.now();
    
    return formattedResults;
  } catch (error) {
    console.error(`Error fetching ${timeframe} data:`, error);
    return [];
  }
}

/**
 * Format trader data for share message
 */
function formatTraderDataForShare(traders) {
  if (!traders || traders.length === 0) {
    return "No trader data available";
  }
  
  return `Top ${traders.length} Earners:\n` + 
    traders.map((trader, index) => {
      const earnings = new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(trader.earnings);
      
      return `${index + 1}. @${trader.username}: ${earnings}`;
    }).join('\n');
}

/**
 * HTML Templates
 */
function getMainFrameHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/api/real-data-frame?type=main" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/minimal-real" />
  <meta property="fc:frame:button:1" content="View 24h Data" />
  <meta property="fc:frame:button:2" content="View 7d Data" />
  <meta property="fc:frame:button:3" content="Check Me" />
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
  <meta property="fc:frame:image" content="${BASE_URL}/api/real-data-frame?type=24h" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/minimal-real" />
  <meta property="fc:frame:button:1" content="View 7d Data" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
</head>
<body>
  <h1>Top Warplet Traders - 24h</h1>
</body>
</html>`;
}

function get7dFrameHtml(traders, fid) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/api/real-data-frame?type=7d" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/minimal-real" />
  <meta property="fc:frame:button:1" content="View 24h Data" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
</head>
<body>
  <h1>Top Warplet Traders - 7d</h1>
</body>
</html>`;
}

function getErrorFrameHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/api/real-data-frame?type=error" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/minimal-real" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
}