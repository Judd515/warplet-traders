// Simplified schema for Vercel serverless functions
const { pgTable, serial, text, varchar } = require('drizzle-orm/pg-core');

// Define the traders table
const traders = pgTable('traders', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  topToken: varchar('top_token', { length: 50 }),
  pnl24h: text('pnl_24h'),
  pnl7d: text('pnl_7d')
});

// Define the users table (for compatibility)
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull()
});

module.exports = { traders, users };