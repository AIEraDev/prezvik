/**
 * Positioning Engine
 *
 * Converts relative layout trees into absolute coordinates.
 * Uses percentage-based coordinates (0-100) for renderer independence.
 *
 * CORE PRINCIPLE:
 * Every node gets explicit x/y coordinates stored in _rect property.
 * Renderers read _rect and convert to their native units (EMUs, pixels, etc.)
 */

import type { LayoutTree, LayoutNode, ContainerNode, TextNode, Rectangle, Spacing, FlowLayout, GridLayout } from "../types.js";

/**
 * Positioning Engine configuration options
 *
 * @example
 * ```typescript
 * const options: PositioningOptions = {
 *   slideWidth: 100,  // Percentage
 *   slideHeight: 100, // Percentage
 *   unit: "percentage"
 * };
 * ```
 */
export interface PositioningOptions {
  /**
   * Slide width in percentage units
   * @default 100
   */
  slideWidth?: number;

  /**
   * Slide height in percentage units
   * @default 100
   */
  slideHeight?: number;

  /**
   * Coordinate unit system
   * @default "percentage"
   */
  unit?: "percentage" | "pixels";
}

/**
 * Positioning Engine
 *
 * Computes absolute x/y coordinates for all layout nodes using a percentage-based
 * coordinate system (0-100). This approach ensures renderer independence - the same
 * positioned layout can be rendered to PPTX, PDF, Web, or other targets.
 *
 * **Coordinate System:**
 * - X/Y coordinates: 0-100 (percentage of slide dimensions)
 * - Width/Height: 0-100 (percentage of slide dimensions)
 * - Origin: Top-left corner (0, 0)
 * - Slide bounds: (0, 0) to (100, 100)
 *
 * **Layout Modes:**
 * - **Flow**: Sequential positioning (vertical or horizontal)
 * - **Grid**: Row/column grid positioning
 * - **Absolute**: Explicit coordinate positioning
 *
 * **Output:**
 * All nodes receive a `_rect` property with computed coordinates:
 * ```typescript
 * node._rect = { x: 10, y: 20, width: 80, height: 30 }
 * ```
 *
 * @example
 * ```typescript
 * const engine = new PositioningEngine();
 * const positionedTrees = engine.position(layoutTrees);
 *
 * // All nodes now have _rect property
 * positionedTrees[0].root._rect // { x: 0, y: 0, width: 100, height: 100 }
 * ```
 */
export class PositioningEngine {
  private options: Required<PositioningOptions>;

  constructor(options: PositioningOptions = {}) {
    this.options = {
      slideWidth: options.slideWidth ?? 100,
      slideHeight: options.slideHeight ?? 100,
      unit: options.unit ?? "percentage",
    };
  }

  /**
   * Position all layout trees
   *
   * Processes an array of layout trees and computes absolute coordinates for
   * all nodes in each tree. Each node receives a `_rect` property with its
   * computed position and dimensions.
   *
   * @param trees - Array of unpositioned layout trees
   * @returns Array of positioned layout trees with _rect on all nodes
   *
   * @example
   * ```typescript
   * const engine = new PositioningEngine();
   * const layoutTrees = layoutEngine.generateLayout(blueprint);
   * const positionedTrees = engine.position(layoutTrees);
   *
   * // Check that all nodes have coordinates
   * positionedTrees.forEach(tree => {
   *   console.log(tree.root._rect); // { x: 0, y: 0, width: 100, height: 100 }
   * });
   * ```
   */
  position(trees: LayoutTree[]): LayoutTree[] {
    return trees.map((tree) => this.positionTree(tree));
  }

  /**
   * Position a single layout tree
   */
  private positionTree(tree: LayoutTree): LayoutTree {
    const positioned = { ...tree };
    this.positionNode(positioned.root, {
      x: 0,
      y: 0,
      width: this.options.slideWidth,
      height: this.options.slideHeight,
    });
    return positioned;
  }

  /**
   * Position a node and its children
   */
  private positionNode(node: LayoutNode, bounds: Rectangle): void {
    // Apply padding to bounds
    const contentBounds = this.applyPadding(bounds, node.padding);

    // Position children based on layout mode
    if (node.type === "container") {
      const container = node as ContainerNode;
      if (container.layout) {
        switch (container.layout.type) {
          case "flow":
            this.positionFlowChildren(container, contentBounds);
            break;
          case "grid":
            this.positionGridChildren(container, contentBounds);
            break;
          case "absolute":
            this.positionAbsoluteChildren(container, contentBounds);
            break;
        }
      }
    }

    // Set node rectangle
    node._rect = bounds;
  }

  /**
   * Position children in flow layout
   *
   * Flow layout positions children sequentially with gap spacing:
   * - **Vertical flow**: Stack children top-to-bottom with vertical gaps
   * - **Horizontal flow**: Arrange children left-to-right with horizontal gaps
   *
   * Height is estimated for each child based on content and font size.
   *
   * @param node - Container node with flow layout
   * @param bounds - Available bounds for positioning children
   *
   * @example
   * ```typescript
   * // Vertical flow with 3 children
   * // Child 1: y=0, height=20
   * // Gap: 5
   * // Child 2: y=25, height=15
   * // Gap: 5
   * // Child 3: y=45, height=10
   * ```
   */
  private positionFlowChildren(node: ContainerNode, bounds: Rectangle): void {
    const layout = node.layout as FlowLayout;
    const gap = layout.gap || 0;

    if (layout.direction === "vertical") {
      let currentY = bounds.y;
      const childWidth = bounds.width;

      for (const child of node.children) {
        const childHeight = this.estimateHeight(child, childWidth);

        this.positionNode(child, {
          x: bounds.x,
          y: currentY,
          width: childWidth,
          height: childHeight,
        });

        currentY += childHeight + gap;
      }
    } else {
      // Horizontal flow
      let currentX = bounds.x;
      const childHeight = bounds.height;
      const childWidth = bounds.width / node.children.length;

      for (const child of node.children) {
        this.positionNode(child, {
          x: currentX,
          y: bounds.y,
          width: childWidth - gap,
          height: childHeight,
        });

        currentX += childWidth;
      }
    }
  }

  /**
   * Position children in grid layout
   *
   * Grid layout arranges children in rows and columns:
   * - Calculates cell dimensions based on column count
   * - Positions children in row-major order (left-to-right, top-to-bottom)
   * - Applies column and row gap spacing
   *
   * @param node - Container node with grid layout
   * @param bounds - Available bounds for positioning children
   *
   * @example
   * ```typescript
   * // 2x2 grid with 4 children
   * // Child 0: (0, 0)   Child 1: (50, 0)
   * // Child 2: (0, 50)  Child 3: (50, 50)
   * ```
   */
  private positionGridChildren(node: ContainerNode, bounds: Rectangle): void {
    const layout = node.layout as GridLayout;
    const columns = layout.columns;
    const columnGap = layout.columnGap || 0;
    const rowGap = layout.rowGap || 0;

    const cellWidth = (bounds.width - (columns - 1) * columnGap) / columns;
    const rows = Math.ceil(node.children.length / columns);
    const cellHeight = (bounds.height - (rows - 1) * rowGap) / rows;

    node.children.forEach((child, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      this.positionNode(child, {
        x: bounds.x + col * (cellWidth + columnGap),
        y: bounds.y + row * (cellHeight + rowGap),
        width: cellWidth,
        height: cellHeight,
      });
    });
  }

  /**
   * Position children with absolute positioning
   */
  private positionAbsoluteChildren(node: ContainerNode, bounds: Rectangle): void {
    // Children use explicit coordinates if provided
    for (const child of node.children) {
      const childRect = child._rect || {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      };

      this.positionNode(child, childRect);
    }
  }

  /**
   * Estimate height for a node
   *
   * Estimates the height required for a node based on its content:
   * - **Text nodes**: Calculates height based on font size, content length, and width
   * - **Container nodes**: Sums children heights plus gaps
   * - **Other nodes**: Returns default height (10% of slide)
   *
   * This is a heuristic estimation - actual rendered height may vary slightly.
   *
   * @param node - Node to estimate height for
   * @param width - Available width for the node
   * @returns Estimated height in percentage units
   *
   * @example
   * ```typescript
   * // Text node with 100 characters, fontSize=3, width=80
   * // charsPerLine = 80 / (3 * 0.6) = 44
   * // lines = 100 / 44 = 3
   * // height = 3 * (3 * 1.5) = 13.5
   * ```
   */
  private estimateHeight(node: LayoutNode, width: number): number {
    if (node.type === "text") {
      // Estimate based on font size and content length
      const textNode = node as TextNode;
      const fontSize = textNode.text.fontSize;
      const lineHeight = fontSize * 1.5;
      const charsPerLine = Math.floor(width / (fontSize * 0.6));
      const lines = Math.ceil(textNode.content.length / charsPerLine);
      return lines * lineHeight;
    }

    if (node.type === "container") {
      // Sum of children heights + gaps
      const container = node as ContainerNode;
      if (container.layout?.type === "flow") {
        const gap = (container.layout as FlowLayout).gap || 0;
        return container.children.reduce((sum, child) => {
          return sum + this.estimateHeight(child, width) + gap;
        }, 0);
      }
    }

    // Default height
    return 10; // 10% of slide height
  }

  /**
   * Apply padding to bounds
   */
  private applyPadding(bounds: Rectangle, padding?: Spacing): Rectangle {
    if (!padding) return bounds;

    return {
      x: bounds.x + padding.left,
      y: bounds.y + padding.top,
      width: bounds.width - padding.left - padding.right,
      height: bounds.height - padding.top - padding.bottom,
    };
  }
}

/**
 * Global instance
 */
let globalEngine: PositioningEngine | null = null;

/**
 * Get global positioning engine instance
 */
export function getPositioningEngine(): PositioningEngine {
  if (!globalEngine) {
    globalEngine = new PositioningEngine();
  }
  return globalEngine;
}
