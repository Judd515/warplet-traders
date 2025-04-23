/**
 * Image Generator for Warplet Traders Frames
 */

import axios from 'axios';

// Cache management
const imageCache = {
  data: new Map(),
  expires: new Map(),
  ttl: 5 * 60 * 1000 // 5 minutes
};

export default async function handler(req, res) {
  try {
    // Set content type for SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=60'); // 1 minute cache
    
    // Get requested view
    const { view = 'main' } = req.query;
    
    // Generate SVG based on view
    let svg;
    if (view === 'main') {
      svg = generateMainSvg();
    } else if (view === '24h' || view === '7d') {
      try {
        const traders = await getTraderData(view);
        svg = generateTraderSvg(traders, view);
      } catch (error) {
        console.error(`Error getting trader data for ${view}:`, error);
        svg = generateErrorSvg(`Error loading ${view} data`);
      }
    } else {
      svg = generateErrorSvg('Invalid view type');
    }
    
    return res.status(200).send(svg);
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(200).send(generateErrorSvg('Error generating image'));
  }
}

// Get trader data from Dune Analytics
async function getTraderData(timeframe) {
  // Check cache first
  const cacheKey = `traders-${timeframe}`;
  if (
    imageCache.data.has(cacheKey) &&
    imageCache.expires.has(cacheKey) &&
    imageCache.expires.get(cacheKey) > Date.now()
  ) {
    return imageCache.data.get(cacheKey);
  }
  
  try {
    const duneApiKey = process.env.DUNE_API_KEY;
    if (!duneApiKey) {
      throw new Error('DUNE_API_KEY environment variable is not set');
    }
    
    // Query IDs for 24h and 7d data
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
          'x-dune-api-key': duneApiKey 
        }
      }
    );
    
    // Extract and process the data
    const results = response?.data?.data?.query_result?.data || [];
    
    // Process and sort data
    const traderData = results
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
    imageCache.data.set(cacheKey, traderData);
    imageCache.expires.set(cacheKey, Date.now() + imageCache.ttl);
    
    return traderData;
  } catch (error) {
    console.error(`Error fetching trader data for ${timeframe}:`, error);
    throw error;
  }
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