/**
 * Working Frame Handler with Real Data
 * Built on the working absolute-fix.js implementation
 */

import axios from 'axios';

// Configuration
const DUNE_API_KEY = process.env.DUNE_API_KEY || '';
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || '';
const BASE_URL = 'https://warplet-traders.vercel.app';

// Minimal in-memory cache
const dataCache = {
  '24h': null,
  '7d': null,
  lastUpdated: null
};

export default async function handler(req, res) {
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    // Determine action based on request
    let view = 'main';
    let fid = null;
    
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex, fid: userFid } = req.body.untrustedData;
      fid = userFid;
      
      // Ultra-simple button handling
      if (buttonIndex === 1) {
        view = '24h';
      } else if (buttonIndex === 2) {
        view = '7d';
      } else if (buttonIndex === 3) {
        // Get trader data for share message
        const timeframe = view === '24h' ? '24h' : view === '7d' ? '7d' : '24h';
        const traderData = await fetchTraderData(timeframe);
        const shareText = formatShareText(traderData, timeframe);
        
        // Redirect to share URL
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      }
    }
    
    // Generate appropriate frame HTML
    const frame = await generateFrame(view, fid);
    return res.status(200).send(frame);
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).send(generateErrorFrame());
  }
}

// Fetch trader data
async function fetchTraderData(timeframe = '24h') {
  try {
    // Check cache first (5 min TTL)
    if (dataCache[timeframe] && 
        dataCache.lastUpdated && 
        (Date.now() - dataCache.lastUpdated) < 5 * 60 * 1000) {
      return dataCache[timeframe];
    }
    
    // Fetch data from Dune Analytics
    const queryId = timeframe === '24h' ? '3184028' : '3184030';
    
    const response = await axios.post(
      'https://api.dune.com/api/v1/graphql',
      {
        query: `query DuneQuery {
          query_result(query_id: ${queryId}, 
          parameters: { text_trading_period: "${timeframe}" }) {
            data
          }
        }`
      },
      { 
        headers: { 
          'x-dune-api-key': DUNE_API_KEY 
        }
      }
    );
    
    // Extract results
    const results = response?.data?.data?.query_result?.data || [];
    
    // Process and sort data
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
    dataCache[timeframe] = processedData;
    dataCache.lastUpdated = Date.now();
    
    return processedData;
  } catch (error) {
    console.error(`Error fetching trader data: ${error.message}`);
    
    // Return fallback data to ensure the frame continues to work
    return [
      { username: 'api_error', address: '', earnings: 0, volume: 0, token: 'ETH' }
    ];
  }
}

// Format share text
function formatShareText(traders, timeframe) {
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
      
      return `${index + 1}. @${trader.username}: ${formattedEarnings} / ${formattedVolume} volume`;
    })
    .join('\n');
  
  return encodeURIComponent(
    `Check out the top Warplet traders on BASE (${timeframe})!\n\n${traderList}\n\nhttps://warplet-traders.vercel.app/api/absolute-fix`
  );
}

// Generate frame HTML
async function generateFrame(view, fid) {
  try {
    // Base URL for the app
    const baseUrl = 'https://warplet-traders.vercel.app';
    
    // Select the proper image and buttons based on the view
    let image = `${baseUrl}/images/main.png`;
    let button1 = 'View 24h Data';
    let button2 = 'View 7d Data';
    let button3 = 'Share';
    
    if (view === '24h') {
      // Use static images that we KNOW work
      image = `${baseUrl}/images/24h.png`;
      
      // Fetch data just for the share functionality
      try {
        await fetchTraderData('24h');
      } catch (e) {
        console.error('Error pre-fetching 24h data:', e);
      }
      
      button1 = 'View 7d Data';
      button2 = 'Main View';
      button3 = 'Share';
    } else if (view === '7d') {
      // Use static images that we KNOW work
      image = `${baseUrl}/images/7d.png`;
      
      // Fetch data just for the share functionality
      try {
        await fetchTraderData('7d');
      } catch (e) {
        console.error('Error pre-fetching 7d data:', e);
      }
      
      button1 = 'View 24h Data';
      button2 = 'Main View';
      button3 = 'Share';
    }
    
    // Return the HTML for the frame
    return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${image}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/absolute-fix" />
  <meta property="fc:frame:button:1" content="${button1}" />
  <meta property="fc:frame:button:2" content="${button2}" />
  <meta property="fc:frame:button:3" content="${button3}" />
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
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${BASE_URL}/images/error.png" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/absolute-fix" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
}