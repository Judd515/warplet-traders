// Database storage implementation for Vercel serverless functions
const { db } = require('./db');
const { traders, users } = require('./schema');
const { eq } = require('drizzle-orm');

// Serverless storage class
class ServerlessStorage {
  // Trader methods
  async getTraders() {
    if (!db) {
      // Return placeholder data if DB is not connected
      return [{
        id: 1,
        username: "Refresh Data",
        walletAddress: "0x0000000000000000000000000000000000000000",
        topToken: "CLICK",
        pnl24h: "0",
        pnl7d: null
      }];
    }

    try {
      return await db.select().from(traders);
    } catch (error) {
      console.error('Error getting traders from database:', error);
      // Return empty array in case of error
      return [];
    }
  }

  async updateTraders(tradersList) {
    if (!db) {
      console.error('Cannot update traders - database not connected');
      return tradersList;
    }

    try {
      // Delete all existing traders
      await db.delete(traders);
      
      // Insert new traders if we have any
      if (tradersList.length > 0) {
        // Add IDs to any traders without them
        const tradersWithIds = tradersList.map((trader, index) => ({
          ...trader,
          id: trader.id || index + 1
        }));
        
        const result = await db.insert(traders).values(tradersWithIds).returning();
        return result;
      }
      
      return [];
    } catch (error) {
      console.error('Error updating traders in database:', error);
      // Return original list in case of error
      return tradersList;
    }
  }

  // User methods (stub implementations for compatibility)
  async getUser(id) {
    if (!db) return undefined;
    
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error('Error getting user from database:', error);
      return undefined;
    }
  }

  async getUserByUsername(username) {
    if (!db) return undefined;
    
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error('Error getting user by username from database:', error);
      return undefined;
    }
  }

  async createUser(user) {
    if (!db) return { ...user, id: 1 };
    
    try {
      const result = await db.insert(users).values(user).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user in database:', error);
      return { ...user, id: 1 };
    }
  }
}

module.exports = {
  storage: new ServerlessStorage()
};