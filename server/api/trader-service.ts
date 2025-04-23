/**
 * Trader Service for Warplet Traders
 * Combines Neynar and Dune API data to generate trader insights
 */

import { fetchFollowing, fetchUserProfile } from './neynar';
import { fetchTradingData } from './dune';
import { generateGlobalSvg, generateUserSvg, generateErrorSvg } from './svg-generator';

interface TraderData {
  fid?: number;
  username: string;
  displayName: string;
  pfp?: string;
  earnings: string;
  volume: string;
  top_token?: string;
}

/**
 * Get global top trader data from Dune Analytics
 * @param timeframe The timeframe for data (7d or 24h)
 * @returns SVG image as string and formatted trader data
 */
export async function getGlobalTraderData(timeframe: string = '7d') {
  try {
    console.log(`Getting global trader data for ${timeframe} timeframe`);
    
    // For global data, we use a predefined list of addresses that 
    // represent the most active Warplet traders
    const globalAddresses = [
      '0x8fc5d6afe572fefc4ec153587b63ce543f6fa2ea',
      '0x74232704659ef37d08b8a2497c61120ee1a5a5c7',
      '0xbcd57c382d6da53d42fa0d995365effe3c59e655',
      '0xa24a5580e22731dabbfef71d28210e4248141a5e',
      '0x2bd0fef74a4d69a7e83e734a2e8dcf98350af5be',
      '0x1fb8b6cebd5fd67c7be36ffe62771e9e6a3cc0ad',
      '0x77770af34e76b7ad4723ce91efb39826761d2e0c',
      '0x9a54feb128f9ad59ef683d4f76bd1e716010bd03',
      '0xc58000d36926828fb5d1adeec2bbe634df8b3829',
      '0xca7a1a193a02e0520b6b745cd2eb24967c93d76b'
    ];
    
    const duneApiKey = process.env.DUNE_API_KEY;
    if (!duneApiKey) {
      throw new Error('DUNE_API_KEY environment variable not set');
    }
    
    // Fetch trading data from Dune
    const tradingData = await fetchTradingData({
      timeframe,
      walletAddresses: globalAddresses
    }, duneApiKey);
    
    // Check if we got valid data
    if (!tradingData?.rows || tradingData.rows.length === 0) {
      console.error('No trading data found for global addresses');
      return {
        svgImage: generateErrorSvg('No trading data available'),
        traders: []
      };
    }
    
    // Format the trader data for display
    const traders: TraderData[] = tradingData.rows.map(row => {
      return {
        username: `wallet:${row.wallet_address.slice(0, 6)}...${row.wallet_address.slice(-4)}`,
        displayName: `${row.wallet_address.slice(0, 6)}...${row.wallet_address.slice(-4)}`,
        earnings: row.earnings,
        volume: row.volume,
        top_token: row.top_token
      };
    })
    // Sort traders by earnings (highest first)
    .sort((a, b) => parseFloat(b.earnings) - parseFloat(a.earnings))
    // Take top 5 traders
    .slice(0, 5);
    
    console.log(`Generated data for ${traders.length} global traders`);
    
    // Generate SVG image
    const svgImage = generateGlobalSvg(traders, timeframe);
    
    return {
      svgImage,
      traders
    };
  } catch (error) {
    console.error('Error getting global trader data:', error);
    return {
      svgImage: generateErrorSvg(),
      traders: []
    };
  }
}

/**
 * Get user-specific top trader data - shows performance of accounts the user follows
 * @param fid The Farcaster ID of the user
 * @param timeframe The timeframe for data (7d or 24h)
 * @returns SVG image as string and formatted trader data
 */
export async function getUserTraderData(fid: number, timeframe: string = '7d') {
  try {
    console.log(`Getting user-specific trader data for FID: ${fid}, timeframe: ${timeframe}`);
    
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    const duneApiKey = process.env.DUNE_API_KEY;
    
    if (!neynarApiKey || !duneApiKey) {
      throw new Error('Missing required API keys in environment variables');
    }
    
    // Fetch user profile
    const userProfile = await fetchUserProfile({ fid }, neynarApiKey);
    if (!userProfile) {
      console.error(`Failed to fetch user profile for FID ${fid}`);
      return {
        svgImage: generateErrorSvg('User profile not found'),
        traders: []
      };
    }
    
    // Fetch accounts the user follows
    const following = await fetchFollowing({ fid }, neynarApiKey);
    if (!following.users || following.users.length === 0) {
      console.error(`User FID ${fid} is not following any accounts with wallet addresses`);
      return {
        svgImage: generateErrorSvg('No followed accounts with wallets found'),
        traders: []
      };
    }
    
    // Extract wallet addresses from followed accounts
    const walletAddresses = following.users
      .filter(user => user.walletAddress)
      .map(user => user.walletAddress as string);
    
    if (walletAddresses.length === 0) {
      console.error(`No wallet addresses found for accounts followed by FID ${fid}`);
      return {
        svgImage: generateErrorSvg('No wallet addresses found'),
        traders: []
      };
    }
    
    // Fetch trading data for followed accounts
    const tradingData = await fetchTradingData({
      timeframe,
      walletAddresses
    }, duneApiKey);
    
    // Check if we got valid data
    if (!tradingData?.rows || tradingData.rows.length === 0) {
      console.error(`No trading data found for FID ${fid}'s followed accounts`);
      return {
        svgImage: generateErrorSvg('No trading data for followed accounts'),
        traders: []
      };
    }
    
    // Map trading data to user profiles
    const traders: TraderData[] = tradingData.rows.map(row => {
      // Try to find the user that corresponds to this wallet address
      const user = following.users.find(u => 
        u.walletAddress?.toLowerCase() === row.wallet_address.toLowerCase()
      );
      
      return {
        fid: user?.fid,
        username: user?.username || `wallet:${row.wallet_address.slice(0, 6)}...`,
        displayName: user?.displayName || `${row.wallet_address.slice(0, 6)}...${row.wallet_address.slice(-4)}`,
        pfp: user?.pfp,
        earnings: row.earnings,
        volume: row.volume,
        top_token: row.top_token
      };
    })
    // Sort traders by earnings (highest first)
    .sort((a, b) => parseFloat(b.earnings) - parseFloat(a.earnings))
    // Take top 5 traders
    .slice(0, 5);
    
    console.log(`Generated data for ${traders.length} traders followed by FID ${fid}`);
    
    // Generate SVG image
    const svgImage = generateUserSvg(traders, timeframe, userProfile.username);
    
    return {
      svgImage,
      traders,
      username: userProfile.username
    };
  } catch (error) {
    console.error('Error getting user trader data:', error);
    return {
      svgImage: generateErrorSvg(),
      traders: []
    };
  }
}

/**
 * Format share text for social media sharing
 * @param traders Array of trader data
 * @param isUserSpecific Whether this is user-specific data
 * @param username Username if user-specific
 * @returns Formatted share text
 */
export function formatShareText(traders: TraderData[], isUserSpecific: boolean = false, username: string = ''): string {
  let shareText = '';
  
  if (isUserSpecific && username) {
    shareText = `📊 Check out the top Warplet traders among accounts ${username} follows:\n\n`;
  } else {
    shareText = '📊 Top Warplet traders on BASE (7d):\n\n';
  }
  
  // Add top 3 traders to the share text
  traders.slice(0, 3).forEach((trader, index) => {
    const earnings = parseFloat(trader.earnings);
    const earningsPrefix = earnings >= 0 ? '+' : '';
    
    shareText += `${index + 1}. ${trader.displayName}: ${earningsPrefix}$${Math.abs(earnings).toFixed(2)}\n`;
  });
  
  // Add app URL
  shareText += '\nhttps://warplet-traders.vercel.app/api/working-with-redesign';
  
  return shareText;
}