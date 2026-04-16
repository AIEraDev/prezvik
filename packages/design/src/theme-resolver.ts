/**
 * Theme Resolver
 *
 * Applies theme tokens (colors, fonts) to positioned layout trees.
 * This is the bridge between layout positioning and rendering.
 *
 * CORE PRINCIPLE:
 * - Receives positioned layout trees (with _rect coordinates)
 * - Applies theme styling (colors, fonts, weights)
 * - Resolves semantic roles (fontRole, colorRole) to actual values
 * - Preserves explicit overrides from Blueprint
 */

import type { LayoutTree, LayoutNode, TextNode, ContainerNode } from "@kyro/layout";
import type { Theme, FontRole, ColorRole, WeightRole } from "./themes/types.js";
import { getTheme } from "./themes/index.js";

/**
 * Theme Resolver configuration options
 *
 * @example
 * ```typescript
 * const options: ThemeResolverOptions = {
 *   defaultTheme: "executive"
 * };
 * ```
 */
export interface ThemeResolverOptions {
  /**
   * Default theme to use when no theme is specified
   * @default "executive"
   */
  defaultTheme?: string;
}

/**
 * Theme Resolver
 *
 * Applies theme tokens (colors, fonts) to positioned layout trees.
 * This is the bridge between layout positioning and rendering.
 *
 * **Semantic Roles:**
 * The Theme Resolver resolves semantic roles to actual values:
 * - **Font roles**: title, body, display, code → font family and size
 * - **Color roles**: primary, secondary, accent, text → color values
 * - **Weight roles**: normal, medium, bold → font weights
 *
 * **Theme Preservation:**
 * Explicit styling from Blueprint is preserved - theme tokens only apply
 * when properties are not explicitly set.
 *
 * **Available Themes:**
 * - **executive**: Professional corporate theme
 * - **minimal**: Clean, minimal aesthetic
 * - **modern**: Contemporary design with bold colors
 *
 * @example
 * ```typescript
 * const resolver = new ThemeResolver({ defaultTheme: "executive" });
 * const themedTrees = resolver.apply(positionedTrees, "minimal");
 *
 * // All nodes now have resolved colors and fonts
 * themedTrees[0].root.children[0].text.color // "#1A1A1A" (from theme)
 * ```
 */
export class ThemeResolver {
  private options: Required<ThemeResolverOptions>;

  constructor(options: ThemeResolverOptions = {}) {
    this.options = {
      defaultTheme: options.defaultTheme ?? "executive",
    };
  }

  /**
   * Apply theme to layout trees
   *
   * Applies theme tokens to all nodes in the provided layout trees.
   * Resolves semantic roles (fontRole, colorRole) to actual values from
   * the theme configuration.
   *
   * @param trees - Positioned layout trees (with _rect coordinates)
   * @param themeName - Optional theme name (defaults to configured default)
   * @returns Themed layout trees with resolved colors and fonts
   *
   * @example
   * ```typescript
   * const resolver = new ThemeResolver();
   *
   * // Use default theme
   * const themed1 = resolver.apply(positionedTrees);
   *
   * // Use specific theme
   * const themed2 = resolver.apply(positionedTrees, "minimal");
   * ```
   */
  apply(trees: LayoutTree[], themeName?: string): LayoutTree[] {
    const theme = this.loadTheme(themeName || this.options.defaultTheme);
    return trees.map((tree) => this.applyToTree(tree, theme));
  }

  /**
   * Apply theme to a single tree
   */
  private applyToTree(tree: LayoutTree, theme: Theme): LayoutTree {
    const themed = { ...tree };

    // Apply background color to slide root container
    if (theme.colors.background) {
      themed.background = theme.colors.background;
    }

    // Apply theme to all nodes
    themed.root = this.applyToNode(tree.root, theme);

    return themed;
  }

  /**
   * Apply theme to a node recursively
   *
   * Resolves semantic roles to actual values:
   * - fontRole → font family and size
   * - colorRole → color value
   * - weightRole → font weight
   *
   * Preserves explicit overrides from Blueprint
   */
  private applyToNode(node: LayoutNode, theme: Theme): LayoutNode {
    if (node.type === "text") {
      return this.applyToTextNode(node as TextNode, theme);
    }

    if (node.type === "container") {
      return this.applyToContainerNode(node as ContainerNode, theme);
    }

    // Other node types: return as-is
    return node;
  }

  /**
   * Apply theme to text node
   */
  private applyToTextNode(node: TextNode, theme: Theme): TextNode {
    const themed = { ...node, text: { ...node.text } };

    // Resolve font role to font size
    // Only apply if not explicitly set in Blueprint
    const fontRole = (node.text as any).fontRole as FontRole | undefined;
    if (fontRole && theme.typography.scale[fontRole]) {
      // Preserve explicit fontSize override
      if (!node.text.fontSize) {
        themed.text.fontSize = theme.typography.scale[fontRole];
      }
    }

    // Resolve font family
    // Apply theme font family if not explicitly set
    if (!node.text.fontFamily) {
      themed.text.fontFamily = theme.typography.fontFamily;
    }

    // Resolve font weight from role
    const weightRole = (node.text as any).weightRole as WeightRole | undefined;
    if (weightRole && theme.typography.weight[weightRole]) {
      // Preserve explicit fontWeight override
      if (!node.text.fontWeight) {
        const weight = theme.typography.weight[weightRole];
        themed.text.fontWeight = weight >= 600 ? "bold" : "normal";
      }
    }

    // Resolve color role to color value
    const colorRole = (node.text as any).colorRole as ColorRole | undefined;
    if (colorRole && theme.colors[colorRole]) {
      // Preserve explicit color override
      if (!node.text.color) {
        themed.text.color = theme.colors[colorRole];
      }
    } else if (!node.text.color) {
      // Apply default text color when not specified
      themed.text.color = theme.colors.text;
    }

    return themed;
  }

  /**
   * Apply theme to container node
   */
  private applyToContainerNode(node: ContainerNode, theme: Theme): ContainerNode {
    const themed = { ...node };

    // Recursively apply theme to children
    if (node.children && node.children.length > 0) {
      themed.children = node.children.map((child) => this.applyToNode(child, theme));
    }

    return themed;
  }

  /**
   * Load theme by name
   *
   * Falls back to default theme if theme not found
   */
  private loadTheme(name: string): Theme {
    return getTheme(name);
  }
}

/**
 * Global instance
 */
let globalResolver: ThemeResolver | null = null;

/**
 * Get global theme resolver instance
 */
export function getThemeResolver(): ThemeResolver {
  if (!globalResolver) {
    globalResolver = new ThemeResolver();
  }
  return globalResolver;
}
