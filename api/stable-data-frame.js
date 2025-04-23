/**
 * Stable Frame with Real Trading Data
 * Simplified but still using real-time data from Dune Analytics
 */

import axios from 'axios';

// Cache for trader data
const dataCache = {
  data: new Map(),
  expires: new Map(),
  ttl: 5 * 60 * 1000 // 5 minutes cache
};

export default async function handler(req, res) {
  try {
    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Base URL
    const baseUrl = 'https://warplet-traders.vercel.app';
    
    // Default view is 7d
    let view = '7d';
    
    // For POST requests (button clicks)
    if (req.method === 'POST' && req.body?.untrustedData) {
      const { buttonIndex, buttonText } = req.body.untrustedData;
      console.log(`Button clicked: ${buttonIndex}, text: "${buttonText || ''}"`);
      
      if (buttonIndex === 1) {
        const btnText = buttonText || '';
        
        if (btnText.includes('24h')) {
          view = '24h';
        } else if (btnText.includes('7d')) {
          view = '7d';
        } else if (btnText.includes('Try')) {
          view = '7d'; // default view
        }
      } else if (buttonIndex === 2) {
        // Share button
        const shareText = encodeURIComponent(
          `Check out the top Warplet traders on BASE!\n\nhttps://warplet-traders.vercel.app/api/stable-data-frame`
        );
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      } else if (buttonIndex === 3) {
        // Tip button
        return res.redirect(302, 'https://warpcast.com/0xjudd');
      }
    }
    
    // Get trader data
    try {
      const traders = await getTraderData(view);
      const svgImage = generateDataSvg(traders, view);
      
      // Encode the SVG for use as a data URL
      const encodedSvg = Buffer.from(svgImage).toString('base64');
      const dataUrl = `data:image/svg+xml;base64,${encodedSvg}`;
      
      return res.status(200).send(generateFrameHtml(dataUrl, view, baseUrl));
    } catch (dataError) {
      console.error('Error fetching trader data:', dataError);
      return res.status(200).send(generateErrorFrameHtml(baseUrl));
    }
    
  } catch (error) {
    console.error('Frame handler error:', error);
    return res.status(200).send(generateErrorFrameHtml(baseUrl));
  }
}

// Get trader data from Dune Analytics
async function getTraderData(timeframe) {
  // Check cache first
  const cacheKey = `traders-${timeframe}`;
  if (
    dataCache.data.has(cacheKey) && 
    dataCache.expires.has(cacheKey) && 
    dataCache.expires.get(cacheKey) > Date.now()
  ) {
    return dataCache.data.get(cacheKey);
  }
  
  const duneApiKey = process.env.DUNE_API_KEY;
  if (!duneApiKey) {
    throw new Error('DUNE_API_KEY is not set');
  }
  
  // Query IDs for 24h and 7d data
  const queryId = timeframe === '24h' ? '3184028' : '3184030';
  
  // Get updated query ID based on the API documentation
  // Updated to use the actual execute endpoint instead of GraphQL
  const apiUrl = `https://api.dune.com/api/v1/query/${queryId}/execute`;
  console.log(`Fetching Dune data from: ${apiUrl}`);
  
  // First execute the query
  const executeResponse = await axios.post(
    apiUrl,
    { 
      // Parameters if needed for this query
      parameters: {
        text_trading_period: timeframe
      }
    },
    { 
      headers: { 
        'x-dune-api-key': duneApiKey 
      }
    }
  );
  
  // Get the execution ID
  const executionId = executeResponse?.data?.execution_id;
  if (!executionId) {
    console.error('Failed to get execution ID:', executeResponse?.data);
    throw new Error('Failed to execute Dune query');
  }
  
  // Wait for results with retries
  let results = null;
  let retries = 5;
  
  while (retries > 0) {
    try {
      // Check status and get results
      const statusResponse = await axios.get(
        `https://api.dune.com/api/v1/execution/${executionId}/status`,
        { 
          headers: { 
            'x-dune-api-key': duneApiKey 
          }
        }
      );
      
      const status = statusResponse?.data?.state;
      
      if (status === 'QUERY_STATE_COMPLETED') {
        // Get results
        const resultsResponse = await axios.get(
          `https://api.dune.com/api/v1/execution/${executionId}/results`,
          { 
            headers: { 
              'x-dune-api-key': duneApiKey 
            }
          }
        );
        
        results = resultsResponse?.data?.result?.rows || [];
        break;
      } else if (status === 'QUERY_STATE_FAILED') {
        throw new Error('Dune query failed');
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries--;
    } catch (error) {
      console.error('Error checking Dune query status:', error);
      retries--;
      
      if (retries === 0) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (!results) {
    throw new Error('Failed to get Dune query results after retries');
  }
  
  // Process the results into the expected format
  // Extract and process the data
  const formattedResults = results || [];
  
  // Process and sort data
  const traderData = formattedResults
    .map(item => ({
      username: item.username || 'Unknown',
      address: item.address || '',
      earnings: item.earnings || 0,
      volume: item.volume || 0,
      token: item.token || 'ETH'
    }))
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 5);
  
  // Cache the data
  dataCache.data.set(cacheKey, traderData);
  dataCache.expires.set(cacheKey, Date.now() + dataCache.ttl);
  
  return traderData;
}

// Generate frame HTML
function generateFrameHtml(imageUrl, view, baseUrl) {
  // Set buttons based on view
  let button1Content = view === '24h' ? 'View 7d Data' : 'View 24h Data';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/stable-data-frame" />
  <meta property="fc:frame:button:1" content="${button1Content}" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
</head>
<body>
  <h1>Warplet Top Traders (${view})</h1>
</body>
</html>`;
}

// Generate error frame HTML
function generateErrorFrameHtml(baseUrl) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/static-image.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/stable-data-frame" />
  <meta property="fc:frame:button:1" content="Try Again" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
</head>
<body>
  <h1>Error loading trader data</h1>
</body>
</html>`;
}

// Generate trader data SVG
function generateDataSvg(traders, timeframe) {
  // Format title based on timeframe
  const title = timeframe === '24h' ? 'Top Warplet Traders (24h)' : 'Top Warplet Traders (7d)';
  
  // SVG header and background
  let svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background -->
  <rect width="1200" height="630" fill="#1e293b" />
  
  <!-- Blue header bar -->
  <rect width="1200" height="100" fill="#3b82f6" />
  
  <!-- Title -->
  <text x="600" y="65" font-family="Verdana" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
  
  <!-- Subtitle -->
  <text x="600" y="140" font-family="Verdana" font-size="28" fill="#94a3b8" text-anchor="middle">Earnings and Volume on BASE</text>
  
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