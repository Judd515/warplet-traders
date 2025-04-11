import axios from 'axios';

// Neynar API types
interface NeynarFollowerResponse {
  users: NeynarUser[];
}

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
}

// Function to fetch followers from Neynar API
export async function fetchFollowers(fid: number, apiKey: string): Promise<NeynarUser[]> {
  try {
    // Updated endpoint based on the Neynar API documentation
    const response = await axios.get(`https://api.neynar.com/v2/farcaster/followers`, {
      params: {
        fid,
        limit: 100,
      },
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    console.log('Neynar API response status:', response.status);
    
    // Check if the API response contains the expected data
    if (response.data && response.data.users) {
      return response.data.users;
    } else {
      console.log('Unexpected Neynar API response format:', JSON.stringify(response.data));
      return [];
    }
  } catch (error) {
    console.error('Error fetching followers from Neynar API:', error);
    throw new Error('Failed to fetch followers from Neynar API');
  }
}

// Fetch user details including custody address if available
async function fetchUserDetails(fid: number, apiKey: string): Promise<any> {
  try {
    const response = await axios.get(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    return response.data?.user;
  } catch (error) {
    console.error(`Error fetching details for user FID ${fid}:`, error);
    return null;
  }
}

// Extract Warplet addresses from user profiles
export async function extractWarpletAddresses(users: NeynarUser[], apiKey: string): Promise<Record<string, string>> {
  const warpletAddresses: Record<string, string> = {};
  
  console.log(`Examining ${users.length} followers for wallet addresses...`);
  
  // First pass: check for wallet addresses in profile text (this is fast)
  users.forEach(user => {
    // Check multiple places for Ethereum addresses
    // 1. Look in bio
    const bioText = user.profile?.bio?.text || '';
    // 2. Look in display name
    const displayName = user.display_name || '';
    // 3. Look in username (sometimes people append their address)
    const username = user.username || '';
    
    // Combine all text fields to search for addresses
    const combinedText = `${bioText} ${displayName} ${username}`;
    
    // Basic regex to find Ethereum addresses
    const ethAddressRegex = /0x[a-fA-F0-9]{40}/gi;
    const matches = combinedText.match(ethAddressRegex);
    
    if (matches && matches.length > 0) {
      // Take the first address found
      warpletAddresses[user.username] = matches[0];
      console.log(`Found wallet address in profile for @${user.username}: ${matches[0]}`);
    }
  });
  
  // Second pass: For users without addresses, try fetching custody address via user details
  // Note: We limit this to a small number to avoid excessive API calls
  const usersToCheck = users
    .filter(user => !warpletAddresses[user.username])
    .slice(0, 5); // Only check the first 5 to avoid rate limits

  console.log(`Checking custody addresses for ${usersToCheck.length} users...`);
  
  for (const user of usersToCheck) {
    try {
      const userDetails = await fetchUserDetails(user.fid, apiKey);
      
      if (userDetails && userDetails.custody_address) {
        warpletAddresses[user.username] = userDetails.custody_address;
        console.log(`Found custody address for @${user.username}: ${userDetails.custody_address}`);
      }
    } catch (error) {
      console.error(`Error fetching details for user ${user.username}:`, error);
    }
  }
  
  const walletCount = Object.keys(warpletAddresses).length;
  const percentage = users.length > 0 ? (walletCount / users.length * 100).toFixed(1) : '0';
  console.log(`Found ${walletCount} wallet addresses (${percentage}% of followers)`);
  
  return warpletAddresses;
}
