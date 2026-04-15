/**
 * Theme Types
 *
 * Complete theme definition with all design tokens
 */

import type { TypographyTokens } from "../tokens/typography.js";
import type { SpacingTokens } from "../tokens/spacing.js";
import type { ColorTokens } from "../tokens/colors.js";

export interface Theme {
  name: string;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  colors: ColorTokens;
  layout: {
    padding: number;
    maxWidth: number;
    contentPadding: number;
  };
}

/**
 * Font role mapping (semantic → size)
 */
export type FontRole = "hero" | "title" | "subtitle" | "h1" | "h2" | "body" | "small" | "caption";

/**
 * Color role mapping (semantic → color)
 */
export type ColorRole = "text" | "textMuted" | "primary" | "accent" | "success" | "warning" | "error" | "background" | "foreground";

/**
 * Weight role mapping
 */
export type WeightRole = "regular" | "medium" | "bold";
