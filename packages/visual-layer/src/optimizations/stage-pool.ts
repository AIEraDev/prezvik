/**
 * Konva Stage Pool
 *
 * Reuses Konva stages across slides to avoid the overhead of
 * creating and destroying stages for each slide.
 */

import Konva from "konva";

/**
 * Stage pool entry
 */
interface StagePoolEntry {
  stage: Konva.Stage;
  inUse: boolean;
  lastUsed: number;
}

/**
 * StagePool class
 *
 * Manages a pool of Konva stages for reuse.
 */
export class StagePool {
  private pool: StagePoolEntry[];
  private maxSize: number;
  private defaultWidth: number;
  private defaultHeight: number;

  constructor(maxSize: number = 5, defaultWidth: number = 960, defaultHeight: number = 540) {
    this.pool = [];
    this.maxSize = maxSize;
    this.defaultWidth = defaultWidth;
    this.defaultHeight = defaultHeight;
  }

  /**
   * Acquire a stage from the pool
   */
  acquire(width: number = this.defaultWidth, height: number = this.defaultHeight): Konva.Stage {
    // Try to find an available stage with matching dimensions
    for (const entry of this.pool) {
      if (!entry.inUse && entry.stage.width() === width && entry.stage.height() === height) {
        entry.inUse = true;
        entry.lastUsed = Date.now();

        // Clear the stage
        entry.stage.destroyChildren();

        return entry.stage;
      }
    }

    // Try to find any available stage and resize it
    for (const entry of this.pool) {
      if (!entry.inUse) {
        entry.inUse = true;
        entry.lastUsed = Date.now();

        // Resize and clear the stage
        entry.stage.width(width);
        entry.stage.height(height);
        entry.stage.destroyChildren();

        return entry.stage;
      }
    }

    // Create a new stage if pool is not full
    if (this.pool.length < this.maxSize) {
      const stage = new Konva.Stage({
        container: this.createContainer(),
        width,
        height,
      });

      const entry: StagePoolEntry = {
        stage,
        inUse: true,
        lastUsed: Date.now(),
      };

      this.pool.push(entry);
      return stage;
    }

    // Pool is full, evict the least recently used stage
    const lruEntry = this.pool.reduce((oldest, current) => {
      return current.lastUsed < oldest.lastUsed ? current : oldest;
    });

    // Destroy the old stage and create a new one
    lruEntry.stage.destroy();
    lruEntry.stage = new Konva.Stage({
      container: this.createContainer(),
      width,
      height,
    });
    lruEntry.inUse = true;
    lruEntry.lastUsed = Date.now();

    return lruEntry.stage;
  }

  /**
   * Release a stage back to the pool
   */
  release(stage: Konva.Stage): void {
    const entry = this.pool.find((e) => e.stage === stage);
    if (entry) {
      entry.inUse = false;
      entry.lastUsed = Date.now();

      // Clear the stage but don't destroy it
      stage.destroyChildren();
    }
  }

  /**
   * Create a container element for a stage
   */
  private createContainer(): HTMLDivElement {
    // In Node.js environment, we need to use a mock container
    // In browser environment, this would create a real DOM element
    if (typeof document !== "undefined") {
      const container = document.createElement("div");
      container.style.display = "none";
      document.body.appendChild(container);
      return container;
    } else {
      // Mock container for Node.js
      return {
        style: {},
        appendChild: () => {},
      } as any;
    }
  }

  /**
   * Clear the pool and destroy all stages
   */
  clear(): void {
    for (const entry of this.pool) {
      entry.stage.destroy();
    }
    this.pool = [];
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    totalStages: number;
    inUse: number;
    available: number;
    maxSize: number;
  } {
    const inUse = this.pool.filter((e) => e.inUse).length;

    return {
      totalStages: this.pool.length,
      inUse,
      available: this.pool.length - inUse,
      maxSize: this.maxSize,
    };
  }
}

/**
 * Global stage pool instance
 */
let globalStagePool: StagePool | null = null;

/**
 * Get the global stage pool instance
 */
export function getGlobalStagePool(): StagePool {
  if (!globalStagePool) {
    globalStagePool = new StagePool();
  }
  return globalStagePool;
}

/**
 * Reset the global stage pool
 */
export function resetGlobalStagePool(): void {
  if (globalStagePool) {
    globalStagePool.clear();
    globalStagePool = null;
  }
}
