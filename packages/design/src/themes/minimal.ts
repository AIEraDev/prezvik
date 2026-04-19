/**
 * Minimal Theme
 *
 * Clean, modern, lots of whitespace
 * Subtle colors, generous spacing, elegant typography
 */

import { typography } from "../tokens/typography.js";
import { spacing } from "../tokens/spacing.js";
import { colors } from "../tokens/colors.js";
import type { Theme } from "./types.js";

export const minimalTheme: Theme = {
  name: "minimal",

  typography: {
    ...typography,
    fontFamily: "Inter",
    scale: {
      ...typography.scale,
      hero: 64,
      title: 44,
      subtitle: 28,
    },
  },

  spacing: {
    ...spacing,
    // More generous spacing
    scale: [8, 16, 24, 32, 48, 64, 96],
  },

  colors: {
    ...colors,
    background: "FAFAFA",
    text: "171717",
    textMuted: "737373",
    primary: "0EA5E9",
    accent: "F97316",
  },

  layout: {
    padding: 12,
    maxWidth: 85,
    contentPadding: 8,
  },
};
