// Enhanced storage interface for serverless environment
const { eq } = require('drizzle-orm');
const { db } = require('./db');
const { traders, users } = require('./schema');

class ServerlessStorage {
  constructor() {
    // Add timestamp when the storage is initialized
    this.initTime = new Date().toISOString();
    console.log(`ServerlessStorage initialized at ${this.initTime}`);
  }

  // Trader Methods
  async getTraders() {
    try {
      console.log('Fetching traders from database...');
      return await db.select().from(traders);
    } catch (error) {
      console.error('Error fetching traders:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  async updateTraders(tradersList) {
    try {
      console.log(`Updating ${tradersList.length} traders...`);
      
      // Delete existing traders to avoid duplicate issues in serverless env
      await db.delete(traders);
      
      // Insert all traders in a batch operation
      const result = await db.insert(traders).values(tradersList).returning();
      console.log(`Updated ${result.length} traders successfully`);
      return result;
    } catch (error) {
      console.error('Error updating traders:', error);
      throw error;
    }
  }

  // User Methods
  async getUser(id) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username) {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(user) {
    try {
      const [createdUser] = await db.insert(users).values(user).returning();
      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const storage = new ServerlessStorage();
module.exports = { storage };