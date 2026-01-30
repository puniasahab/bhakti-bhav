/**
 * API Cache Utility
 * Provides caching and request deduplication for API calls
 */

class APICache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  // Generate cache key from URL and params
  getCacheKey(url, params = {}) {
    return `${url}?${JSON.stringify(params)}`;
  }

  // Check if cache is valid
  isValid(entry) {
    if (!entry) return false;
    const now = Date.now();
    return now - entry.timestamp < entry.ttl;
  }

  // Get from cache
  get(key) {
    const entry = this.cache.get(key);
    if (this.isValid(entry)) {
      return entry.data;
    }
    this.cache.delete(key);
    return null;
  }

  // Set in cache
  set(key, data, ttl = 5 * 60 * 1000) { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Fetch with caching and request deduplication
  async fetch(url, options = {}, ttl = 5 * 60 * 1000) {
    const key = this.getCacheKey(url, options);

    // Return cached data if valid
    const cached = this.get(key);
    if (cached) {
      return cached;
    }

    // Deduplicate in-flight requests
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Make the request
    const requestPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            ...options.headers
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache successful response
        this.set(key, data, ttl);
        
        return data;
      } finally {
        this.pendingRequests.delete(key);
      }
    })();

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  // Clear all cache
  clear() {
    this.cache.clear();
  }

  // Clear specific key
  invalidate(key) {
    this.cache.delete(key);
  }

  // Clear by pattern
  invalidatePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new APICache();

// Convenience function for fetching with cache
export async function cachedFetch(url, options = {}, ttl = 5 * 60 * 1000) {
  return apiCache.fetch(url, options, ttl);
}

export default apiCache;
