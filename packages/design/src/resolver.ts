/**
 * Theme Resolver
 *
 * Applies design tokens to layout tree
 * This is where structure meets design
 */

import type { LayoutNode, TextNode, ContainerNode } from "@kyro/layout";
import type { Theme, FontRole, ColorRole, WeightRole } from "./themes/types.js";

/**
 * Apply theme to layout tree
 *
 * Resolves semantic roles (fontRole, colorRole) to actual values
 */
export function applyTheme(node: LayoutNode, theme: Theme): LayoutNode {
  // Apply text styling
  if (node.type === "text") {
    const textNode = node as TextNode;
    const next = { ...textNode };

    // Resolve font size from role
    const fontRole = (textNode.text as any).fontRole as FontRole | undefined;
    if (fontRole && theme.typography.scale[fontRole]) {
      next.text = {
        ...textNode.text,
        fontSize: theme.typography.scale[fontRole],
      };
    }

    // Resolve font family
    if (!textNode.text.fontFamily) {
      next.text = {
        ...next.text,
        fontFamily: theme.typography.fontFamily,
      };
    }

    // Resolve color from role
    const colorRole = (textNode.text as any).colorRole as ColorRole | undefined;
    if (colorRole && theme.colors[colorRole]) {
      next.text = {
        ...next.text,
        color: theme.colors[colorRole],
      };
    } else if (!textNode.text.color) {
      // Default to text color
      next.text = {
        ...next.text,
        color: theme.colors.text,
      };
    }

    // Resolve font weight from role
    const weightRole = (textNode.text as any).weightRole as WeightRole | undefined;
    if (weightRole && theme.typography.weight[weightRole]) {
      const weight = theme.typography.weight[weightRole];
      next.text = {
        ...next.text,
        fontWeight: weight >= 600 ? "bold" : "normal",
      };
    }

    return next;
  }

  // Apply container styling
  if (node.type === "container") {
    const containerNode = node as ContainerNode;
    const next = { ...containerNode };

    // Apply default padding if not set
    if (!containerNode.padding) {
      const paddingValue = theme.layout.contentPadding;
      next.padding = {
        top: paddingValue,
        right: paddingValue,
        bottom: paddingValue,
        left: paddingValue,
      };
    }

    // Recursively apply theme to children
    if (containerNode.children) {
      next.children = containerNode.children.map((child: LayoutNode) => applyTheme(child, theme));
    }

    return next;
  }

  // Other node types: return as-is
  return node;
}

/**
 * Apply theme to entire layout tree
 */
export function applyThemeToTree(tree: any, theme: Theme): any {
  return {
    ...tree,
    root: applyTheme(tree.root, theme),
    background: tree.background ?? theme.colors.background,
  };
}
