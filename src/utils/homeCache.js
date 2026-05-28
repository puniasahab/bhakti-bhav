/**
 * Home Screen Cache Utility
 * Caches Home screen API data for 30 minutes so navigating back
 * from other screens is instant — no loader, no refetch.
 */

const HOME_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const homeCache = {
  _store: {},

  get(key) {
    const entry = this._store[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > HOME_CACHE_TTL) {
      delete this._store[key];
      return null;
    }
    return entry.data;
  },

  set(key, data) {
    this._store[key] = { data, timestamp: Date.now() };
  },

  clear() {
    this._store = {};
  },

  has(key) {
    return this.get(key) !== null;
  },

  delete(key) {
    delete this._store[key];
  },
};

export default homeCache;
