import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as fs from 'fs';
import * as path from 'path';

// Instead of importing directly, we'll load the handler at runtime 
// to avoid ESM/CommonJS compatibility issues

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

  // Add route for the working-with-redesign handler
  app.all('/api/working-with-redesign', (req, res) => {
    try {
      console.log('Working with redesign frame request received:', req.method, req.body ? JSON.stringify(req.body) : '{}');
      
      // Implement the frame handler inline to avoid import issues
      
      // Set appropriate headers
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      // Base URL for the app
      const baseUrl = 'https://warplet-traders.vercel.app';
      
      try {
        // Default view is main
        let view = 'main';
        
        // Handle button clicks
        if (req.method === 'POST' && req.body?.untrustedData) {
          const { buttonIndex } = req.body.untrustedData;
          
          // "Check Me" button
          if (buttonIndex === 1) {
            view = 'user';
          } 
          // "Main View" button
          else if (buttonIndex === 2) {
            view = 'main';
          }
          // "Share" button
          else if (buttonIndex === 3) {
            // Redirect to share URL
            const shareText = encodeURIComponent(
              `Check out the top Warplet traders on BASE!\n\nhttps://warplet-traders.vercel.app/api/working-with-redesign`
            );
            return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
          }
          // "Tip" button
          else if (buttonIndex === 4) {
            return res.redirect(302, 'https://warpcast.com/0xjudd');
          }
        }
        
        // Helper function to generate main frame
        function generateMainFrame() {
          return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/global.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Check Me" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
  <meta property="fc:frame:button:4" content="Tip" />
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>`;
        }
        
        // Helper function to generate user-specific frame
        function generateUserFrame() {
          return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/user.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Check Me" />
  <meta property="fc:frame:button:2" content="Main View" />
  <meta property="fc:frame:button:3" content="Share" />
  <meta property="fc:frame:button:4" content="Tip" />
</head>
<body>
  <h1>My Top Traders</h1>
</body>
</html>`;
        }
        
        // Helper function to generate error frame
        function generateErrorFrame() {
          return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
        }
        
        // Return the appropriate frame
        if (view === 'user') {
          return res.status(200).send(generateUserFrame());
        } else {
          return res.status(200).send(generateMainFrame());
        }
      } catch (innerError) {
        console.error('Inner error:', innerError);
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`);
      }
    } catch (error) {
      console.error('Error in working-with-redesign handler:', error);
      res.status(500).send('Error processing redesigned frame request');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}