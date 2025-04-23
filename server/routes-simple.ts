import { Express } from 'express';
import { createServer, Server } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import minimalRealHandler from './api/minimal-real.js';

export async function registerRoutes(app: Express): Promise<Server> {
  // Add route for minimal-real frame handler
  app.all('/api/minimal-real', (req, res) => {
    try {
      console.log('Minimal real frame request received:', req.method, req.body ? JSON.stringify(req.body).substring(0, 100) : '');
      return minimalRealHandler(req, res);
    } catch (error) {
      console.error('Error in minimal-real handler:', error);
      res.status(500).send('Error processing minimal-real frame request');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}