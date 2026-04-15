/**
 * Whitespace Optimizer
 *
 * Prevents cramped or too-empty slides
 * Ensures breathing room
 */

import type { LayoutNode, ContainerNode, Spacing } from "../types.js";

/**
 * Normalize padding to prevent cramped layouts
 */
export function normalizePadding(node: LayoutNode, minPadding: number = 4): LayoutNode {
  if (node.type !== "container") {
    return node;
  }

  const containerNode = node as ContainerNode;

  // Ensure minimum padding
  const padding = containerNode.padding;
  const normalizedPadding: Spacing = {
    top: Math.max(padding?.top ?? 0, minPadding),
    right: Math.max(padding?.right ?? 0, minPadding),
    bottom: Math.max(padding?.bottom ?? 0, minPadding),
    left: Math.max(padding?.left ?? 0, minPadding),
  };

  return {
    ...containerNode,
    padding: normalizedPadding,
    children: containerNode.children?.map((child) => normalizePadding(child, minPadding)) ?? [],
  };
}

/**
 * Add breathing room to dense content
 */
export function addBreathingRoom(node: LayoutNode): LayoutNode {
  if (node.type !== "container") {
    return node;
  }

  const containerNode = node as ContainerNode;
  const layout = containerNode.layout;

  // If many children, increase gap
  if (containerNode.children && containerNode.children.length > 5) {
    if (layout && layout.type === "flow") {
      const currentGap = layout.gap ?? 2;
      const increasedGap = Math.max(currentGap, 3); // Minimum gap for dense content

      return {
        ...containerNode,
        layout: {
          ...layout,
          gap: increasedGap,
        },
        children: containerNode.children.map(addBreathingRoom),
      };
    }
  }

  return {
    ...containerNode,
    children: containerNode.children?.map(addBreathingRoom) ?? [],
  };
}

/**
 * Prevent excessive whitespace
 */
export function preventExcessiveWhitespace(node: LayoutNode, maxPadding: number = 12): LayoutNode {
  if (node.type !== "container") {
    return node;
  }

  const containerNode = node as ContainerNode;

  // Clamp padding to maximum
  const padding = containerNode.padding;
  const clampedPadding: Spacing = {
    top: Math.min(padding?.top ?? 0, maxPadding),
    right: Math.min(padding?.right ?? 0, maxPadding),
    bottom: Math.min(padding?.bottom ?? 0, maxPadding),
    left: Math.min(padding?.left ?? 0, maxPadding),
  };

  // Clamp gap
  const layout = containerNode.layout;
  if (layout && layout.type === "flow") {
    const gap = Math.min(layout.gap ?? 2, 8); // Max gap of 8

    return {
      ...containerNode,
      padding: clampedPadding,
      layout: {
        ...layout,
        gap,
      },
      children: containerNode.children?.map((child) => preventExcessiveWhitespace(child, maxPadding)) ?? [],
    };
  }

  return {
    ...containerNode,
    padding: clampedPadding,
    children: containerNode.children?.map((child) => preventExcessiveWhitespace(child, maxPadding)) ?? [],
  };
}
