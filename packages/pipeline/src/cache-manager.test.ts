/**
 * Cache Manager Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CacheManager } from "./cache-manager.js";

describe("CacheManager", () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager(3, 1000); // maxSize=3, ttl=1000ms
  });

  describe("get and set", () => {
    it("should store and retrieve values", () => {
      cacheManager.set("test", "key1", "value1");
      const result = cacheManager.get<string>("test", "key1");
      expect(result).toBe("value1");
    });

    it("should return undefined for non-existent keys", () => {
      const result = cacheManager.get<string>("test", "nonexistent");
      expect(result).toBeUndefined();
    });

    it("should support different namespaces", () => {
      cacheManager.set("namespace1", "key1", "value1");
      cacheManager.set("namespace2", "key1", "value2");

      expect(cacheManager.get<string>("namespace1", "key1")).toBe("value1");
      expect(cacheManager.get<string>("namespace2", "key1")).toBe("value2");
    });

    it("should support different types", () => {
      const cache = new CacheManager(10, 1000); // Larger cache for this test
      cache.set("test", "string", "hello");
      cache.set("test", "number", 42);
      cache.set("test", "object", { foo: "bar" });
      cache.set("test", "array", [1, 2, 3]);

      expect(cache.get<string>("test", "string")).toBe("hello");
      expect(cache.get<number>("test", "number")).toBe(42);
      expect(cache.get<{ foo: string }>("test", "object")).toEqual({ foo: "bar" });
      expect(cache.get<number[]>("test", "array")).toEqual([1, 2, 3]);
    });
  });

  describe("LRU eviction", () => {
    it("should evict least recently used entry when cache is full", () => {
      // Fill cache to max size
      cacheManager.set("test", "key1", "value1");
      cacheManager.set("test", "key2", "value2");
      cacheManager.set("test", "key3", "value3");

      // Add one more - should evict key1 (oldest)
      cacheManager.set("test", "key4", "value4");

      expect(cacheManager.get<string>("test", "key1")).toBeUndefined();
      expect(cacheManager.get<string>("test", "key2")).toBe("value2");
      expect(cacheManager.get<string>("test", "key3")).toBe("value3");
      expect(cacheManager.get<string>("test", "key4")).toBe("value4");
    });

    it("should update LRU order on access", () => {
      // Fill cache
      cacheManager.set("test", "key1", "value1");
      cacheManager.set("test", "key2", "value2");
      cacheManager.set("test", "key3", "value3");

      // Access key1 to make it most recently used
      cacheManager.get("test", "key1");

      // Add new entry - should evict key2 (now least recently used)
      cacheManager.set("test", "key4", "value4");

      expect(cacheManager.get<string>("test", "key1")).toBe("value1");
      expect(cacheManager.get<string>("test", "key2")).toBeUndefined();
      expect(cacheManager.get<string>("test", "key3")).toBe("value3");
      expect(cacheManager.get<string>("test", "key4")).toBe("value4");
    });
  });

  describe("TTL expiration", () => {
    it("should expire entries after TTL", async () => {
      vi.useFakeTimers();

      cacheManager.set("test", "key1", "value1");

      // Should be available immediately
      expect(cacheManager.get<string>("test", "key1")).toBe("value1");

      // Advance time by 500ms (half TTL)
      vi.advanceTimersByTime(500);
      expect(cacheManager.get<string>("test", "key1")).toBe("value1");

      // Advance time by another 600ms (total 1100ms, past TTL)
      vi.advanceTimersByTime(600);
      expect(cacheManager.get<string>("test", "key1")).toBeUndefined();

      vi.useRealTimers();
    });

    it("should use default TTL of 1 hour", () => {
      const defaultCache = new CacheManager();
      vi.useFakeTimers();

      defaultCache.set("test", "key1", "value1");

      // Should be available after 30 minutes
      vi.advanceTimersByTime(30 * 60 * 1000);
      expect(defaultCache.get<string>("test", "key1")).toBe("value1");

      // Should expire after 1 hour + 1ms
      vi.advanceTimersByTime(30 * 60 * 1000 + 1);
      expect(defaultCache.get<string>("test", "key1")).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe("hashThemeSpec", () => {
    it("should generate consistent hashes for same input", () => {
      const themeSpec = {
        palette: { primary: "#ff0000" },
        tone: "executive",
      };

      const hash1 = cacheManager.hashThemeSpec(themeSpec);
      const hash2 = cacheManager.hashThemeSpec(themeSpec);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different inputs", () => {
      const themeSpec1 = {
        palette: { primary: "#ff0000" },
        tone: "executive",
      };

      const themeSpec2 = {
        palette: { primary: "#00ff00" },
        tone: "minimal",
      };

      const hash1 = cacheManager.hashThemeSpec(themeSpec1);
      const hash2 = cacheManager.hashThemeSpec(themeSpec2);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle complex nested objects", () => {
      const themeSpec = {
        palette: {
          primary: "#ff0000",
          secondary: "#00ff00",
          accent: "#0000ff",
        },
        typography: {
          displayFont: "Arial",
          bodyFont: "Helvetica",
        },
        slideRhythm: [
          { slideId: "1", backgroundMode: "dark" },
          { slideId: "2", backgroundMode: "light" },
        ],
        tone: "executive",
      };

      const hash = cacheManager.hashThemeSpec(themeSpec);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });
  });

  describe("hashLayoutTrees", () => {
    it("should generate consistent hashes for same input", () => {
      const layoutTrees = [
        {
          root: { type: "slide", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "1", slideType: "hero" },
        },
      ];

      const hash1 = cacheManager.hashLayoutTrees(layoutTrees);
      const hash2 = cacheManager.hashLayoutTrees(layoutTrees);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different inputs", () => {
      const layoutTrees1 = [
        {
          root: { type: "slide", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "1", slideType: "hero" },
        },
      ];

      const layoutTrees2 = [
        {
          root: { type: "slide", _rect: { x: 0, y: 0, width: 200, height: 200 } },
          metadata: { slideId: "2", slideType: "content" },
        },
      ];

      const hash1 = cacheManager.hashLayoutTrees(layoutTrees1);
      const hash2 = cacheManager.hashLayoutTrees(layoutTrees2);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle multiple layout trees", () => {
      const layoutTrees = [
        {
          root: { type: "slide", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "1", slideType: "hero" },
        },
        {
          root: { type: "slide", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "2", slideType: "content" },
        },
      ];

      const hash = cacheManager.hashLayoutTrees(layoutTrees);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });
  });

  describe("clear", () => {
    it("should clear all cached entries", () => {
      cacheManager.set("test", "key1", "value1");
      cacheManager.set("test", "key2", "value2");
      cacheManager.set("test", "key3", "value3");

      cacheManager.clear();

      expect(cacheManager.get<string>("test", "key1")).toBeUndefined();
      expect(cacheManager.get<string>("test", "key2")).toBeUndefined();
      expect(cacheManager.get<string>("test", "key3")).toBeUndefined();
    });
  });
});
