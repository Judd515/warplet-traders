import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as fs from 'fs';
import * as path from 'path';

// Instead of importing directly, we'll load the handler at runtime 
// to avoid ESM/CommonJS compatibility issues

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve the main frame HTML directly for the root URL and frame path
  app.get("/", (req, res) => {
    res.sendFile("frame.html", { root: "./public" });
  });
  
  app.get("/frame", (req, res) => {
    res.sendFile("frame.html", { root: "./public" });
  });
  
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

  // Add route for the clean implementation
  app.all('/clean', async (req, res) => {
    try {
      console.log('Clean implementation request received:', req.method, req.body ? JSON.stringify(req.body) : '{}');
      
      // Import and use our handler from the API folder
      try {
        // Dynamic import to avoid ESM/CommonJS compatibility issues
        const handlerModule = await import('../api/index.js');
        if (handlerModule && handlerModule.default) {
          // Call the handler
          return handlerModule.default(req, res);
        } else {
          throw new Error('Clean handler module not properly exported');
        }
      } catch (moduleError) {
        console.error('Error importing or executing the clean handler module:', moduleError);
        
        // Fallback to basic frame if the module can't be loaded
        const baseUrl = req.protocol + '://' + req.get('host');
        
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/clean" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading handler module</h1>
</body>
</html>`);
      }
    } catch (error) {
      console.error('Error in clean handler:', error);
      res.status(500).send('Error processing clean frame request');
    }
  });
  
  // Add route for the clean image endpoint
  app.all('/clean/image', async (req, res) => {
    try {
      console.log('Clean image request received:', req.method, req.query);
      
      // Import and use our handler from the API folder
      try {
        // Dynamic import to avoid ESM/CommonJS compatibility issues
        const handlerModule = await import('../api/image.js');
        if (handlerModule && handlerModule.default) {
          // Call the handler
          return handlerModule.default(req, res);
        } else {
          throw new Error('Clean image handler module not properly exported');
        }
      } catch (moduleError) {
        console.error('Error importing or executing the clean image handler module:', moduleError);
        
        // Fallback to basic error SVG
        res.setHeader('Content-Type', 'image/svg+xml');
        return res.status(200).send(`
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#1e293b" />
  <text x="600" y="280" font-family="Verdana" font-size="40" fill="#ef4444" text-anchor="middle">Error loading data</text>
  <text x="600" y="340" font-family="Verdana" font-size="28" fill="#94a3b8" text-anchor="middle">Please try again later</text>
</svg>`);
      }
    } catch (error) {
      console.error('Error in clean image handler:', error);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(200).send(`
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#1e293b" />
  <text x="600" y="280" font-family="Verdana" font-size="40" fill="#ef4444" text-anchor="middle">Error processing image request</text>
  <text x="600" y="340" font-family="Verdana" font-size="28" fill="#94a3b8" text-anchor="middle">Please try again later</text>
</svg>`);
    }
  });

  // Add route for the working-with-redesign handler
  app.all('/api/working-with-redesign', async (req, res) => {
    try {
      console.log('Working with redesign frame request received:', req.method, req.body ? JSON.stringify(req.body) : '{}');
      
      // Import and use our handler from the API folder
      try {
        // Dynamic import to avoid ESM/CommonJS compatibility issues
        const handlerModule = await import('../api/working-with-redesign.js');
        if (handlerModule && handlerModule.default) {
          // Call the handler
          return await handlerModule.default(req, res);
        } else {
          throw new Error('Handler module not properly exported');
        }
      } catch (moduleError) {
        console.error('Error importing or executing the handler module:', moduleError);
        
        // Fallback to basic frame if the module can't be loaded
        const baseUrl = req.protocol + '://' + req.get('host');
        
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading handler module</h1>
</body>
</html>`);
      }
    } catch (error) {
      console.error('Error in working-with-redesign handler:', error);
      res.status(500).send('Error processing redesigned frame request');
    }
  });
  
  // Add route for the fast-frame handler (optimized for quick response)
  app.all('/api/fast-frame', async (req, res) => {
    try {
      console.log('Fast Frame request received:', req.method, req.body ? JSON.stringify(req.body) : '{}');
      
      // Import and use the fast-frame handler
      try {
        // Dynamic import to avoid ESM/CommonJS compatibility issues
        const handlerModule = await import('../api/fast-frame.js');
        if (handlerModule && handlerModule.default) {
          // Call the handler
          return handlerModule.default(req, res);
        } else {
          throw new Error('Fast frame handler module not properly exported');
        }
      } catch (moduleError) {
        console.error('Error importing or executing the fast-frame handler:', moduleError);
        
        // Fallback to basic frame if the module can't be loaded
        const baseUrl = req.protocol + '://' + req.get('host');
        
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/fast-frame" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading fast frame handler</h1>
</body>
</html>`);
      }
    } catch (error) {
      console.error('Error in fast-frame handler:', error);
      res.status(500).send('Error processing fast frame request');
    }
  });

  // Add route for the absolute-fix handler
  app.all('/api/absolute-fix', async (req, res) => {
    try {
      console.log('Absolute Fix request received:', req.method, req.body ? JSON.stringify(req.body) : '{}');
      
      // Import and use the absolute-fix handler
      try {
        // Dynamic import to avoid ESM/CommonJS compatibility issues
        const handlerModule = await import('../api/absolute-fix.js');
        if (handlerModule && handlerModule.default) {
          // Call the handler
          return handlerModule.default(req, res);
        } else {
          throw new Error('Absolute fix handler module not properly exported');
        }
      } catch (moduleError) {
        console.error('Error importing or executing the absolute-fix handler:', moduleError);
        
        // Fallback to basic frame if the module can't be loaded
        const baseUrl = req.protocol + '://' + req.get('host');
        
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/absolute-fix" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading absolute fix handler</h1>
</body>
</html>`);
      }
    } catch (error) {
      console.error('Error in absolute-fix handler:', error);
      res.status(500).send('Error processing absolute fix request');
    }
  });
  
  // Add route for the absolute-minimal handler
  app.all('/api/absolute-minimal', async (req, res) => {
    try {
      console.log('Absolute Minimal request received:', req.method, req.body ? JSON.stringify(req.body) : '{}');
      
      // Import and use the absolute-minimal handler
      try {
        // Dynamic import to avoid ESM/CommonJS compatibility issues
        const handlerModule = await import('../api/absolute-minimal.js');
        if (handlerModule && handlerModule.default) {
          // Call the handler
          return handlerModule.default(req, res);
        } else {
          throw new Error('Absolute minimal handler module not properly exported');
        }
      } catch (moduleError) {
        console.error('Error importing or executing the absolute-minimal handler:', moduleError);
        
        // Fallback to basic frame if the module can't be loaded
        const baseUrl = req.protocol + '://' + req.get('host');
        
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/absolute-minimal" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading absolute minimal handler</h1>
</body>
</html>`);
      }
    } catch (error) {
      console.error('Error in absolute-minimal handler:', error);
      res.status(500).send('Error processing absolute minimal request');
    }
  });

  // Add route for the image endpoint
  app.all('/api/image-endpoint', async (req, res) => {
    try {
      console.log('Image endpoint request received:', req.method, req.query);
      
      // Import and use the image-endpoint handler
      try {
        // Dynamic import to avoid ESM/CommonJS compatibility issues
        const handlerModule = await import('../api/image-endpoint.js');
        if (handlerModule && handlerModule.default) {
          // Call the handler
          return handlerModule.default(req, res);
        } else {
          throw new Error('Image endpoint handler module not properly exported');
        }
      } catch (moduleError) {
        console.error('Error importing or executing the image-endpoint handler:', moduleError);
        
        // Fallback to basic error SVG
        res.setHeader('Content-Type', 'image/svg+xml');
        return res.status(200).send(`
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#1e293b" />
  <text x="600" y="280" font-family="Verdana" font-size="40" fill="#ef4444" text-anchor="middle">Error loading data</text>
  <text x="600" y="340" font-family="Verdana" font-size="28" fill="#94a3b8" text-anchor="middle">Please try again later</text>
</svg>`);
      }
    } catch (error) {
      console.error('Error in image-endpoint handler:', error);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(200).send(`
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#1e293b" />
  <text x="600" y="280" font-family="Verdana" font-size="40" fill="#ef4444" text-anchor="middle">Error processing image request</text>
  <text x="600" y="340" font-family="Verdana" font-size="28" fill="#94a3b8" text-anchor="middle">Please try again later</text>
</svg>`);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}