/**
 * Hierarchy Enforcement
 *
 * Ensures clear visual hierarchy through font weight and size relationships
 * This is what makes slides feel "designed" not "flat"
 */

import type { LayoutNode, TextNode, ContainerNode } from "../types.js";

/**
 * Enforce visual hierarchy
 *
 * Adjusts font weights and ensures proper size relationships
 */
export function enforceHierarchy(node: LayoutNode): LayoutNode {
  if (node.type === "text") {
    const textNode = node as TextNode;
    const role = (textNode.text as any).fontRole || "body";

    // Enforce weight based on role
    let fontWeight: "normal" | "bold" = "normal";
    if (role === "hero" || role === "title" || role === "h1") {
      fontWeight = "bold";
    } else if (role === "subtitle" || role === "h2") {
      fontWeight = "normal";
    }

    return {
      ...textNode,
      text: {
        ...textNode.text,
        fontWeight,
      },
    };
  }

  if (node.type === "container") {
    const containerNode = node as ContainerNode;
    if (containerNode.children) {
      return {
        ...containerNode,
        children: containerNode.children.map(enforceHierarchy),
      };
    }
  }

  return node;
}

/**
 * Ensure minimum contrast between adjacent text sizes
 *
 * Prevents "muddy" hierarchy where sizes are too similar
 */
export function enforceContrast(nodes: TextNode[]): TextNode[] {
  const MIN_RATIO = 1.25; // Minimum size ratio between levels

  return nodes.map((node, i) => {
    if (i === 0) return node;

    const prevSize = nodes[i - 1].text.fontSize;
    const currentSize = node.text.fontSize;

    // If sizes are too similar, increase contrast
    if (prevSize / currentSize < MIN_RATIO && prevSize > currentSize) {
      return {
        ...node,
        text: {
          ...node.text,
          fontSize: prevSize / MIN_RATIO,
        },
      };
    }

    return node;
  });
}
