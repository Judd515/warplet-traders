// Schema definitions for serverless environment
const { pgTable, serial, text, timestamp } = require('drizzle-orm/pg-core');

// Traders table schema
const traders = pgTable('traders', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  walletAddress: text('wallet_address').notNull(),
  topToken: text('top_token'),
  pnl24h: text('pnl_24h'),
  pnl7d: text('pnl_7d'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Users table schema
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Export all schemas
module.exports = {
  traders,
  users
};