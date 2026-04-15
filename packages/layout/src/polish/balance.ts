/**
 * Balance Engine
 *
 * Ensures visual stability and symmetry
 * Prevents lopsided layouts
 */

import type { LayoutNode, ContainerNode } from "../types.js";

/**
 * Balance layout by equalizing child widths in horizontal layouts
 */
export function balanceLayout(node: LayoutNode): LayoutNode {
  if (node.type !== "container") {
    return node;
  }

  const containerNode = node as ContainerNode;

  if (!containerNode.children || containerNode.children.length < 2) {
    return {
      ...containerNode,
      children: containerNode.children?.map(balanceLayout) ?? [],
    };
  }

  const layout = containerNode.layout;

  // Balance horizontal flow layouts
  if (layout && layout.type === "flow" && layout.direction === "horizontal") {
    // Recursively balance children
    return {
      ...containerNode,
      children: containerNode.children.map(balanceLayout),
    };
  }

  // Balance grid layouts
  if (layout && layout.type === "grid") {
    // Ensure consistent column gaps
    const columnGap = layout.columnGap ?? 4;
    const rowGap = layout.rowGap ?? columnGap; // Match row gap to column gap

    return {
      ...containerNode,
      layout: {
        ...layout,
        columnGap,
        rowGap,
      },
      children: containerNode.children.map(balanceLayout),
    };
  }

  // Recursively balance children
  return {
    ...containerNode,
    children: containerNode.children.map(balanceLayout),
  };
}

/**
 * Center content within container if it's too small
 */
export function centerSmallContent(node: LayoutNode, threshold: number = 60): LayoutNode {
  if (node.type !== "container") {
    return node;
  }

  const containerNode = node as ContainerNode;
  const layout = containerNode.layout;

  // If vertical flow layout with small content, center it
  if (layout && layout.type === "flow" && layout.direction === "vertical") {
    // Estimate total content height
    const estimatedHeight = (containerNode.children?.length ?? 0) * 10; // Rough estimate

    if (estimatedHeight < threshold) {
      return {
        ...containerNode,
        layout: {
          ...layout,
          align: "center",
        },
        children: containerNode.children?.map((child) => centerSmallContent(child, threshold)) ?? [],
      };
    }
  }

  return {
    ...containerNode,
    children: containerNode.children?.map((child) => centerSmallContent(child, threshold)) ?? [],
  };
}
