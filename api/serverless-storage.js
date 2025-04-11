// Serverless-compatible storage for Vercel deployment
class ServerlessStorage {
  constructor() {
    // In serverless functions, memory isn't preserved between invocations
    // This class exists just to provide the same interface as the memory storage
    this.tradersData = [];
  }

  async getTraders() {
    // Since we can't persist data between serverless invocations,
    // if the storage is empty, we'll return a placeholder to indicate
    // the user should refresh the data
    if (this.tradersData.length === 0) {
      return [{
        id: 1,
        username: "Click Refresh",
        walletAddress: "0x0000000000000000000000000000000000000000",
        topToken: "DATA",
        pnl24h: "0",
        pnl7d: null
      }];
    }
    return this.tradersData;
  }

  async updateTraders(tradersList) {
    // Store the new traders with IDs
    this.tradersData = tradersList.map((trader, index) => ({
      ...trader,
      id: index + 1
    }));
    return this.tradersData;
  }

  // User methods (stub implementations for compatibility)
  async getUser() {
    return undefined;
  }

  async getUserByUsername() {
    return undefined;
  }

  async createUser(user) {
    return { ...user, id: 1 };
  }
}

// Export singleton instance
module.exports = {
  storage: new ServerlessStorage()
};