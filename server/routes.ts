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
      const duneApiKey = process.env.DUNE_API_KEY || '';
      
      if (!duneApiKey) {
        return res.status(500).json({ error: "Dune API key not configured" });
      }
      
      // Since Neynar's follower API requires a paid plan, we'll use a predefined set of 
      // wallets for testing purposes that are known traders on BASE
      const testWallets: Record<string, string> = {
        'dwr': '0x7E1A55EaEF29E36F592Fe3c25D8F1432fB6d700E',
        'elonisrael': '0xD8da6BF26964aF9D7eEd9e03E53415D37aA96045',
        'stkdeth': '0x5f6b9d042bD3F8e245c9c6d2E9e9363F626B7dfc',
        'treycoin': '0x741AA7CFB2c7bF2A1E7D4dA2e3Df6a56cA4131F3',
        'dingaling': '0x54BE3a794282C030b15E43aE2bB182E14c409C5e'
      };
      
      // Get trading data from Dune Analytics
      const tradingData = await fetchTradingData(
        { 
          timeframe, 
          walletAddresses: Object.values(testWallets) 
        }, 
        duneApiKey
      );
      
      // Process and format the data
      const formattedData = tradingData.rows.map(row => {
        const username = Object.keys(testWallets).find(
          username => testWallets[username].toLowerCase() === row.wallet_address.toLowerCase()
        ) || row.username;
        
        return {
          username,
          walletAddress: row.wallet_address,
          topToken: row.top_token,
          pnl24h: timeframe === '24h' ? row.pnl : null,
          pnl7d: timeframe === '7d' ? row.pnl : null
        };
      });
      
      // Validate the data using our schema
      const validatedData = formattedData.map(data => insertTraderSchema.parse(data));
      
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
