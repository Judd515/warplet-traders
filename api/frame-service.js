/**
 * Frame Service - Integration Layer for Frame Actions
 * Connects frame actions to data sources (Neynar, Dune Analytics)
 */

const axios = require('axios');

// Create a service object to handle all data processing
const frameService = {
  /**
   * Process user data - get following, wallet addresses, and trading data
   * @param {number} fid - The Farcaster user ID to process
   * @returns {Promise<object>} - The processed user data with top traders
   */
  async processUserData(fid) {
    try {
      console.log(`Processing data for FID ${fid}`);
      
      // Get API keys from environment variables
      const neynarApiKey = process.env.NEYNAR_API_KEY;
      const duneApiKey = process.env.DUNE_API_KEY;
      
      if (!neynarApiKey || !duneApiKey) {
        throw new Error('Missing required API keys');
      }
      
      // 1. Fetch accounts the user follows
      const following = await this.fetchFollowing(fid, neynarApiKey);
      console.log(`Found ${following.length} accounts followed by FID ${fid}`);
      
      // 2. Get wallet addresses for those accounts
      const addresses = await this.extractWalletAddresses(following, neynarApiKey);
      console.log(`Found ${Object.keys(addresses).length} wallet addresses`);
      
      // 3. Fetch trading data from Dune Analytics
      const tradingData = await this.fetchTradingData(addresses, duneApiKey);
      console.log(`Processed trading data for ${tradingData.length} wallets`);
      
      // 4. Return the top traders
      return {
        success: true,
        fid,
        totalFollowing: following.length,
        walletsFound: Object.keys(addresses).length,
        tradersFound: tradingData.length,
        // Take top 5 traders sorted by earnings
        topTraders: tradingData
          .sort((a, b) => b.earnings - a.earnings)
          .slice(0, 5)
      };
    } catch (error) {
      console.error(`Error processing data for FID ${fid}:`, error);
      return {
        success: false,
        error: error.message,
        fid
      };
    }
  },
  
  /**
   * Fetch accounts that a user follows
   * @param {number} fid - The FID to check
   * @param {string} apiKey - Neynar API key
   * @returns {Promise<Array>} - Array of users
   */
  async fetchFollowing(fid, apiKey) {
    try {
      console.log(`Fetching users that FID ${fid} is following...`);
      
      // Call Neynar API to get following
      const response = await axios.get(`https://api.neynar.com/v2/farcaster/following`, {
        params: {
          fid,
          limit: 100, // Get up to 100 followed accounts
        },
        headers: {
          'accept': 'application/json',
          'api_key': apiKey
        }
      });
      
      // Extract users from the response
      if (response.data && response.data.users && Array.isArray(response.data.users)) {
        // Map to a simpler format with needed fields
        return response.data.users
          .map(follow => {
            if (follow && follow.user) {
              // Most common format - user object nested inside follow object
              return follow.user;
            } else if (follow && follow.fid) {
              // Alternative format - user data directly in the follow object
              return follow;
            }
            return null;
          })
          .filter(user => user !== null); // Remove any nulls
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching following for FID ${fid}:`, error);
      return [];
    }
  },
  
  /**
   * Extract wallet addresses from user profiles
   * @param {Array} users - User objects from Neynar API
   * @param {string} apiKey - Neynar API key
   * @returns {Promise<object>} - Map of usernames to wallet addresses
   */
  async extractWalletAddresses(users, apiKey) {
    try {
      const addressMap = {};
      
      // Basic ethereum address regex
      const ethAddressRegex = /0x[a-fA-F0-9]{40}/gi;
      
      // Go through each user and try to find a wallet address
      for (const user of users) {
        // Skip if missing username
        if (!user.username) continue;
        
        // Try to get custody address from user object
        if (user.custody_address) {
          addressMap[user.username] = user.custody_address;
          continue;
        }
        
        // Try to find addresses in bio or profile
        if (user.profile?.bio?.text) {
          const matches = user.profile.bio.text.match(ethAddressRegex);
          if (matches && matches.length > 0) {
            addressMap[user.username] = matches[0];
            continue;
          }
        }
        
        // Look in display name
        if (user.display_name) {
          const matches = user.display_name.match(ethAddressRegex);
          if (matches && matches.length > 0) {
            addressMap[user.username] = matches[0];
            continue;
          }
        }
        
        // Get user details if needed
        if (!addressMap[user.username] && user.fid) {
          try {
            const userDetails = await this.fetchUserDetails(user.fid, apiKey);
            if (userDetails && userDetails.custody_address) {
              addressMap[user.username] = userDetails.custody_address;
            }
          } catch (err) {
            console.error(`Error fetching details for user ${user.username}:`, err);
          }
        }
      }
      
      return addressMap;
    } catch (error) {
      console.error('Error extracting wallet addresses:', error);
      return {};
    }
  },
  
  /**
   * Fetch user details from Neynar API
   * @param {number} fid - The FID to look up
   * @param {string} apiKey - Neynar API key
   * @returns {Promise<object>} - User details
   */
  async fetchUserDetails(fid, apiKey) {
    try {
      const response = await axios.get(`https://api.neynar.com/v2/farcaster/user/bulk`, {
        params: {
          fids: fid.toString(),
        },
        headers: {
          'accept': 'application/json',
          'api_key': apiKey
        }
      });
      
      if (response.data?.users && response.data.users.length > 0) {
        return response.data.users[0];
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching details for user FID ${fid}:`, error);
      return null;
    }
  },
  
  /**
   * Fetch trading data from Dune Analytics
   * @param {object} addresses - Map of usernames to wallet addresses
   * @param {string} apiKey - Dune API key
   * @returns {Promise<Array>} - Array of trading data
   */
  async fetchTradingData(addresses, apiKey) {
    try {
      // This would typically call the Dune API with the wallet addresses
      // For simplicity in this implementation, we'll return mock data
      // but in a real implementation, you would use the Dune query
      
      // Convert usernames and addresses to a trader format
      const traders = Object.entries(addresses).map(([username, walletAddress]) => {
        // Mock earnings and volume data
        // In a real implementation, this would come from Dune
        const earnings7d = Math.floor(Math.random() * 5000) + 500;
        const volume7d = earnings7d * (Math.floor(Math.random() * 10) + 5);
        
        return {
          username,
          walletAddress,
          topToken: ['BTC', 'ETH', 'USDC', 'ARB', 'DEGEN'][Math.floor(Math.random() * 5)],
          earnings: earnings7d,
          volume: volume7d
        };
      });
      
      return traders;
    } catch (error) {
      console.error('Error fetching trading data:', error);
      return [];
    }
  },
  
  /**
   * Generate an SVG for top traders
   * @param {Array} topTraders - Array of top traders
   * @returns {string} - Base64 encoded SVG
   */
  generateTopTradersImage(topTraders) {
    // Start building SVG string
    let svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400" fill="none">
  <rect width="800" height="400" fill="#1E243B"/>
  <text x="150" y="80" font-family="Arial" font-size="48" fill="white">TOP WARPLET EARNERS</text>
  <text x="150" y="150" font-family="Arial" font-size="24" fill="#94A3B8">Wallet</text>
  <text x="400" y="150" font-family="Arial" font-size="24" fill="#94A3B8">Top Token</text>
  <text x="650" y="150" font-family="Arial" font-size="24" fill="#94A3B8" text-anchor="end">7d Earnings</text>`;

    // Add traders to SVG
    topTraders.forEach((trader, index) => {
      const y = 200 + (index * 40);
      const earningsFormatted = `$${trader.earnings.toLocaleString()}`;
      
      svgContent += `
  <text x="150" y="${y}" font-family="Arial" font-size="24" fill="white">@${trader.username}</text>
  <text x="400" y="${y}" font-family="Arial" font-size="24" fill="white">${trader.topToken}</text>
  <text x="650" y="${y}" font-family="Arial" font-size="24" fill="#4ADE80" text-anchor="end">${earningsFormatted}</text>`;
    });
    
    // Close SVG
    svgContent += `
</svg>`;

    // Convert to base64
    const base64Svg = Buffer.from(svgContent).toString('base64');
    return `data:image/svg+xml;base64,${base64Svg}`;
  },
  
  /**
   * Generate frame HTML for user-specific results
   * @param {object} userData - Processed user data with top traders
   * @returns {string} - HTML for frame response
   */
  generateUserFrameHtml(userData) {
    const { fid, topTraders, walletsFound, tradersFound } = userData;
    
    // Generate SVG with trader data
    const imageUrl = this.generateTopTradersImage(topTraders);
    
    // Create the share text
    let shareText = `Top Warplet Earners among my follows (7d)\n\n`;
    
    topTraders.forEach((trader, index) => {
      shareText += `${index + 1}. @${trader.username} (${trader.topToken}): $${trader.earnings.toLocaleString()} / $${(trader.volume / 1000).toFixed(1)}K volume\n`;
    });
    
    shareText += `\nSee your own results: https://warplet-traders.vercel.app/clean-frame.html`;
    
    // Encode for URL
    const encodedShareText = encodeURIComponent(shareText);
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Check Standard List">
  <meta property="fc:frame:button:1:action" content="post">
  <meta property="fc:frame:button:2" content="Share My Results">
  <meta property="fc:frame:button:2:action" content="link">
  <meta property="fc:frame:button:2:target" content="https://warpcast.com/~/compose?text=${encodedShareText}">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/frame-action">
</head>
<body>
  <h1>Your Top Traders (FID: ${fid})</h1>
  <p>Found ${walletsFound} wallet addresses and ${tradersFound} active traders among your follows.</p>
</body>
</html>`;
  }
};

module.exports = frameService;