/**
 * Modern Theme
 *
 * Bold, vibrant, contemporary aesthetic
 * Strong colors, dynamic typography, confident design
 */

import { typography } from "../tokens/typography.js";
import { spacing } from "../tokens/spacing.js";
import { colors } from "../tokens/colors.js";
import type { Theme } from "./types.js";

export const modernTheme: Theme = {
  name: "modern",

  typography: {
    ...typography,
    fontFamily: "Montserrat",
    scale: {
      ...typography.scale,
      hero: 80,
      title: 52,
      subtitle: 36,
      h1: 40,
      h2: 32,
    },
  },

  spacing: {
    ...spacing,
    // Balanced spacing
    scale: [6, 12, 20, 28, 40, 56, 80],
  },

  colors: {
    ...colors,
    background: "#FFFFFF",
    text: "#0F172A",
    textMuted: "#475569",
    primary: "#8B5CF6",
    accent: "#EC4899",
    success: "#22C55E",
  },

  layout: {
    padding: 10,
    maxWidth: 88,
    contentPadding: 6,
  },
};
