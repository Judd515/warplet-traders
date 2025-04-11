import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { fetchFollowers, extractWarpletAddresses } from "./api/neynar";
import { fetchTradingData } from "./api/dune";
import { insertTraderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint to get top traders with PnL data for a specific timeframe
  app.get("/api/traders", async (req, res) => {
    try {
      const timeframe = (req.query.timeframe as string) || '24h';
      const traders = await storage.getTraders();
      
      // Filter and sort data based on the requested timeframe
      const sortedTraders = traders
        .map(trader => ({
          ...trader,
          pnl: timeframe === '24h' ? trader.pnl24h : trader.pnl7d
        }))
        .sort((a, b) => {
          const aPnl = parseFloat(a.pnl?.toString() || '0');
          const bPnl = parseFloat(b.pnl?.toString() || '0');
          return bPnl - aPnl;
        })
        .slice(0, 5); // Get top 5

      res.json(sortedTraders);
    } catch (error) {
      console.error("Error fetching traders:", error);
      res.status(500).json({ error: "Failed to fetch trader data" });
    }
  });

  // Endpoint to refresh data from Neynar and Dune
  app.post("/api/refresh-data", async (req, res) => {
    try {
      const { timeframe } = req.body;
      
      if (!timeframe || !['24h', '7d'].includes(timeframe)) {
        return res.status(400).json({ error: "Invalid timeframe. Use '24h' or '7d'" });
      }
      
      // Get API keys from environment variables
      const neynarApiKey = process.env.NEYNAR_API_KEY || '';
      const duneApiKey = process.env.DUNE_API_KEY || '';
      
      if (!neynarApiKey || !duneApiKey) {
        return res.status(500).json({ error: "API keys not configured" });
      }
      
      console.log('Fetching followers from Neynar API...');
      
      // Fetch followers for FID 12915 (Oxjudd)
      const followers = await fetchFollowers(12915, neynarApiKey);
      console.log(`Found ${followers.length} followers`);
      
      // Extract Warplet addresses from followers (including custody addresses)
      const warpletAddresses = await extractWarpletAddresses(followers, neynarApiKey);
      const walletCount = Object.keys(warpletAddresses).length;
      console.log(`Extracted ${walletCount} wallet addresses from follower profiles`);
      
      // If we couldn't find any wallet addresses, use some known traders on BASE as a fallback
      let wallets: Record<string, string> = warpletAddresses;
      if (walletCount === 0) {
        console.log('No wallet addresses found in follower profiles, using fallback addresses');
        wallets = {
          'dwr': '0x7E1A55EaEF29E36F592Fe3c25D8F1432fB6d700E',
          'elonisrael': '0xD8da6BF26964aF9D7eEd9e03E53415D37aA96045',
          'stkdeth': '0x5f6b9d042bD3F8e245c9c6d2E9e9363F626B7dfc',
          'treycoin': '0x741AA7CFB2c7bF2A1E7D4dA2e3Df6a56cA4131F3',
          'dingaling': '0x54BE3a794282C030b15E43aE2bB182E14c409C5e'
        };
      }
      
      // Get trading data from Dune Analytics
      const tradingData = await fetchTradingData(
        { 
          timeframe, 
          walletAddresses: Object.values(wallets)
        }, 
        duneApiKey
      );
      
      // Process and format the data
      const formattedData = tradingData.rows.map(row => {
        const username = Object.keys(wallets).find(
          username => wallets[username].toLowerCase() === row.wallet_address.toLowerCase()
        ) || row.username;
        
        // Convert PnL values to strings to match our schema
        return {
          username,
          walletAddress: row.wallet_address,
          topToken: row.top_token || null,
          // Convert numbers to strings for schema compatibility
          pnl24h: timeframe === '24h' ? row.pnl.toString() : null,
          pnl7d: timeframe === '7d' ? row.pnl.toString() : null
        };
      });
      
      console.log('Formatted trader data:', JSON.stringify(formattedData));
      
      // Validate the data using our schema with a try/catch to help debug any issues
      let validatedData;
      try {
        validatedData = formattedData.map(data => insertTraderSchema.parse(data));
      } catch (error) {
        console.error('Schema validation error:', error);
        throw error;
      }
      
      // Update the storage with the new data
      const updatedTraders = await storage.updateTraders(validatedData);
      
      res.json(updatedTraders);
    } catch (error) {
      console.error("Error refreshing data:", error);
      res.status(500).json({ error: "Failed to refresh trader data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
