// Enhanced database connection for serverless environment
const { neonConfig, Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');
const schema = require('./schema');

// Required for Neon serverless driver
neonConfig.webSocketConstructor = ws;

// Create a connection pool with appropriate settings for serverless
let pool;
let db;

// Function to initialize the database connection
function initDb() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set. Database operations will fail.');
      // Return a mock DB that will throw meaningful errors when used
      return {
        pool: null,
        db: new Proxy({}, {
          get: () => () => {
            throw new Error('Database not initialized: DATABASE_URL is not set');
          }
        })
      };
    }

    // Configure the connection pool with serverless-appropriate settings
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1, // Limit connections for serverless environment
      idleTimeoutMillis: 120000, // Close idle connections after 2 minutes
      connectionTimeoutMillis: 5000, // Timeout after 5 seconds
    });

    // Add error handler to the pool
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
      // In serverless, we don't need to terminate - just log the error
    });

    // Initialize Drizzle ORM with the connection
    db = drizzle(pool, { schema });

    return { pool, db };
  } catch (error) {
    console.error('Error initializing database:', error);
    // Return a non-functional database that will throw clear errors
    return {
      pool: null,
      db: new Proxy({}, {
        get: () => () => {
          throw new Error(`Database initialization failed: ${error.message}`);
        }
      })
    };
  }
}

// Initialize the database connection
const { pool: initializedPool, db: initializedDb } = initDb();

// Export the database connection
module.exports = {
  pool: initializedPool,
  db: initializedDb,
  
  // Add a health check function
  async checkHealth() {
    if (!initializedPool) return { healthy: false, error: 'Pool not initialized' };
    
    try {
      const client = await initializedPool.connect();
      try {
        await client.query('SELECT 1');
        return { healthy: true };
      } finally {
        client.release();
      }
    } catch (error) {
      return { 
        healthy: false, 
        error: error.message,
        stack: error.stack
      };
    }
  }
};

// Fix incorrect reference
module.exports.db.checkHealth = module.exports.checkHealth;