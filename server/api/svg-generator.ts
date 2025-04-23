/**
 * SVG Generator Service for Warplet Traders
 * Creates dynamic SVG images with real trader data
 */

interface TraderData {
  username: string;
  displayName: string;
  pfp?: string;
  earnings: string;
  volume: string;
  top_token?: string;
}

/**
 * Generate a Global Top Traders SVG image
 * @param traders Array of trader data objects
 * @param timeframe The timeframe for the data (7d or 24h)
 * @returns Complete SVG image as a string
 */
export function generateGlobalSvg(traders: TraderData[], timeframe: string): string {
  // Use the 7-day timeframe display
  const title = 'Top Warplet Traders on BASE';
  const subtitle = `${timeframe.toUpperCase()} Performance`;
  
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#111827"/>
    <rect y="0" width="1200" height="80" fill="#1e40af"/>
    <text x="40" y="50" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white">${title}</text>
    <text x="40" y="120" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af">${subtitle}</text>
    
    <!-- Table Headers -->
    <text x="80" y="170" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Trader</text>
    <text x="650" y="170" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Earnings</text>
    <text x="850" y="170" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Volume</text>
    <text x="1050" y="170" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Top Token</text>
    
    <!-- Horizontal Line -->
    <line x1="40" y1="185" x2="1160" y2="185" stroke="#4b5563" stroke-width="2"/>
    
    ${traders.slice(0, 5).map((trader, index) => {
      const yPos = 240 + index * 70;
      
      // Format earnings with colors (green for positive, red for negative)
      const earnings = parseFloat(trader.earnings);
      const earningsColor = earnings >= 0 ? "#10b981" : "#ef4444";
      const earningsPrefix = earnings >= 0 ? "+" : "";
      const earningsFormatted = formatCurrency(earnings);
      
      return `
        <!-- Trader Row ${index + 1} -->
        <text x="80" y="${yPos}" font-family="Arial, sans-serif" font-size="20" fill="white">${trader.displayName}</text>
        <text x="650" y="${yPos}" font-family="Arial, sans-serif" font-size="20" fill="${earningsColor}">${earningsPrefix}${earningsFormatted}</text>
        <text x="850" y="${yPos}" font-family="Arial, sans-serif" font-size="20" fill="white">${formatCurrency(parseFloat(trader.volume))}</text>
        <text x="1050" y="${yPos}" font-family="Arial, sans-serif" font-size="20" fill="white">${trader.top_token || 'N/A'}</text>
      `;
    }).join('')}
    
    <!-- Warplet Branding -->
    <text x="40" y="590" font-family="Arial, sans-serif" font-size="20" fill="#9ca3af">warplet.vercel.app</text>
  </svg>`;
}

/**
 * Generate a User-Specific Top Traders SVG image
 * @param traders Array of trader data objects
 * @param timeframe The timeframe for the data (7d or 24h)
 * @param username The username of the current user
 * @returns Complete SVG image as a string
 */
export function generateUserSvg(traders: TraderData[], timeframe: string, username: string): string {
  const title = `${username}'s Top Traders`;
  const subtitle = `${timeframe.toUpperCase()} Performance Among Followed Accounts`;
  
  const profileCircles = traders.slice(0, 5).map((trader, index) => {
    // Create circular profile images
    const cx = 600 + (index - 2) * 70;
    const cy = 110;
    const r = 25;
    
    return trader.pfp 
      ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#img${index})" />`
      : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#6d28d9" />`;
  }).join('');
  
  const imgDefs = traders.slice(0, 5).map((trader, index) => {
    if (!trader.pfp) return '';
    
    return `
      <pattern id="img${index}" patternUnits="userSpaceOnUse" width="50" height="50">
        <image href="${trader.pfp}" x="0" y="0" width="50" height="50" preserveAspectRatio="xMidYMid slice" />
      </pattern>
    `;
  }).join('');
  
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      ${imgDefs}
    </defs>
    
    <rect width="1200" height="630" fill="#111827"/>
    <rect y="0" width="1200" height="80" fill="#1e40af"/>
    <text x="40" y="50" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white">${title}</text>
    <text x="40" y="120" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af">${subtitle}</text>
    
    <!-- Profile Images -->
    ${profileCircles}
    
    <!-- Table Headers -->
    <text x="80" y="170" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Trader</text>
    <text x="650" y="170" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Earnings</text>
    <text x="850" y="170" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Volume</text>
    <text x="1050" y="170" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Top Token</text>
    
    <!-- Horizontal Line -->
    <line x1="40" y1="185" x2="1160" y2="185" stroke="#4b5563" stroke-width="2"/>
    
    ${traders.slice(0, 5).map((trader, index) => {
      const yPos = 240 + index * 70;
      
      // Format earnings with colors (green for positive, red for negative)
      const earnings = parseFloat(trader.earnings);
      const earningsColor = earnings >= 0 ? "#10b981" : "#ef4444";
      const earningsPrefix = earnings >= 0 ? "+" : "";
      const earningsFormatted = formatCurrency(earnings);
      
      return `
        <!-- Trader Row ${index + 1} -->
        <text x="80" y="${yPos}" font-family="Arial, sans-serif" font-size="20" fill="white">${trader.displayName}</text>
        <text x="650" y="${yPos}" font-family="Arial, sans-serif" font-size="20" fill="${earningsColor}">${earningsPrefix}${earningsFormatted}</text>
        <text x="850" y="${yPos}" font-family="Arial, sans-serif" font-size="20" fill="white">${formatCurrency(parseFloat(trader.volume))}</text>
        <text x="1050" y="${yPos}" font-family="Arial, sans-serif" font-size="20" fill="white">${trader.top_token || 'N/A'}</text>
      `;
    }).join('')}
    
    <!-- Warplet Branding -->
    <text x="40" y="590" font-family="Arial, sans-serif" font-size="20" fill="#9ca3af">warplet.vercel.app</text>
  </svg>`;
}

/**
 * Generate an Error SVG image
 * @param errorMessage Optional error message to display
 * @returns Complete SVG image as a string
 */
export function generateErrorSvg(errorMessage: string = 'Error loading data'): string {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#111827"/>
    <rect y="0" width="1200" height="80" fill="#1e40af"/>
    <text x="40" y="50" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white">Warplet Traders</text>
    
    <!-- Error Icon -->
    <circle cx="600" cy="250" r="80" fill="#ef4444" fill-opacity="0.2" />
    <text x="600" y="250" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="#ef4444" text-anchor="middle" dominant-baseline="middle">!</text>
    
    <!-- Error Message -->
    <text x="600" y="370" font-family="Arial, sans-serif" font-size="28" fill="white" text-anchor="middle">${errorMessage}</text>
    <text x="600" y="420" font-family="Arial, sans-serif" font-size="22" fill="#9ca3af" text-anchor="middle">Please try again</text>
    
    <!-- Warplet Branding -->
    <text x="40" y="590" font-family="Arial, sans-serif" font-size="20" fill="#9ca3af">warplet.vercel.app</text>
  </svg>`;
}

/**
 * Format a currency value with appropriate abbreviations
 * @param value The numeric value to format
 * @returns Formatted currency string
 */
function formatCurrency(value: number): string {
  // Format negative values properly
  const absValue = Math.abs(value);
  const prefix = value < 0 ? '-' : '';
  
  if (absValue >= 1_000_000) {
    return `${prefix}$${(absValue / 1_000_000).toFixed(2)}M`;
  } else if (absValue >= 1_000) {
    return `${prefix}$${(absValue / 1_000).toFixed(2)}K`;
  } else {
    return `${prefix}$${absValue.toFixed(2)}`;
  }
}