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
  custody_address?: string; // May be included in some API responses
}

// Function to fetch followers from Neynar API and get their custody addresses
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
      console.log(`Fetched ${response.data.users.length} followers`);
      
      // Get all the FIDs so we can fetch their details in batches
      const followerFids = response.data.users.map((user: NeynarUser) => user.fid).join(',');
      console.log(`Will fetch details for FIDs: ${followerFids.substring(0, 100)}...`);
      
      try {
        // Fetch user details in bulk to get custody addresses
        const userDetailsResponse = await axios.get(`https://api.neynar.com/v2/farcaster/user/bulk`, {
          params: {
            fids: followerFids,
          },
          headers: {
            'accept': 'application/json',
            'api_key': apiKey
          }
        });
        
        if (userDetailsResponse.data && userDetailsResponse.data.users) {
          // Create a map of FID to custody address
          const custodyAddressMap = new Map<number, string>();
          userDetailsResponse.data.users.forEach((user: any) => {
            if (user.custody_address) {
              custodyAddressMap.set(user.fid, user.custody_address);
              console.log(`Found custody address for user ${user.username}: ${user.custody_address}`);
            }
          });
          
          // Enhance the followers with custody addresses
          const enhancedFollowers = response.data.users.map((follower: NeynarUser) => {
            if (custodyAddressMap.has(follower.fid)) {
              return {
                ...follower,
                custody_address: custodyAddressMap.get(follower.fid)
              };
            }
            return follower;
          });
          
          console.log(`Found ${custodyAddressMap.size} custody addresses out of ${enhancedFollowers.length} followers`);
          return enhancedFollowers;
        }
      } catch (detailsError) {
        console.error('Error fetching user details for custody addresses:', detailsError);
        // If this fails, we'll still return the original followers
      }
      
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
    // Using the correct endpoint for the Neynar API with the correct query parameter format
    const response = await axios.get(`https://api.neynar.com/v2/farcaster/user/bulk`, {
      params: {
        fids: `${fid}`, // Convert to string as required by API
      },
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    console.log(`API response for user ${fid}:`, JSON.stringify(response.data).substring(0, 200) + '...');
    
    // Check for custody address in the response
    if (response.data?.users && response.data.users.length > 0) {
      const user = response.data.users[0];
      
      // Check if custody address is available
      if (user.custody_address) {
        console.log(`Found custody address for FID ${fid}: ${user.custody_address}`);
      } else {
        console.log(`No custody address found for FID ${fid}`);
      }
      
      return user;
    }
    
    return null;
  } catch (error: any) {
    console.error(`Error fetching details for user FID ${fid}:`, error);
    // Log more detailed error information
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    return null;
  }
}

// Extract Warplet addresses from user profiles
export async function extractWarpletAddresses(users: NeynarUser[], apiKey: string): Promise<Record<string, string>> {
  const warpletAddresses: Record<string, string> = {};
  
  console.log(`Examining ${users.length} followers for wallet addresses...`);
  
  // First check: look for custody_address directly in the user object
  // This will be present if our enhanced follower API call worked
  users.forEach(user => {
    if (user.custody_address) {
      warpletAddresses[user.username] = user.custody_address;
      console.log(`Found custody address for @${user.username}: ${user.custody_address}`);
    }
  });
  
  // Second check: look for wallet addresses in profile text
  users.forEach(user => {
    // Skip if we already have an address for this user
    if (warpletAddresses[user.username]) return;
    
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
  
  // We don't need the third pass anymore since we should have all custody addresses
  // from the enhanced follower API call, but keep it as a fallback just in case
  if (Object.keys(warpletAddresses).length === 0) {
    const usersToCheck = users.slice(0, 5); // Only check a few to avoid rate limits
    console.log(`No addresses found yet. Checking details for ${usersToCheck.length} users...`);
    
    for (const user of usersToCheck) {
      try {
        const userDetails = await fetchUserDetails(user.fid, apiKey);
        
        if (userDetails && userDetails.custody_address) {
          warpletAddresses[user.username] = userDetails.custody_address;
          console.log(`Found custody address for @${user.username}: ${userDetails.custody_address}`);
        }
      } catch (error: any) {
        console.error(`Error fetching details for user ${user.username}:`, error);
      }
    }
  }
  
  const walletCount = Object.keys(warpletAddresses).length;
  const percentage = users.length > 0 ? (walletCount / users.length * 100).toFixed(1) : '0';
  console.log(`Found ${walletCount} wallet addresses (${percentage}% of followers)`);
  
  return warpletAddresses;
}
