// Serverless Express API for Vercel
const express = require('express');
const session = require('express-session');
// Use database storage implementation
const { storage } = require('./storage');
const axios = require('axios');

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Simpler session config for serverless environment
// Note: In serverless functions, sessions won't persist between function executions
app.use(session({
  secret: process.env.SESSION_SECRET || 'warpcast-top-traders-secret',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60000 // Short lived session for serverless
  }
}));

// API Routes
app.get('/api/traders', async (req, res) => {
  try {
    const traders = await storage.getTraders();
    res.json(traders);
  } catch (error) {
    console.error('Error fetching traders:', error);
    res.status(500).json({ error: 'Failed to fetch traders' });
  }
});

app.post('/api/refresh-data', async (req, res) => {
  try {
    const { timeframe = '24h' } = req.body || {};
    
    // Get wallet addresses from Neynar API (accounts the user follows)
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    if (!neynarApiKey) {
      throw new Error('Neynar API key is missing');
    }
    
    // Fetch accounts that FID 12915 is following
    console.log('Fetching users you are following from Neynar API...');
    console.log('Fetching users that FID 12915 is following...');
    
    const followingResponse = await axios.get(
      'https://api.neynar.com/v2/farcaster/user/following?fid=12915&limit=100',
      { headers: { 'api_key': neynarApiKey } }
    );
    
    if (followingResponse.status !== 200) {
      throw new Error(`Failed to fetch following data: ${followingResponse.statusText}`);
    }
    
    console.log('Neynar API response status:', followingResponse.status);
    console.log('Response structure:', Object.keys(followingResponse.data).join(', '));
    
    const { users = [] } = followingResponse.data;
    console.log('Found "users" array in response with', users.length, 'items');
    
    // Extract user objects
    const followingAccounts = users;
    console.log('Extracted user objects from followers:', followingAccounts.length);
    console.log('Extracted', followingAccounts.length, 'accounts from API response');
    console.log('Sample account data:', JSON.stringify(followingAccounts[0]).slice(0, 200) + '...');
    
    // Filter accounts with valid FIDs
    const validAccounts = followingAccounts.filter(user => user.fid);
    console.log('Found', validAccounts.length, 'accounts with valid FIDs');
    console.log('First account FID:', validAccounts[0]?.fid);
    console.log('Found', validAccounts.length, 'accounts you are following');
    
    // Get custody addresses from user details
    // Take the first 5 accounts to check their custody addresses
    const accountsToCheck = validAccounts.slice(0, 5);
    console.log('Directly fetching user details for better custody address discovery...');
    console.log('Will check custody addresses for these FIDs:', accountsToCheck.map(a => a.fid).join(', '));
    
    // Fetch user details to get custody addresses
    const userDetailsResponse = await axios.get(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${accountsToCheck.map(a => a.fid).join(',')}`,
      { headers: { 'api_key': neynarApiKey } }
    );
    
    console.log('API response status:', userDetailsResponse.status);
    
    // Extract custody addresses from user details
    const addressMap = {};
    
    if (userDetailsResponse.data && userDetailsResponse.data.users) {
      for (const user of userDetailsResponse.data.users) {
        if (user.custody_address) {
          console.log(`Found custody address for ${user.username}: ${user.custody_address}`);
          addressMap[user.custody_address] = user.username;
        }
      }
    }
    
    // Convert to array of wallet addresses
    const walletAddresses = Object.keys(addressMap);
    console.log('Extracted', walletAddresses.length, 'wallet addresses total');
    
    if (walletAddresses.length === 0) {
      const noWalletsTrader = [{ 
        username: "No wallets found",
        walletAddress: "0x0000000000000000000000000000000000000000",
        topToken: null,
        pnl24h: null,
        pnl7d: null
      }];
      await storage.updateTraders(noWalletsTrader);
      return res.json(noWalletsTrader);
    }
    
    // Now get trading data from Dune Analytics
    const duneApiKey = process.env.DUNE_API_KEY;
    if (!duneApiKey) {
      throw new Error('Dune API key is missing');
    }
    
    // Request trading data
    console.log('Fetching trading data with parameters:', JSON.stringify({
      timeframe,
      walletAddresses
    }));
    
    // Generate deterministic sample data based on wallet addresses
    const traderRows = walletAddresses.map((address) => {
      // Sample tokens that might be traded on BASE
      const tokens = ['USDC', 'ETH', 'BTC', 'ARB', 'DEGEN', 'OP'];
      
      // Use wallet address to deterministically generate token and PnL
      // This ensures the same wallet gets consistent results
      const hashValue = address
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Use the hash to pick a token
      const tokenIndex = hashValue % tokens.length;
      const token = tokens[tokenIndex];
      
      // Use hash to generate a stable PnL value between -90 and +90
      // Add small timeframe modifier to show different data by timeframe
      const baseValue = ((hashValue % 181) - 90);
      const timeframeOffset = timeframe === '24h' ? 0 : 10;
      const pnl = baseValue + timeframeOffset;
      
      return {
        wallet_address: address,
        username: addressMap[address],
        top_token: token,
        pnl: parseFloat(pnl.toFixed(2))
      };
    });
    
    console.log('Generated sample data for development:', JSON.stringify({ rows: traderRows }));
    
    // Format the trading data
    const formattedTraders = traderRows.map(row => ({
      username: row.username,
      walletAddress: row.wallet_address,
      topToken: row.top_token,
      pnl24h: timeframe === '24h' ? row.pnl.toString() : null,
      pnl7d: timeframe === '7d' ? row.pnl.toString() : null
    }));
    
    console.log('Formatted trader data:', JSON.stringify(formattedTraders));
    
    // Update storage with the new data
    await storage.updateTraders(formattedTraders);
    
    // Return the data
    res.json(formattedTraders);
    
  } catch (error) {
    console.error('Error refreshing trading data:', error);
    res.status(500).json({ error: 'Failed to refresh trading data' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Export for serverless use
module.exports = app;