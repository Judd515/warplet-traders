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

// Import the frame handlers
// @ts-ignore - ignore TypeScript errors for these imports
import simpleFrameHandler from '../api/simple-frame';
import warpcastStableHandler from '../api/warpcast-stable';
import testNeynarHandler from '../api/test-neynar';
import frameActionHandler from '../api/frame-action';
import profileHandlerHandler from '../api/profile-handler';
import externalImageHandler from '../api/external-image-frame';
import realDataFrameHandler from '../api/real-data-frame';
import absoluteMinimalHandler from '../api/absolute-minimal';

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
          earnings: timeframe === '24h' ? trader.earnings24h : trader.earnings7d,
          volume: timeframe === '24h' ? trader.volume24h : trader.volume7d
        }))
        .sort((a, b) => {
          const aEarnings = parseFloat(a.earnings?.toString() || '0');
          const bEarnings = parseFloat(b.earnings?.toString() || '0');
          return bEarnings - aEarnings; // Sort by earnings (highest first)
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
          earnings24h: null,
          earnings7d: null,
          volume24h: null,
          volume7d: null
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
        
        // Convert earnings and volume values to strings to match our schema
        return {
          username,
          walletAddress: row.wallet_address,
          topToken: row.top_token || null,
          // Convert numbers to strings for schema compatibility
          earnings24h: timeframe === '24h' ? row.earnings.toString() : null,
          earnings7d: timeframe === '7d' ? row.earnings.toString() : null,
          volume24h: timeframe === '24h' ? row.volume.toString() : null,
          volume7d: timeframe === '7d' ? row.volume.toString() : null
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
    const zipPath = path.resolve('/home/runner/workspace/warplet-traders.zip');
    
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, 'warplet-traders.zip', (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          res.status(500).send('Error downloading the project file');
        }
      });
    } else {
      res.status(404).send('Project file not found');
    }
  });
  
  // Add route for the simple-frame handler (for Warpcast Frame)
  app.post('/api/simple-frame', (req, res) => {
    try {
      console.log('Simple frame request received:', JSON.stringify(req.body));
      // @ts-ignore - simpleFrameHandler is expecting Express request/response
      return simpleFrameHandler(req, res);
    } catch (error) {
      console.error('Error in simple-frame handler:', error);
      res.status(500).send('Error processing frame request');
    }
  });

  // Add route for the warpcast-stable frame handler
  app.all('/api/warpcast-stable', (req, res) => {
    try {
      console.log('Warpcast stable frame request received:', req.method, JSON.stringify(req.body || {}));
      // @ts-ignore - warpcastStableHandler is expecting Express request/response
      return warpcastStableHandler(req, res);
    } catch (error) {
      console.error('Error in warpcast-stable handler:', error);
      res.status(500).send('Error processing warpcast frame request');
    }
  });

  // Add route for testing Neynar API
  app.get('/api/test-neynar', (req, res) => {
    try {
      console.log('Test Neynar request received with query:', JSON.stringify(req.query));
      // @ts-ignore - testNeynarHandler is expecting Express request/response
      return testNeynarHandler(req, res);
    } catch (error) {
      console.error('Error in test-neynar handler:', error);
      res.status(500).json({ error: 'Error testing Neynar API', message: error.message });
    }
  });
  
  // Add route for frame-action handler
  app.all('/api/frame-action', (req, res) => {
    try {
      console.log('Frame action request received:', req.method, JSON.stringify(req.body || {}));
      // @ts-ignore - frameActionHandler is expecting Express request/response
      return frameActionHandler(req, res);
    } catch (error) {
      console.error('Error in frame-action handler:', error);
      res.status(500).send('Error processing frame action request');
    }
  });
  
  // Add route for profile-handler
  app.all('/api/profile-handler', (req, res) => {
    try {
      console.log('Profile handler request received:', req.method, JSON.stringify(req.body || {}));
      // @ts-ignore - profileHandlerHandler is expecting Express request/response
      return profileHandlerHandler(req, res);
    } catch (error) {
      console.error('Error in profile-handler:', error);
      res.status(500).send('Error processing profile handler request');
    }
  });
  
  // Add route for external image frame handler
  app.all('/api/external-image-frame', (req, res) => {
    try {
      console.log('External image frame request received:', req.method, JSON.stringify(req.body || {}));
      // @ts-ignore - externalImageHandler is expecting Express request/response
      return externalImageHandler(req, res);
    } catch (error) {
      console.error('Error in external-image-frame handler:', error);
      res.status(500).send('Error processing external image frame request');
    }
  });
  
  // Add route for real-data frame handler
  app.all('/api/real-data-frame', async (req, res) => {
    try {
      console.log('Real data frame request received:', req.method, JSON.stringify(req.body || {}));
      // @ts-ignore - realDataFrameHandler is expecting Express request/response
      return await realDataFrameHandler(req, res);
    } catch (error) {
      console.error('Error in real-data-frame handler:', error);
      res.status(500).send('Error processing real data frame request');
    }
  });
  
  // Add route for absolute-minimal frame handler
  app.all('/api/absolute-minimal', (req, res) => {
    try {
      console.log('Absolute minimal frame request received:', req.method, JSON.stringify(req.body || {}));
      // @ts-ignore - absoluteMinimalHandler is expecting Express request/response
      return absoluteMinimalHandler(req, res);
    } catch (error) {
      console.error('Error in absolute-minimal handler:', error);
      res.status(500).send('Error processing absolute minimal frame request');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
