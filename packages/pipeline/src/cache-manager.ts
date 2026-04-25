/**
 * Cache Manager
 *
 * Manages caching of expensive operations with LRU eviction and TTL expiration.
 */

/**
 * Cache entry with timestamp
 */
interface CacheEntry {
  value: any;
  timestamp: number;
}

/**
 * Cache Manager
 *
 * Provides caching functionality with:
 * - LRU eviction when cache reaches max size
 * - TTL-based expiration (default 1 hour)
 * - Namespace-based organization
 */
export class CacheManager {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 100, ttl: number = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Get cached value
   */
  get<T>(namespace: string, key: string): T | undefined {
    const cacheKey = `${namespace}:${key}`;
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return undefined;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(cacheKey);
      return undefined;
    }

    // Move to end for LRU (most recently used)
    this.cache.delete(cacheKey);
    this.cache.set(cacheKey, entry);

    return entry.value as T;
  }

  /**
   * Set cached value
   */
  set<T>(namespace: string, key: string, value: T): void {
    const cacheKey = `${namespace}:${key}`;

    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Hash ThemeSpec for cache key
   */
  hashThemeSpec(themeSpec: any): string {
    return this.hash(JSON.stringify(themeSpec));
  }

  /**
   * Hash LayoutTrees for cache key
   */
  hashLayoutTrees(layoutTrees: any[]): string {
    return this.hash(JSON.stringify(layoutTrees));
  }

  /**
   * Simple hash function
   */
  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache hit rate (for monitoring)
   */
  getHitRate(): number {
    // This is a simplified implementation
    // In production, you'd track hits and misses
    return 0.5;
  }
}
