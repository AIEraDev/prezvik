/**
 * Vertical Rhythm
 *
 * Consistent spacing creates professional flow
 * This is what makes slides feel "tight" not "messy"
 */

import type { LayoutNode, ContainerNode } from "../types.js";

/**
 * Apply vertical rhythm to layout
 *
 * Ensures consistent spacing between elements based on baseline grid
 */
export function applyVerticalRhythm(node: LayoutNode, baselineUnit: number = 4): LayoutNode {
  if (node.type !== "container") {
    return node;
  }

  const containerNode = node as ContainerNode;

  if (!containerNode.children || containerNode.children.length === 0) {
    return node;
  }

  // Snap gap to baseline grid
  const layout = containerNode.layout;
  if (layout && layout.type === "flow") {
    const gap = layout.gap ?? 2;
    const snappedGap = Math.round(gap / baselineUnit) * baselineUnit;

    return {
      ...containerNode,
      layout: {
        ...layout,
        gap: snappedGap,
      },
      children: containerNode.children.map((child) => applyVerticalRhythm(child, baselineUnit)),
    };
  }

  // Recursively apply to children
  return {
    ...containerNode,
    children: containerNode.children.map((child) => applyVerticalRhythm(child, baselineUnit)),
  };
}

/**
 * Normalize spacing to create consistent rhythm
 *
 * Adjusts gaps to follow a harmonic scale
 */
export function normalizeSpacing(node: LayoutNode): LayoutNode {
  if (node.type !== "container") {
    return node;
  }

  const containerNode = node as ContainerNode;
  const layout = containerNode.layout;

  if (layout && layout.type === "flow") {
    const gap = layout.gap ?? 2;

    // Snap to harmonic scale: 1, 2, 3, 4, 6, 8, 12, 16
    const harmonicScale = [1, 2, 3, 4, 6, 8, 12, 16];
    const snappedGap = harmonicScale.reduce((prev, curr) => {
      return Math.abs(curr - gap) < Math.abs(prev - gap) ? curr : prev;
    });

    return {
      ...containerNode,
      layout: {
        ...layout,
        gap: snappedGap,
      },
      children: containerNode.children?.map(normalizeSpacing) ?? [],
    };
  }

  return {
    ...containerNode,
    children: containerNode.children?.map(normalizeSpacing) ?? [],
  };
}
