/**
 * Executive Theme
 *
 * Professional, clean, corporate aesthetic
 * High contrast, clear hierarchy, minimal decoration
 */

import { typography } from "../tokens/typography.js";
import { spacing } from "../tokens/spacing.js";
import { colors } from "../tokens/colors.js";
import type { Theme } from "./types.js";

export const executiveTheme: Theme = {
  name: "executive",

  typography: {
    ...typography,
    fontFamily: "Calibri",
  },

  spacing,

  colors: {
    ...colors,
    background: "#FFFFFF",
    text: "#1F2937",
    primary: "#1E40AF",
    accent: "#DC2626",
  },

  layout: {
    padding: 8,
    maxWidth: 90,
    contentPadding: 5,
  },
};
