/**
 * Layout Strategy Registry
 *
 * Maps slide types to their layout strategies
 * This is the bridge between validation and rendering
 */

import type { LayoutTree } from "../types.js";

/**
 * Layout strategy function signature
 */
export type LayoutStrategy<TContent = any> = (content: TContent) => LayoutTree;

/**
 * Registry of layout strategies
 */
class LayoutRegistry {
  private strategies = new Map<string, LayoutStrategy>();

  /**
   * Register a layout strategy for a slide type
   */
  register(slideType: string, strategy: LayoutStrategy): void {
    this.strategies.set(slideType, strategy);
  }

  /**
   * Get layout strategy for a slide type
   */
  get(slideType: string): LayoutStrategy | undefined {
    return this.strategies.get(slideType);
  }

  /**
   * Check if a slide type has a registered strategy
   */
  has(slideType: string): boolean {
    return this.strategies.has(slideType);
  }

  /**
   * Get all registered slide types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.strategies.keys());
  }
}

/**
 * Global layout registry instance
 */
export const layoutRegistry = new LayoutRegistry();

/**
 * Decorator to register a layout strategy
 */
export function registerLayout(slideType: string) {
  return function (strategy: LayoutStrategy) {
    layoutRegistry.register(slideType, strategy);
    return strategy;
  };
}
