// Serverless database connection for Vercel
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');

// Configure Neon serverless to use WebSockets
neonConfig.webSocketConstructor = ws;

// Check if database URL is available
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
}

// Create a connection pool and Drizzle instance
const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

// This will be our database instance in serverless functions
const db = pool ? drizzle(pool) : null;

module.exports = { db, pool };