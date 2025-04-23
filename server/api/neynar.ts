/**
 * Neynar API Integration for Warplet Traders
 * Fetches user profile data, following list, and wallet addresses
 */

import axios from 'axios';

interface NeynarUserParams {
  fid: number;
}

interface UserProfile {
  fid: number;
  username: string;
  displayName: string;
  pfp: string;
  walletAddress?: string;
  bio?: string;
}

interface Following {
  users: UserProfile[];
  walletAddresses: Record<string, string>;
}

/**
 * Fetch user profile data from Neynar API
 * @param params User parameters (FID)
 * @param apiKey Neynar API key
 * @returns User profile data
 */
export async function fetchUserProfile(params: NeynarUserParams, apiKey: string): Promise<UserProfile | null> {
  try {
    const { fid } = params;
    
    console.log(`Fetching user profile for FID: ${fid}`);
    
    const response = await axios.get(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
      headers: {
        'api_key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data?.result?.user) {
      console.error('Failed to fetch user profile from Neynar:', response.data);
      return null;
    }
    
    const user = response.data.result.user;
    
    // Extract the Ethereum address from user.verifications if available
    let walletAddress = '';
    if (Array.isArray(user.verifications) && user.verifications.length > 0) {
      walletAddress = user.verifications[0];
    } else if (user.verified_addresses?.eth && user.verified_addresses.eth.length > 0) {
      walletAddress = user.verified_addresses.eth[0];
    }
    
    return {
      fid: user.fid,
      username: user.username || '',
      displayName: user.display_name || user.username || `User #${user.fid}`,
      pfp: user.pfp?.url || '',
      walletAddress,
      bio: user.profile?.bio?.text || ''
    };
  } catch (error) {
    console.error('Error fetching user profile from Neynar:', error);
    return null;
  }
}

/**
 * Fetch accounts that a user follows
 * @param params User parameters (FID)
 * @param apiKey Neynar API key
 * @returns List of user profiles of accounts the user follows, along with wallet addresses
 */
export async function fetchFollowing(params: NeynarUserParams, apiKey: string): Promise<Following> {
  try {
    const { fid } = params;
    
    console.log(`Fetching following list for FID: ${fid}`);
    
    // Default return value
    const result: Following = {
      users: [],
      walletAddresses: {}
    };
    
    // Get the user's following list from Neynar
    const response = await axios.get(`https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=100`, {
      headers: {
        'api_key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data?.result?.users) {
      console.error('Failed to fetch following list from Neynar:', response.data);
      return result;
    }
    
    const followedUsers = response.data.result.users;
    console.log(`User follows ${followedUsers.length} accounts`);
    
    // Process each followed user
    for (const user of followedUsers) {
      // Extract the Ethereum address if available
      let walletAddress = '';
      
      if (Array.isArray(user.verifications) && user.verifications.length > 0) {
        walletAddress = user.verifications[0];
      } else if (user.verified_addresses?.eth && user.verified_addresses.eth.length > 0) {
        walletAddress = user.verified_addresses.eth[0];
      }
      
      // Only include users with a wallet address
      if (walletAddress) {
        result.users.push({
          fid: user.fid,
          username: user.username || '',
          displayName: user.display_name || user.username || `User #${user.fid}`,
          pfp: user.pfp?.url || '',
          walletAddress
        });
        
        // Store the wallet address mapped to username for easy lookup
        result.walletAddresses[user.username || `fid:${user.fid}`] = walletAddress;
      }
    }
    
    console.log(`Found ${result.users.length} followed accounts with wallet addresses`);
    
    return result;
  } catch (error) {
    console.error('Error fetching following list from Neynar:', error);
    return { users: [], walletAddresses: {} };
  }
}