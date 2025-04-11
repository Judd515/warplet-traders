import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import axios from 'axios';
import { fetchFollowing, extractWarpletAddresses } from "./api/neynar";
import { fetchTradingData } from "./api/dune";
import { insertTraderSchema } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';

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
      
      console.log('Fetching users you are following from Neynar API...');
      
      // Fetch users that FID 12915 (your FID) is following
      const following = await fetchFollowing(12915, neynarApiKey);
      console.log(`Found ${following.length} accounts you are following`);
      
      // Direct fetch of users with their custody addresses
      console.log('Directly fetching user details for better custody address discovery...');
      
      // Get up to 5 FIDs to fetch details for (to avoid rate limits)
      const fidsToCheck = following
        .slice(0, 5)
        .map((f: any) => f.fid)
        .filter((fid: any) => fid !== undefined && fid !== null); // Filter out invalid FIDs
      
      console.log(`Will check custody addresses for these FIDs: ${fidsToCheck.join(', ')}`);
      
      // Only make the API call if we have valid FIDs
      let userDetailsResponse: any = { data: { users: [] } };
      
      if (fidsToCheck.length > 0) {
        // Direct API call to get user details with custody addresses
        userDetailsResponse = await axios.get(`https://api.neynar.com/v2/farcaster/user/bulk`, {
          params: {
            fids: fidsToCheck.join(','),
          },
          headers: {
            'accept': 'application/json',
            'api_key': neynarApiKey
          }
        });
        
        console.log('API response status:', userDetailsResponse.status);
      } else {
        console.log('No valid FIDs found to check for custody addresses');
      }
      
      // Extract custody addresses
      const warpletAddresses: Record<string, string> = {};
      
      if (userDetailsResponse.data?.users) {
        userDetailsResponse.data.users.forEach((user: any) => {
          if (user.custody_address) {
            warpletAddresses[user.username] = user.custody_address;
            console.log(`Found custody address for ${user.username}: ${user.custody_address}`);
          }
        });
      }
      
      // If no custody addresses were found, fall back to searching profile text
      if (Object.keys(warpletAddresses).length === 0) {
        console.log('No custody addresses found, checking profile text...');
        const textAddresses = await extractWarpletAddresses(following, neynarApiKey);
        Object.assign(warpletAddresses, textAddresses);
      }
      
      const walletCount = Object.keys(warpletAddresses).length;
      console.log(`Extracted ${walletCount} wallet addresses total`);
      
      // We'll only use the wallet addresses we found from accounts you're following
      let wallets: Record<string, string> = warpletAddresses;
      
      // If no addresses were found, return an empty array with a message
      if (walletCount === 0) {
        console.log('No wallet addresses found in profiles of accounts you follow');
        // Return a response indicating no addresses were found
        return res.json([{
          username: "No wallets found",
          walletAddress: "",
          topToken: null,
          pnl24h: null,
          pnl7d: null
        }]);
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

  // Add a route to download the project ZIP file
  app.get('/download/project', (req, res) => {
    const zipPath = path.resolve('/home/runner/workspace/warplet-top-traders.zip');
    
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, 'warplet-top-traders.zip', (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          res.status(500).send('Error downloading the project file');
        }
      });
    } else {
      res.status(404).send('Project file not found');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
