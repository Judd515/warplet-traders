import { pgTable, text, serial, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Trader model to store trader information
export const traders = pgTable("traders", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  walletAddress: text("wallet_address").notNull(),
  topToken: text("top_token"),
  earnings24h: decimal("earnings_24h", { precision: 18, scale: 2 }),
  earnings7d: decimal("earnings_7d", { precision: 18, scale: 2 }),
  volume24h: decimal("volume_24h", { precision: 18, scale: 2 }),
  volume7d: decimal("volume_7d", { precision: 18, scale: 2 }),
});

export const insertTraderSchema = createInsertSchema(traders).omit({
  id: true,
});

export type InsertTrader = z.infer<typeof insertTraderSchema>;
export type Trader = typeof traders.$inferSelect;

// Users table (keeping this for compatibility with existing code)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
