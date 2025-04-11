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
      
      // Fetch followers for FID 12915 (Oxjudd)
      const followers = await fetchFollowers(12915, neynarApiKey);
      
      // Extract Warplet addresses from followers
      const warpletAddresses = extractWarpletAddresses(followers);
      
      // Get trading data from Dune Analytics
      const tradingData = await fetchTradingData(
        { 
          timeframe, 
          walletAddresses: Object.values(warpletAddresses) 
        }, 
        duneApiKey
      );
      
      // Process and format the data
      const formattedData = tradingData.rows.map(row => {
        const username = Object.keys(warpletAddresses).find(
          username => warpletAddresses[username] === row.wallet_address
        ) || row.username;
        
        return {
          username,
          walletAddress: row.wallet_address,
          topToken: row.top_token,
          pnl24h: timeframe === '24h' ? row.pnl : undefined,
          pnl7d: timeframe === '7d' ? row.pnl : undefined
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
