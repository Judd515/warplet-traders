/**
 * Simple testing endpoint for Neynar API
 * Use this to diagnose issues with the Neynar API key
 */
import axios from 'axios';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Check if we have an API key
    if (!process.env.NEYNAR_API_KEY) {
      return res.status(500).json({ 
        error: 'NEYNAR_API_KEY environment variable is not set',
        hint: 'Please set the NEYNAR_API_KEY environment variable' 
      });
    }
    
    // Get the FID from query parameters or use a default
    const fid = req.query.fid || '12915'; // default to 0xjudd's FID
    
    // Log the API key (first 4 characters only) for debugging
    console.log(`Using Neynar API key: ${process.env.NEYNAR_API_KEY.substring(0, 4)}...`);
    
    // First test the user endpoint
    try {
      const userResponse = await axios.get(
        `https://api.neynar.com/v2/farcaster/user?fid=${fid}`,
        {
          headers: {
            'accept': 'application/json',
            'api_key': process.env.NEYNAR_API_KEY
          },
          timeout: 5000
        }
      );
      
      // Return success message with profile data
      return res.status(200).json({
        success: true,
        endpoint: 'user',
        apiKeyPrefix: process.env.NEYNAR_API_KEY.substring(0, 4),
        fid: fid,
        data: {
          username: userResponse.data?.user?.username,
          displayName: userResponse.data?.user?.display_name,
          pfpUrl: userResponse.data?.user?.pfp_url,
        },
        raw: userResponse.data
      });
    } catch (userError) {
      // If the direct user endpoint fails, try the bulk endpoint
      try {
        const bulkResponse = await axios.get(
          `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
          {
            headers: {
              'accept': 'application/json',
              'api_key': process.env.NEYNAR_API_KEY
            },
            timeout: 5000
          }
        );
        
        // Return success message with profile data from bulk endpoint
        return res.status(200).json({
          success: true,
          endpoint: 'bulk',
          apiKeyPrefix: process.env.NEYNAR_API_KEY.substring(0, 4),
          fid: fid,
          data: {
            username: bulkResponse.data?.users?.[0]?.username,
            displayName: bulkResponse.data?.users?.[0]?.display_name,
            pfpUrl: bulkResponse.data?.users?.[0]?.pfp_url,
          },
          raw: bulkResponse.data
        });
      } catch (bulkError) {
        // Both endpoints failed, return detailed error
        return res.status(500).json({
          success: false, 
          error: 'Both Neynar API endpoints failed',
          userError: {
            message: userError.message,
            response: userError.response?.data || null,
            status: userError.response?.status || null
          },
          bulkError: {
            message: bulkError.message,
            response: bulkError.response?.data || null,
            status: bulkError.response?.status || null
          }
        });
      }
    }
  } catch (error) {
    // Generic error handling
    return res.status(500).json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}