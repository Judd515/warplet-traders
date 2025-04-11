// Enhanced storage interface with fallback for production
const { storage } = require('./storage');

// Memory-based backup storage for emergency use
class FallbackStorage {
  constructor() {
    this.traders = [
      {
        id: 1,
        username: "Server Error",
        walletAddress: "0x0000000000000000000000000000000000000000",
        topToken: "API",
        pnl24h: "Error",
        pnl7d: "Error",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    console.log('FallbackStorage initialized');
  }

  async getTraders() {
    console.log('Using fallback storage for getTraders');
    return this.traders;
  }

  async updateTraders(traders) {
    console.log('Using fallback storage for updateTraders (no-op)');
    return this.traders;
  }

  // User methods (stubs)
  async getUser() { return null; }
  async getUserByUsername() { return null; }
  async createUser() { 
    throw new Error('Operation not supported in fallback mode');
  }
}

// Setup wrapped storage with error handling
const wrappedStorage = new Proxy(storage, {
  get: function(target, prop) {
    const originalMethod = target[prop];
    
    // If it's not a function, just return it
    if (typeof originalMethod !== 'function') {
      return originalMethod;
    }
    
    // Return a wrapped function
    return async function(...args) {
      try {
        // Attempt to use the real storage
        return await originalMethod.apply(target, args);
      } catch (error) {
        console.error(`Error in storage method ${prop}:`, error);
        
        // If database operation fails, use fallback for read operations
        const fallback = new FallbackStorage();
        
        if (prop === 'getTraders') {
          return await fallback.getTraders();
        }
        
        // For other operations, rethrow the error
        throw error;
      }
    };
  }
});

module.exports = { storage: wrappedStorage };