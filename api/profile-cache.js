/**
 * Profile Cache System
 * This module provides caching for Farcaster profile data to avoid excessive API calls
 */

// In-memory cache for profile data (will reset on server restart)
const profileCache = {};

// Map of FIDs to profile fallbacks for common users
const knownProfiles = {
  // 0xjudd - project creator
  '12915': {
    fid: 12915,
    username: "0xjudd.eth",
    displayName: "0xJudd.eth 🎩↑",
    pfp: { url: "https://i.imgur.com/yyBPo9n.jpg" }
  },
  // Top traders from demo data
  'thcradio': {
    username: "thcradio",
    displayName: "THC Radio",
    pfp: { url: "https://ipfs.decentralized-content.com/ipfs/bafkreiahxlwujgd3ukcv7v3udy6guhee7umxn7ekl42kvf27pssl6lczqe" }
  },
  'wakaflocka': {
    username: "wakaflocka",
    displayName: "Waka Flocka Eth",
    pfp: { url: "https://ipfs.decentralized-content.com/ipfs/bafkreie2bjvyu4qxhyk5x3lal7kjnwl2yugnkjrk3yby3g5lxu3y7t4m4m" }
  },
  'karima': {
    username: "karima",
    displayName: "karima.eth",
    pfp: { url: "https://ipfs.decentralized-content.com/ipfs/bafkreifs3vgybjkpgrkp5lngoen5unifyqac75ikrqtcleghhjj4ughvny" }
  }
};

// Cache expiration time (in milliseconds)
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get a profile from cache or fallback to known profiles
 * @param {number|string} fidOrUsername - The FID or username to look up
 * @returns {object|null} - The profile data or null if not found
 */
function getCachedProfile(fidOrUsername) {
  // Check if we have this profile in our cache
  if (profileCache[fidOrUsername]) {
    const cacheEntry = profileCache[fidOrUsername];
    
    // Check if the cache entry is still valid
    if (Date.now() - cacheEntry.timestamp < CACHE_TTL) {
      console.log(`Using cached profile for ${fidOrUsername}`);
      return cacheEntry.data;
    } else {
      console.log(`Cache expired for ${fidOrUsername}`);
      delete profileCache[fidOrUsername];
    }
  }
  
  // If not in cache, check if it's a known profile
  if (knownProfiles[fidOrUsername]) {
    console.log(`Using known profile for ${fidOrUsername}`);
    return knownProfiles[fidOrUsername];
  }
  
  // Not found in cache or known profiles
  return null;
}

/**
 * Store a profile in the cache
 * @param {number|string} fidOrUsername - The FID or username to cache
 * @param {object} profileData - The profile data to cache
 */
function cacheProfile(fidOrUsername, profileData) {
  if (!fidOrUsername || !profileData) {
    return;
  }
  
  // Store in cache with timestamp
  profileCache[fidOrUsername] = {
    timestamp: Date.now(),
    data: profileData
  };
  
  // Also cache by username and FID if available
  if (profileData.username && profileData.username !== fidOrUsername) {
    profileCache[profileData.username] = {
      timestamp: Date.now(),
      data: profileData
    };
  }
  
  if (profileData.fid && profileData.fid.toString() !== fidOrUsername.toString()) {
    profileCache[profileData.fid] = {
      timestamp: Date.now(),
      data: profileData
    };
  }
  
  console.log(`Cached profile for ${fidOrUsername}`);
}

/**
 * Get cache statistics
 * @returns {object} - Statistics about the cache
 */
function getCacheStats() {
  return {
    size: Object.keys(profileCache).length,
    entries: Object.keys(profileCache),
    knownProfiles: Object.keys(knownProfiles)
  };
}

module.exports = {
  getCachedProfile,
  cacheProfile,
  getCacheStats
};