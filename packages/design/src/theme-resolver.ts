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

/** pptxgenjs requires hex colors WITHOUT the # prefix */
function stripHash(color: string): string {
  return color.startsWith("#") ? color.slice(1) : color;
}

/**
 * WCAG contrast ratio calculation
 * Calculates the contrast ratio between two colors
 * Minimum for AA compliance: 4.5:1 for normal text, 3:1 for large text
 */
function calculateContrastRatio(color1: string, color2: string): number {
  // Parse hex colors to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const normalized = hex.replace("#", "");
    if (normalized.length === 3) {
      const r = parseInt(normalized[0] + normalized[0], 16);
      const g = parseInt(normalized[1] + normalized[1], 16);
      const b = parseInt(normalized[2] + normalized[2], 16);
      return { r, g, b };
    }
    if (normalized.length === 6) {
      const r = parseInt(normalized.substring(0, 2), 16);
      const g = parseInt(normalized.substring(2, 4), 16);
      const b = parseInt(normalized.substring(4, 6), 16);
      return { r, g, b };
    }
    return null;
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return 21; // Assume good contrast if colors can't be parsed
  }

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
function isContrastValid(contrast: number, isLargeText = false): boolean {
  // WCAG AA: 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold)
  const minContrast = isLargeText ? 3 : 4.5;
  return contrast >= minContrast;
}

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
  private themeCache = new Map<string, Theme>();

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
      themed.background = stripHash(theme.colors.background);
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
    if (fontRole) {
      if (theme.typography.scale[fontRole]) {
        // Preserve explicit fontSize override
        if (!node.text.fontSize) {
          themed.text.fontSize = theme.typography.scale[fontRole];
        }
      } else {
        // Font role not found in theme - warn and fallback to body size
        console.warn(`[theme-resolver] Font role "${fontRole}" not found in theme "${theme.name}". ` + `Falling back to "body" (${theme.typography.scale.body || 16}px). ` + `Available roles: ${Object.keys(theme.typography.scale).join(", ")}`);
        if (!node.text.fontSize) {
          themed.text.fontSize = theme.typography.scale.body || 16;
        }
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
        themed.text.color = stripHash(theme.colors[colorRole]);
      }
    } else if (!node.text.color) {
      // Apply default text color when not specified
      themed.text.color = stripHash(theme.colors.text);
    }

    // Validate contrast ratio for accessibility
    const bgColor = theme.colors.background || "#FFFFFF";
    let textColor = themed.text.color || theme.colors.text;
    const contrast = calculateContrastRatio(textColor, bgColor);
    const isLargeText = (themed.text.fontSize || 16) >= 18 || ((themed.text.fontSize || 16) >= 14 && themed.text.fontWeight === "bold");

    if (!isContrastValid(contrast, isLargeText)) {
      const minRequired = isLargeText ? 3 : 4.5;
      console.warn(`[theme-resolver] Contrast ratio ${contrast.toFixed(2)}:1 for text "${node.content.substring(0, 30)}..." ` + `does not meet WCAG AA standard (${minRequired}:1). Auto-correcting...`);

      // Auto-correct: adjust text color to meet contrast requirements
      const correctedColor = this.calculateAccessibleColor(textColor, bgColor, isLargeText);
      themed.text.color = stripHash(correctedColor);

      // Verify the correction worked
      const newContrast = calculateContrastRatio(correctedColor, bgColor);
      console.log(`[theme-resolver] Corrected contrast to ${newContrast.toFixed(2)}:1 using ${correctedColor}`);
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
   * Calculate an accessible color that meets WCAG contrast requirements
   * Adjusts the text color brightness to ensure minimum contrast ratio
   */
  private calculateAccessibleColor(textColor: string, bgColor: string, isLargeText: boolean): string {
    const minContrast = isLargeText ? 3 : 4.5;
    const targetContrast = minContrast + 0.5; // Add small buffer

    // Parse colors to RGB
    const parseColor = (hex: string): { r: number; g: number; b: number } | null => {
      const normalized = hex.replace("#", "");
      if (normalized.length === 3) {
        return {
          r: parseInt(normalized[0] + normalized[0], 16),
          g: parseInt(normalized[1] + normalized[1], 16),
          b: parseInt(normalized[2] + normalized[2], 16),
        };
      }
      if (normalized.length === 6) {
        return {
          r: parseInt(normalized.substring(0, 2), 16),
          g: parseInt(normalized.substring(2, 4), 16),
          b: parseInt(normalized.substring(4, 6), 16),
        };
      }
      return null;
    };

    const rgb = parseColor(textColor);
    const bgRgb = parseColor(bgColor);

    if (!rgb || !bgRgb) {
      // Fallback to theme default if parsing fails
      return "#111827"; // Dark gray for light backgrounds
    }

    // Calculate background luminance to determine if we need darker or lighter text
    const getLuminance = (r: number, g: number, b: number): number => {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const needsDarkText = bgLuminance > 0.5; // Light background needs dark text

    // Adjust color brightness iteratively
    let adjustedRgb = { ...rgb };
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const currentLuminance = getLuminance(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
      const lighter = Math.max(currentLuminance, bgLuminance);
      const darker = Math.min(currentLuminance, bgLuminance);
      const currentContrast = (lighter + 0.05) / (darker + 0.05);

      if (currentContrast >= targetContrast) {
        break;
      }

      // Adjust brightness
      if (needsDarkText) {
        // Make darker
        adjustedRgb.r = Math.max(0, adjustedRgb.r - 15);
        adjustedRgb.g = Math.max(0, adjustedRgb.g - 15);
        adjustedRgb.b = Math.max(0, adjustedRgb.b - 15);
      } else {
        // Make lighter
        adjustedRgb.r = Math.min(255, adjustedRgb.r + 15);
        adjustedRgb.g = Math.min(255, adjustedRgb.g + 15);
        adjustedRgb.b = Math.min(255, adjustedRgb.b + 15);
      }

      attempts++;
    }

    // Convert back to hex
    const toHex = (n: number): string => n.toString(16).padStart(2, "0");
    return stripHash(`#${toHex(adjustedRgb.r)}${toHex(adjustedRgb.g)}${toHex(adjustedRgb.b)}`);
  }

  /**
   * Load theme by name with caching
   *
   * Falls back to default theme if theme not found
   */
  private loadTheme(name: string): Theme {
    if (!this.themeCache.has(name)) {
      this.themeCache.set(name, getTheme(name));
    }
    return this.themeCache.get(name)!;
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
