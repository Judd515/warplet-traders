/**
 * Dynamic Trader Data Image Generator
 * Creates SVG images with real trader data from Dune Analytics
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
  try {
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=60'); // 1 minute cache
    
    const { timeframe = '24h' } = req.query;
    
    // Get trader data
    const traderData = await fetchTraderData(timeframe);
    
    // Generate SVG with real data
    const svg = generateDataSvg(traderData, timeframe);
    
    return res.status(200).send(svg);
  } catch (error) {
    console.error('Error generating trader image:', error);
    return res.status(200).send(generateErrorSvg());
  }
}

// Fetch real trader data from Dune Analytics
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

// Generate SVG with trader data
function generateDataSvg(traders, timeframe) {
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
    <text x="900" y="200" font-family="Verdana" font-size="28" fill="#94a3b8">Volume</text>
  `;
  
  // Add trader rows
  traders.forEach((trader, index) => {
    const yPos = 250 + (index * 60);
    
    // Format earnings and volume
    const formattedEarnings = formatCurrency(trader.earnings);
    const formattedVolume = formatCurrency(trader.volume, true);
    
    svg += `
    <!-- Trader ${index + 1} -->
    <text x="200" y="${yPos}" font-family="Verdana" font-size="32" fill="#ffffff">@${trader.username}</text>
    <text x="700" y="${yPos}" font-family="Verdana" font-size="32" fill="#ffffff">${formattedEarnings}</text>
    <text x="900" y="${yPos}" font-family="Verdana" font-size="32" fill="#ffffff">${formattedVolume}</text>
    `;
  });
  
  // Add footer
  svg += `
    <!-- Footer -->
    <text x="600" y="580" font-family="Verdana" font-size="24" fill="#94a3b8" text-anchor="middle">Created by 0xJudd</text>
  `;
  
  // Close SVG
  svg += `</svg>`;
  
  return svg;
}

// Generate error SVG
function generateErrorSvg() {
  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <!-- Dark background -->
    <rect width="1200" height="630" fill="#1e293b" />
    
    <!-- Error message -->
    <text x="600" y="280" font-family="Verdana" font-size="40" fill="#ef4444" text-anchor="middle">Error loading data</text>
    <text x="600" y="340" font-family="Verdana" font-size="28" fill="#94a3b8" text-anchor="middle">Please try again later</text>
    
    <!-- Footer -->
    <text x="600" y="580" font-family="Verdana" font-size="24" fill="#94a3b8" text-anchor="middle">Created by 0xJudd</text>
  </svg>
  `;
}

// Format currency values
function formatCurrency(value, compact = false) {
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