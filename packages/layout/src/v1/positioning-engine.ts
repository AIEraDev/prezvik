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
 * Layout overflow error - thrown when content exceeds available bounds
 */
export class LayoutOverflowError extends Error {
  constructor(
    message: string,
    public nodeId: string,
    public bounds: Rectangle,
    public overflowedBy: number,
  ) {
    super(message);
    this.name = "LayoutOverflowError";
  }
}

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

  /**
   * Overflow handling strategy
   * - "error": Throw LayoutOverflowError (default, strict mode)
   * - "truncate": Truncate overflowing content with ellipsis
   * - "scale": Scale down font sizes to fit
   * - "overflow": Allow overflow (clip in renderer)
   * @default "error"
   */
  overflowStrategy?: "error" | "truncate" | "scale" | "overflow";

  /**
   * Minimum font size when using "scale" overflow strategy
   * @default 8
   */
  minFontSize?: number;

  /**
   * Whether to log overflow warnings instead of throwing
   * @default false
   */
  warnOnOverflow?: boolean;
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
      overflowStrategy: options.overflowStrategy ?? "error",
      minFontSize: options.minFontSize ?? 8,
      warnOnOverflow: options.warnOnOverflow ?? false,
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
   * Track visited nodes during positioning to detect cycles
   */
  private positioningStack = new Set<string>();

  /**
   * Position a single layout tree
   */
  private positionTree(tree: LayoutTree): LayoutTree {
    const positioned = { ...tree };
    // Reset cycle detection stack for each tree
    this.positioningStack.clear();
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
    // Cycle detection - check if node is already being positioned
    if (this.positioningStack.has(node.id)) {
      throw new LayoutOverflowError(`Circular reference detected: node "${node.id}" references itself as an ancestor`, node.id, bounds, 0);
    }

    // Mark node as being positioned
    this.positioningStack.add(node.id);

    try {
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
    } finally {
      // Remove from stack when done (even if error occurred)
      this.positioningStack.delete(node.id);
    }
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
      const maxY = bounds.y + bounds.height;
      let hasOverflowed = false;

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const childHeight = this.estimateHeight(child, childWidth);

        // Check for overflow before positioning
        if (currentY + childHeight > maxY + 0.01 && !hasOverflowed) {
          const overflowedBy = currentY + childHeight - maxY;
          const handled = this.handleOverflow(node, child, bounds, overflowedBy, currentY, maxY, i);
          if (!handled) {
            hasOverflowed = true;
            // Continue positioning remaining children but clamp to bounds
          }
        }

        const availableHeight = Math.max(0, maxY - currentY);
        const actualHeight = hasOverflowed ? 0 : Math.min(childHeight, availableHeight);

        if (actualHeight > 0 || !hasOverflowed) {
          this.positionNode(child, {
            x: bounds.x,
            y: currentY,
            width: childWidth,
            height: actualHeight,
          });
        }

        currentY += actualHeight + gap;
      }
    } else {
      // Horizontal flow
      let currentX = bounds.x;
      const childHeight = bounds.height;
      const childWidth = bounds.width / node.children.length;
      const maxX = bounds.x + bounds.width;

      for (const child of node.children) {
        // Check for overflow
        if (currentX + childWidth > maxX + 0.01) {
          const overflowedBy = currentX + childWidth - maxX;
          if (this.options.overflowStrategy === "error") {
            throw new LayoutOverflowError(`Horizontal content overflow in node "${node.id}": child "${child.id}" extends beyond bounds by ${overflowedBy.toFixed(2)}%`, node.id, bounds, overflowedBy);
          } else if (this.options.warnOnOverflow) {
            console.warn(`[positioning-engine] Horizontal overflow in "${node.id}" by ${overflowedBy.toFixed(2)}%`);
          }
        }

        this.positionNode(child, {
          x: currentX,
          y: bounds.y,
          width: Math.min(childWidth - gap, maxX - currentX),
          height: childHeight,
        });

        currentX += childWidth;
      }
    }
  }

  /**
   * Handle overflow based on configured strategy
   * Returns true if overflow was handled gracefully, false if content should be skipped
   */
  private handleOverflow(node: ContainerNode, child: LayoutNode, bounds: Rectangle, overflowedBy: number, currentY: number, maxY: number, _childIndex: number): boolean {
    const strategy = this.options.overflowStrategy;

    switch (strategy) {
      case "error":
        if (this.options.warnOnOverflow) {
          console.warn(`[positioning-engine] Content overflow in node "${node.id}": child "${child.id}" extends beyond bounds by ${overflowedBy.toFixed(2)}%`);
          return false;
        }
        throw new LayoutOverflowError(`Content overflow in node "${node.id}": child "${child.id}" extends beyond bounds by ${overflowedBy.toFixed(2)}%`, node.id, bounds, overflowedBy);

      case "truncate":
        if (child.type === "text") {
          const textNode = child as TextNode;
          const availableHeight = maxY - currentY;
          const lineHeight = (textNode.text.fontSize || 16) * 1.5;
          const maxLines = Math.max(1, Math.floor(availableHeight / lineHeight));
          const maxChars = maxLines * Math.floor(bounds.width / ((textNode.text.fontSize || 16) * 0.5));
          textNode.content = this.truncateText(textNode.content, maxChars);
        }
        if (this.options.warnOnOverflow) {
          console.warn(`[positioning-engine] Truncated overflowing content in "${child.id}"`);
        }
        return true;

      case "scale":
        if (child.type === "text") {
          const textNode = child as TextNode;
          const availableHeight = maxY - currentY;
          const requiredHeight = this.estimateHeight(child, bounds.width);
          const scaleFactor = availableHeight / requiredHeight;
          const newFontSize = Math.max(this.options.minFontSize, Math.floor(textNode.text.fontSize * scaleFactor));
          textNode.text.fontSize = newFontSize;
        }
        if (this.options.warnOnOverflow) {
          console.warn(`[positioning-engine] Scaled down font for "${child.id}" to fit`);
        }
        return true;

      case "overflow":
      default:
        if (this.options.warnOnOverflow) {
          console.warn(`[positioning-engine] Allowing overflow for "${child.id}"`);
        }
        return true;
    }
  }

  /**
   * Truncate text to fit within character limit
   */
  private truncateText(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;
    const truncated = text.slice(0, maxChars - 3);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxChars * 0.8) {
      return truncated.slice(0, lastSpace) + "...";
    }
    return truncated + "...";
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

    const rows = Math.ceil(node.children.length / columns);
    const cellHeight = (bounds.height - (rows - 1) * rowGap) / rows;

    node.children.forEach((child, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      // Check if this is the last row with fewer items
      const isLastRow = row === rows - 1;
      const itemsInLastRow = node.children.length % columns || columns;
      const isInLastRowWithFewerItems = isLastRow && itemsInLastRow < columns;

      // Calculate cell width: expand cells in last row if it has fewer items
      let cellWidth: number;
      let x: number;

      if (isInLastRowWithFewerItems) {
        // Expand cells to fill available width in incomplete last row
        const availableWidth = bounds.width - (itemsInLastRow - 1) * columnGap;
        cellWidth = availableWidth / itemsInLastRow;
        x = bounds.x + col * (cellWidth + columnGap);
      } else {
        // Standard cell width for complete rows
        cellWidth = (bounds.width - (columns - 1) * columnGap) / columns;
        x = bounds.x + col * (cellWidth + columnGap);
      }

      this.positionNode(child, {
        x,
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
   * - **Text nodes**: Calculates height using word-based line breaking and improved metrics
   * - **Container nodes**: Sums children heights plus gaps and padding
   * - **Other nodes**: Returns default height (10% of slide)
   *
   * This estimation uses improved heuristics for more accurate results.
   *
   * @param node - Node to estimate height for
   * @param width - Available width for the node
   * @returns Estimated height in percentage units
   */
  private estimateHeight(node: LayoutNode, width: number): number {
    // Enforce minimum width to prevent division issues
    const effectiveWidth = Math.max(width, 5); // Minimum 5% width

    if (node.type === "text") {
      const textNode = node as TextNode;
      const content = textNode.content;
      const fontSize = textNode.text.fontSize || 16;
      // Use more conservative line height (1.6 for better readability, matches CSS defaults)
      const lineHeight = fontSize * 1.6;
      const minHeight = lineHeight; // At least one line

      if (!content || content.length === 0) {
        return minHeight;
      }

      // More conservative character width estimation for variable-width fonts
      // 0.55 accounts for wider characters and spacing better than 0.5
      const avgCharWidth = fontSize * 0.55;
      const charsPerLine = Math.max(1, Math.floor(effectiveWidth / avgCharWidth));

      // Word-based line estimation with conservative word length
      // Average word length in English is ~5 chars, but include punctuation and spacing = 6.5
      const avgWordLength = 6.5;
      const wordsPerLine = Math.max(1, Math.floor(charsPerLine / avgWordLength));
      const words = content.split(/\s+/).filter((w) => w.length > 0);
      const totalWords = words.length;
      const estimatedLines = Math.max(1, Math.ceil(totalWords / wordsPerLine));

      // Add extra lines for long words and line breaks in content
      const longWords = words.filter((w) => w.length > charsPerLine).length;
      const explicitLineBreaks = (content.match(/\n/g) || []).length;
      const totalLines = estimatedLines + longWords + explicitLineBreaks;

      // Add 10% safety margin to prevent underestimation
      const estimatedHeight = totalLines * lineHeight;
      const safetyMargin = estimatedHeight * 0.1;

      return Math.max(minHeight, estimatedHeight + safetyMargin);
    }

    if (node.type === "image") {
      // Images typically maintain aspect ratio or fill space
      // Use 16:9 aspect ratio as more common for presentation images
      return effectiveWidth * 0.5625; // 16:9 aspect ratio (9/16 = 0.5625)
    }

    if (node.type === "shape") {
      // Shapes have explicit dimensions or default
      return Math.min(50, effectiveWidth * 0.5); // Default to 50% or half width
    }

    if (node.type === "container") {
      const container = node as ContainerNode;
      const padding = node.padding;
      const paddingHeight = padding ? padding.top + padding.bottom : 0;

      if (!container.layout) {
        return 10 + paddingHeight; // Default container height with padding
      }

      switch (container.layout.type) {
        case "flow": {
          const gap = (container.layout as FlowLayout).gap || 0;
          const direction = (container.layout as FlowLayout).direction;

          if (direction === "vertical") {
            // Sum all children heights + gaps
            const contentHeight = container.children.reduce((sum, child) => {
              return sum + this.estimateHeight(child, effectiveWidth) + gap;
            }, 0);
            // Remove trailing gap
            const totalHeight = contentHeight > 0 ? contentHeight - gap : 0;
            return totalHeight + paddingHeight;
          } else {
            // Horizontal: max height of any child
            const maxChildHeight = container.children.reduce((max, child) => {
              return Math.max(max, this.estimateHeight(child, effectiveWidth));
            }, 0);
            return maxChildHeight + paddingHeight;
          }
        }

        case "grid": {
          const layout = container.layout as GridLayout;
          const columns = layout.columns || 1;
          const rowGap = layout.rowGap || 0;
          const columnGap = layout.columnGap || 0;
          const rows = Math.ceil(container.children.length / columns);

          // Estimate cell dimensions
          const cellWidth = (effectiveWidth - (columns - 1) * columnGap) / columns;
          const maxCellHeight = container.children.reduce((max, child) => {
            return Math.max(max, this.estimateHeight(child, cellWidth));
          }, 0);

          return rows * maxCellHeight + (rows - 1) * rowGap + paddingHeight;
        }

        case "absolute": {
          // For absolute layout, estimate based on children's explicit positions
          // or default to a reasonable height
          const maxChildHeight = container.children.reduce((max, child) => {
            const childHeight = child._rect?.height || this.estimateHeight(child, effectiveWidth);
            return Math.max(max, childHeight);
          }, 10);
          return maxChildHeight + paddingHeight;
        }

        default:
          return 10 + paddingHeight;
      }
    }

    // Default height for unknown types
    return 10;
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
