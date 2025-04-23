import { Express } from 'express';
import { createServer, Server } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { storage } from './storage';

// Import handlers - using dynamic imports for ESM compatibility
// @ts-ignore - ignore type errors for these imports
import oneFileFrameHandler from '../api/one-file-frame.js';
import oneFileFrameRealDataHandler from '../api/one-file-frame-real-data.js';

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
  
  // Add route for one-file-frame handler
  app.all('/api/one-file-frame', (req, res) => {
    try {
      console.log('One-file frame request received:', req.method, JSON.stringify(req.body || {}));
      return oneFileFrameHandler(req, res);
    } catch (error) {
      console.error('Error in one-file-frame handler:', error);
      res.status(500).send('Error processing one-file frame request');
    }
  });
  
  // Add route for one-file-frame-real-data handler
  app.all('/api/one-file-frame-real-data', (req, res) => {
    try {
      console.log('One-file-real-data frame request received:', req.method, JSON.stringify(req.body || {}));
      return oneFileFrameRealDataHandler(req, res);
    } catch (error) {
      console.error('Error in one-file-frame-real-data handler:', error);
      res.status(500).send('Error processing one-file-real-data frame request');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}