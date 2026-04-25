/**
 * Spatial Index for Collision Detection
 *
 * Provides efficient collision detection using a grid-based spatial index.
 * This reduces collision checks from O(n²) to approximately O(n) for most cases.
 */

import type { Rect } from "../models/visual-context.js";

/**
 * Grid cell containing rectangles
 */
interface GridCell {
  rects: Rect[];
}

/**
 * SpatialIndex class
 *
 * Implements a grid-based spatial index for fast collision detection.
 */
export class SpatialIndex {
  private grid: Map<string, GridCell>;
  private cellSize: number;

  constructor(_bounds: Rect, cellSize: number = 100) {
    this.grid = new Map();
    this.cellSize = cellSize;
  }

  /**
   * Insert a rectangle into the spatial index
   */
  insert(rect: Rect): void {
    const cells = this.getCellsForRect(rect);

    for (const cellKey of cells) {
      let cell = this.grid.get(cellKey);
      if (!cell) {
        cell = { rects: [] };
        this.grid.set(cellKey, cell);
      }
      cell.rects.push(rect);
    }
  }

  /**
   * Query for rectangles that might collide with the given rectangle
   */
  query(rect: Rect): Rect[] {
    const cells = this.getCellsForRect(rect);
    const candidates = new Set<Rect>();

    for (const cellKey of cells) {
      const cell = this.grid.get(cellKey);
      if (cell) {
        for (const candidate of cell.rects) {
          candidates.add(candidate);
        }
      }
    }

    // Filter to actual collisions
    return Array.from(candidates).filter((candidate) => this.intersects(rect, candidate));
  }

  /**
   * Check if a rectangle collides with any existing rectangles
   */
  hasCollision(rect: Rect): boolean {
    const candidates = this.query(rect);
    return candidates.length > 0;
  }

  /**
   * Get all grid cells that a rectangle overlaps
   */
  private getCellsForRect(rect: Rect): string[] {
    const minX = Math.floor(rect.x / this.cellSize);
    const minY = Math.floor(rect.y / this.cellSize);
    const maxX = Math.floor((rect.x + rect.width) / this.cellSize);
    const maxY = Math.floor((rect.y + rect.height) / this.cellSize);

    const cells: string[] = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        cells.push(`${x},${y}`);
      }
    }

    return cells;
  }

  /**
   * Check if two rectangles intersect
   */
  private intersects(a: Rect, b: Rect): boolean {
    return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y);
  }

  /**
   * Clear the spatial index
   */
  clear(): void {
    this.grid.clear();
  }

  /**
   * Get statistics about the spatial index
   */
  getStats(): {
    cellCount: number;
    totalRects: number;
    avgRectsPerCell: number;
  } {
    let totalRects = 0;
    for (const cell of this.grid.values()) {
      totalRects += cell.rects.length;
    }

    return {
      cellCount: this.grid.size,
      totalRects,
      avgRectsPerCell: this.grid.size > 0 ? totalRects / this.grid.size : 0,
    };
  }
}

/**
 * Helper function to create a spatial index from content bounds
 */
export function createSpatialIndexFromBounds(contentBounds: Rect[], slideBounds: Rect = { x: 0, y: 0, width: 960, height: 540 }): SpatialIndex {
  const index = new SpatialIndex(slideBounds);

  for (const bounds of contentBounds) {
    index.insert(bounds);
  }

  return index;
}
