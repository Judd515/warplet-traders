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
    const response = await axios.get(`https://api.neynar.com/v2/farcaster/user/followers`, {
      params: {
        fid,
        limit: 100,
      },
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    return response.data.users || [];
  } catch (error) {
    console.error('Error fetching followers from Neynar API:', error);
    throw new Error('Failed to fetch followers from Neynar API');
  }
}

// Extract Warplet addresses from user profiles
export function extractWarpletAddresses(users: NeynarUser[]): Record<string, string> {
  const warpletAddresses: Record<string, string> = {};
  
  users.forEach(user => {
    // Assuming Warplet addresses might be mentioned in bio
    // This is a simplified approach - in a real app, we'd need a more robust way to get these
    const bioText = user.profile?.bio?.text || '';
    
    // Basic regex to find Ethereum addresses in bio
    const addressMatch = bioText.match(/0x[a-fA-F0-9]{40}/);
    
    if (addressMatch && addressMatch[0]) {
      warpletAddresses[user.username] = addressMatch[0];
    }
  });
  
  return warpletAddresses;
}
