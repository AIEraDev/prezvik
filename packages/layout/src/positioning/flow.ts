/**
 * Flow Engine
 *
 * Vertical/horizontal stacking with automatic positioning
 * This is the core of the layout system - no manual x/y coordinates
 */

import type { LayoutNode, ContainerNode, TextNode } from "../types.js";
import type { Frame } from "./frame.js";
import { applyPadding } from "./frame.js";
import { applyAlignment } from "./align.js";

// Slide dimensions for unit conversion (LAYOUT_WIDE: 10" × 5.625")
const SLIDE_WIDTH_IN = 10;
const SLIDE_HEIGHT_IN = 5.625;
const PT_PER_INCH = 72;

/**
 * Layout a node tree using flow-based positioning
 *
 * This recursively computes frames for all nodes based on:
 * - Container direction (vertical/horizontal)
 * - Gap between items
 * - Alignment rules
 * - Content size estimation
 */
export function layoutFlow(node: LayoutNode, frame: Frame): LayoutNode {
  // Leaf nodes: assign frame directly
  if (node.type !== "container") {
    return {
      ...node,
      _rect: frame,
    };
  }

  const container = node as ContainerNode;

  // Container has no children: just assign frame
  if (!container.children || container.children.length === 0) {
    return {
      ...container,
      _rect: frame,
      children: [],
    };
  }

  // Get layout config
  const layout = container.layout ?? { type: "flow", direction: "vertical" };

  // Apply padding to get content area
  const padding = extractPadding(container);
  const contentFrame = applyPadding(frame, padding);

  // Layout children based on mode
  let children: LayoutNode[];

  if (layout.type === "flow") {
    children = layoutFlowChildren(container.children, contentFrame, layout);
  } else if (layout.type === "grid") {
    children = layoutGridChildren(container.children, contentFrame, layout);
  } else {
    // Absolute layout: children use full frame
    children = container.children.map((child) => layoutFlow(child, contentFrame));
  }

  return {
    ...container,
    _rect: frame,
    children,
  };
}

/**
 * Layout children in flow mode (vertical or horizontal stacking)
 */
function layoutFlowChildren(children: LayoutNode[], frame: Frame, layout: any): LayoutNode[] {
  const direction = layout.direction ?? "vertical";
  const gap = layout.gap ?? 0;
  const align = layout.align ?? "start";

  const isVertical = direction === "vertical";

  // Estimate sizes for each child
  const sizes = children.map((child) => estimateSize(child, frame, isVertical));
  const totalSize = sizes.reduce((sum, size) => sum + size, 0);
  const totalGap = gap * (children.length - 1);

  // Calculate starting offset based on alignment
  const containerSize = isVertical ? frame.height : frame.width;
  const contentSize = totalSize + totalGap;

  // Vertical centering for vertical flow with align === "center"
  let startOffset: number;
  if (isVertical && align === "center") {
    const slack = containerSize - contentSize;
    startOffset = slack > 0 ? slack / 2 : 0;
  } else {
    startOffset = applyAlignment(contentSize, containerSize, align as any);
  }

  // Position each child
  let offset = startOffset;
  return children.map((child, i) => {
    const size = sizes[i];

    const childFrame: Frame = isVertical
      ? {
          x: frame.x,
          y: frame.y + offset,
          width: frame.width,
          height: size,
        }
      : {
          x: frame.x + offset,
          y: frame.y,
          width: size,
          height: frame.height,
        };

    offset += size + gap;

    return layoutFlow(child, childFrame);
  });
}

/**
 * Layout children in grid mode (N-column responsive grid)
 */
function layoutGridChildren(children: LayoutNode[], frame: Frame, layout: any): LayoutNode[] {
  const columns = layout.columns ?? 3;
  const columnGap = layout.columnGap ?? 2;
  const rowGap = layout.rowGap ?? 2;

  const totalGapWidth = columnGap * (columns - 1);
  const columnWidth = (frame.width - totalGapWidth) / columns;

  const positioned: LayoutNode[] = [];
  let row = 0;
  let col = 0;
  let currentY = frame.y;
  let rowHeight = 0;

  for (const child of children) {
    const x = frame.x + col * (columnWidth + columnGap);
    const y = currentY;

    // Estimate height for this child
    const height = estimateSize(child, { ...frame, width: columnWidth }, true);

    const childFrame: Frame = {
      x,
      y,
      width: columnWidth,
      height,
    };

    positioned.push(layoutFlow(child, childFrame));

    rowHeight = Math.max(rowHeight, height);

    col++;
    if (col >= columns) {
      col = 0;
      row++;
      currentY += rowHeight + rowGap;
      rowHeight = 0;
    }
  }

  return positioned;
}

/**
 * Estimate size for a node
 *
 * This is a heuristic - real size depends on content
 */
function estimateSize(node: LayoutNode, frame: Frame, isHeight: boolean): number {
  if (node.type === "text") {
    return estimateTextSize(node as TextNode, frame, isHeight);
  }

  if (node.type === "container") {
    const container = node as ContainerNode;
    if (!container.children || container.children.length === 0) {
      return isHeight ? 10 : 20;
    }

    // Estimate based on children
    const layout = container.layout ?? { type: "flow", direction: "vertical" };

    if (layout.type === "flow") {
      const isVertical = layout.direction === "vertical";
      const gap = layout.gap ?? 0;

      if (isVertical === isHeight) {
        // Stacking in the same direction: sum sizes
        const sizes = container.children.map((child) => estimateSize(child, frame, isHeight));
        return sizes.reduce((sum, size) => sum + size, 0) + gap * (container.children.length - 1);
      } else {
        // Stacking perpendicular: max size
        const sizes = container.children.map((child) => estimateSize(child, frame, isHeight));
        return Math.max(...sizes);
      }
    }
  }

  // Default size
  return isHeight ? 10 : 20;
}

/**
 * Estimate text size based on content and font
 *
 * Converts fontSize (points) to percentage units to match frame dimensions
 */
function estimateTextSize(node: TextNode, frame: Frame, isHeight: boolean): number {
  const fontSize = node.text.fontSize;
  const content = node.content;

  if (isHeight) {
    // Convert fontSize (points) → percentage units so units match frame.width (percent)
    // lineHeightPct: one line of text as % of slide HEIGHT
    const lineHeightPct = ((fontSize * 1.4) / PT_PER_INCH / SLIDE_HEIGHT_IN) * 100;

    const minHeight = lineHeightPct;

    if (!content || content.length === 0) return minHeight;

    // avgCharWidthPct: average character width as % of slide WIDTH
    const avgCharWidthPct = ((fontSize * 0.5) / PT_PER_INCH / SLIDE_WIDTH_IN) * 100;

    const charsPerLine = Math.max(1, Math.floor(frame.width / avgCharWidthPct));
    const wordsPerLine = Math.max(1, Math.floor(charsPerLine / 6));
    const words = content.split(/\s+/).filter((w) => w.length > 0);
    const estimatedLines = Math.max(1, Math.ceil(words.length / wordsPerLine));
    const explicitBreaks = (content.match(/\n/g) || []).length;
    const totalLines = estimatedLines + explicitBreaks;

    return Math.max(minHeight, totalLines * lineHeightPct * 1.15); // 15% safety margin
  } else {
    // Estimate width (for horizontal flow)
    const avgCharWidthPct = ((fontSize * 0.5) / PT_PER_INCH / SLIDE_WIDTH_IN) * 100;
    const contentWidth = content.length * avgCharWidthPct;
    return Math.min(contentWidth, frame.width);
  }
}

/**
 * Extract padding value from node
 */
function extractPadding(node: ContainerNode): number {
  if (!node.padding) return 0;

  // Use top padding as representative (assuming uniform padding)
  return node.padding.top;
}
