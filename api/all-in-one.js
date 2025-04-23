/**
 * ALL-IN-ONE Warplet Traders Frame Handler
 * This single file handles everything to stay within Vercel's 12 function limit
 * - Frame rendering
 * - Button handling
 * - SVG image generation
 * - Real-time data fetching from Dune Analytics
 */

import axios from 'axios';

// Cache for data
const dataCache = {
  '24h': null,
  '7d': null,
  lastUpdated: null,
  ttl: 5 * 60 * 1000 // 5 minutes
};

export default async function handler(req, res) {
  // Check if this is an image request
  if (req.query.type === 'image') {
    return handleImageRequest(req, res);
  }
  
  // Otherwise handle it as a frame request
  return handleFrameRequest(req, res);
}

// Handle frame requests
async function handleFrameRequest(req, res) {
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Base URL for the app
  const baseUrl = 'https://warplet-traders.vercel.app';
  
  try {
    // Default view is main
    let view = 'main';
    
    // Handle button clicks
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex } = req.body.untrustedData;
      
      // Button 1 logic
      if (buttonIndex === 1) {
        // Different actions based on button context
        const buttonText = req.body.untrustedData.buttonText || '';
        
        if (buttonText.includes('24h')) {
          view = '24h';
        } else if (buttonText.includes('7d')) {
          view = '7d';
        } else if (buttonText.includes('Try Again')) {
          view = 'main';
        }
      } 
      // Button 2 logic
      else if (buttonIndex === 2) {
        const buttonText = req.body.untrustedData.buttonText || '';
        
        if (buttonText.includes('7d')) {
          view = '7d';
        } else {
          view = 'main';
        }
      }
      // Button 3 (Share) logic
      else if (buttonIndex === 3) {
        // Get real trader data for the share text
        try {
          const timeframe = view === '24h' ? '24h' : view === '7d' ? '7d' : '24h';
          const traderData = await fetchTraderData(timeframe);
          const shareText = formatShareText(traderData, timeframe);
          return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
        } catch (error) {
          console.error('Error generating share text:', error);
          const shareText = encodeURIComponent(
            `Check out the top Warplet traders on BASE!\n\nhttps://warplet-traders.vercel.app/api/all-in-one`
          );
          return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
        }
      }
    }
    
    // Generate frame HTML based on the view
    if (view === '24h') {
      return res.status(200).send(generate24hFrame(baseUrl));
    } else if (view === '7d') {
      return res.status(200).send(generate7dFrame(baseUrl));
    } else {
      return res.status(200).send(generateMainFrame(baseUrl));
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).send(generateErrorFrame());
  }
}

// Handle image requests
async function handleImageRequest(req, res) {
  try {
    // Set content type for SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=60'); // 1 minute cache
    
    // Get requested view
    const { view = '24h' } = req.query;
    
    // Generate SVG based on view
    if (view === 'main') {
      return res.status(200).send(generateMainSvg());
    } else if (view === '24h' || view === '7d') {
      const data = await fetchTraderData(view);
      return res.status(200).send(generateTraderSvg(data, view));
    } else {
      return res.status(200).send(generateErrorSvg('Invalid view type'));
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(200).send(generateErrorSvg('Error loading data'));
  }
}

// Fetch trader data from Dune Analytics
async function fetchTraderData(timeframe = '24h') {
  // Check cache first
  if (dataCache[timeframe] && 
      dataCache.lastUpdated && 
      (Date.now() - dataCache.lastUpdated) < dataCache.ttl) {
    return dataCache[timeframe];
  }
  
  try {
    const duneApiKey = process.env.DUNE_API_KEY;
    if (!duneApiKey) {
      throw new Error('DUNE_API_KEY not set');
    }
    
    // Use the correct query ID for the timeframe
    const queryId = timeframe === '24h' ? '3184028' : '3184030';
    
    // Execute the query
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
          'x-dune-api-key': duneApiKey 
        }
      }
    );
    
    // Extract and process results
    const results = response?.data?.data?.query_result?.data || [];
    
    // Process data
    const processedData = results
      .map(item => ({
        username: item.username || 'Unknown',
        address: item.address || '',
        earnings: typeof item.earnings === 'number' ? item.earnings : parseFloat(item.earnings) || 0,
        volume: typeof item.volume === 'number' ? item.volume : parseFloat(item.volume) || 0,
        token: item.token || ''
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
    
    // Update cache
    dataCache[timeframe] = processedData;
    dataCache.lastUpdated = Date.now();
    
    return processedData;
  } catch (error) {
    console.error(`Error fetching trader data: ${error.message}`);
    throw error;
  }
}

// Format trader data for share text
function formatShareText(traders, timeframe) {
  const traderList = traders
    .map((trader, index) => {
      const formattedEarnings = formatCurrency(trader.earnings);
      const formattedVolume = formatCurrency(trader.volume, true);
      return `${index + 1}. @${trader.username}: ${formattedEarnings} / ${formattedVolume} volume`;
    })
    .join('\n');
  
  return encodeURIComponent(
    `Check out the top Warplet traders on BASE (${timeframe})!\n\n${traderList}\n\nhttps://warplet-traders.vercel.app/api/all-in-one`
  );
}

// Generate main frame
function generateMainFrame(baseUrl) {
  // Use static image that we know works
  const imageUrl = `${baseUrl}/images/main.png`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/all-in-one" />
  <meta property="fc:frame:button:1" content="View 24h Data" />
  <meta property="fc:frame:button:2" content="View 7d Data" />
  <meta property="fc:frame:button:3" content="Share" />
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>`;
}

// Generate 24h frame
function generate24hFrame(baseUrl) {
  // Use static image that we know works
  const imageUrl = `${baseUrl}/images/24h.png`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/all-in-one" />
  <meta property="fc:frame:button:1" content="View 7d Data" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
</head>
<body>
  <h1>24h Top Traders</h1>
</body>
</html>`;
}

// Generate 7d frame
function generate7dFrame(baseUrl) {
  // Use static image that we know works
  const imageUrl = `${baseUrl}/images/7d.png`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/all-in-one" />
  <meta property="fc:frame:button:1" content="View 24h Data" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
</head>
<body>
  <h1>7d Top Traders</h1>
</body>
</html>`;
}

// Generate error frame
function generateErrorFrame() {
  const baseUrl = 'https://warplet-traders.vercel.app';
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.png" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/all-in-one" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
}

// Generate main view SVG
function generateMainSvg() {
  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background -->
  <rect width="1200" height="630" fill="#1e293b" />
  
  <!-- Title -->
  <text x="600" y="240" font-family="Verdana" font-size="56" font-weight="bold" fill="#ffffff" text-anchor="middle">Warplet Traders</text>
  
  <!-- Subtitle -->
  <text x="600" y="320" font-family="Verdana" font-size="32" fill="#94a3b8" text-anchor="middle">Top Earners on BASE</text>
  
  <!-- Instructions -->
  <text x="600" y="450" font-family="Verdana" font-size="26" fill="#ffffff" text-anchor="middle">Click a button below to see real-time data</text>
  
  <!-- Footer -->
  <text x="600" y="580" font-family="Verdana" font-size="24" fill="#94a3b8" text-anchor="middle">Created by 0xJudd</text>
</svg>`;
}

// Generate trader data SVG
function generateTraderSvg(traders, timeframe) {
  // Format title based on timeframe
  const title = timeframe === '24h' ? 'Top Warplet Traders (24h)' : 'Top Warplet Traders (7d)';
  
  // SVG header and background
  let svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background -->
  <rect width="1200" height="630" fill="#1e293b" />
  
  <!-- Title -->
  <text x="600" y="80" font-family="Verdana" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
  
  <!-- Subtitle -->
  <text x="600" y="130" font-family="Verdana" font-size="28" fill="#94a3b8" text-anchor="middle">Earnings and Volume on BASE</text>
  
  <!-- Headers -->
  <text x="200" y="200" font-family="Verdana" font-size="28" fill="#94a3b8">Username</text>
  <text x="700" y="200" font-family="Verdana" font-size="28" fill="#94a3b8">Earnings</text>
  <text x="900" y="200" font-family="Verdana" font-size="28" fill="#94a3b8">Volume</text>`;
  
  // Add trader rows
  traders.forEach((trader, index) => {
    const yPos = 250 + (index * 60);
    
    // Format earnings and volume for display
    const formattedEarnings = formatCurrency(trader.earnings);
    const formattedVolume = formatCurrency(trader.volume, true);
    
    svg += `
  <!-- Trader ${index + 1} -->
  <text x="200" y="${yPos}" font-family="Verdana" font-size="32" fill="#ffffff">@${trader.username}</text>
  <text x="700" y="${yPos}" font-family="Verdana" font-size="32" fill="#ffffff">${formattedEarnings}</text>
  <text x="900" y="${yPos}" font-family="Verdana" font-size="32" fill="#ffffff">${formattedVolume}</text>`;
  });
  
  // Add footer
  svg += `
  <!-- Footer -->
  <text x="600" y="580" font-family="Verdana" font-size="24" fill="#94a3b8" text-anchor="middle">Created by 0xJudd</text>
</svg>`;
  
  return svg;
}

// Generate error SVG
function generateErrorSvg(errorMessage = 'Error loading data') {
  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background -->
  <rect width="1200" height="630" fill="#1e293b" />
  
  <!-- Error message -->
  <text x="600" y="280" font-family="Verdana" font-size="40" fill="#ef4444" text-anchor="middle">${errorMessage}</text>
  <text x="600" y="340" font-family="Verdana" font-size="28" fill="#94a3b8" text-anchor="middle">Please try again later</text>
  
  <!-- Footer -->
  <text x="600" y="580" font-family="Verdana" font-size="24" fill="#94a3b8" text-anchor="middle">Created by 0xJudd</text>
</svg>`;
}

// Format currency for display
function formatCurrency(value, compact = false) {
  if (!value) return '$0';
  
  if (compact) {
    // For volume, use compact notation
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  } else {
    // For earnings, use full notation with commas
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }
}