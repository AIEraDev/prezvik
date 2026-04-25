/**
 * Static Theme Fallbacks
 *
 * Hardcoded theme specifications for fallback when AI ThemeAgent fails.
 * Provides immediate professional-quality styling without AI calls.
 */

import type { KyroBlueprint } from "@kyro/schema";
import type { ThemeSpec, SlideTheme, Decoration } from "./theme-spec.js";

/**
 * Static theme palette definitions
 */
export const STATIC_THEME_SPECS: Record<string, Omit<ThemeSpec, "slideRhythm">> = {
  executive: {
    palette: {
      primary: "0D1B4B", // Navy
      secondary: "027B8E", // Teal
      accent: "00B4CC", // Light blue
      lightBg: "F4F8FB", // Off-white
      darkBg: "0D1B4B", // Navy
      textOnDark: "FFFFFF", // White
      textOnLight: "1A1A2E", // Dark blue-gray
      mutedOnDark: "A8C8D8", // Light blue-gray
      mutedOnLight: "64748B", // Medium gray
    },
    typography: {
      displayFont: "Georgia",
      bodyFont: "Calibri",
    },
  },
  bold: {
    palette: {
      primary: "1A0533", // Deep purple
      secondary: "7C3AED", // Vivid purple
      accent: "EC4899", // Hot pink
      lightBg: "F5F3FF", // Light purple
      darkBg: "1A0533", // Deep purple
      textOnDark: "FFFFFF", // White
      textOnLight: "1A0533", // Deep purple
      mutedOnDark: "C4B5FD", // Light purple
      mutedOnLight: "6D28D9", // Purple
    },
    typography: {
      displayFont: "Trebuchet MS",
      bodyFont: "Calibri",
    },
  },
  minimal: {
    palette: {
      primary: "111827", // Dark gray
      secondary: "374151", // Medium gray
      accent: "6366F1", // Indigo
      lightBg: "FFFFFF", // Pure white
      darkBg: "111827", // Dark gray
      textOnDark: "F9FAFB", // Off-white
      textOnLight: "111827", // Dark gray
      mutedOnDark: "9CA3AF", // Light gray
      mutedOnLight: "6B7280", // Medium gray
    },
    typography: {
      displayFont: "Calibri Light",
      bodyFont: "Calibri",
    },
  },
};

/**
 * Build a static ThemeSpec from a blueprint
 *
 * Generates slide rhythm based on slide type with sensible defaults.
 * Hero, closing, and data slides get dark backgrounds.
 * Content slides get light backgrounds.
 */
export function buildStaticThemeSpec(blueprint: KyroBlueprint, themeName: string): ThemeSpec {
  const base = STATIC_THEME_SPECS[themeName] ?? STATIC_THEME_SPECS.executive;

  const rhythm: SlideTheme[] = blueprint.slides.map((slide, i) => {
    const isDark = slide.type === "hero" || slide.type === "closing" || slide.type === "data" || i % 3 === 0;

    const decorations: Decoration[] = isDark
      ? [
          { kind: "left-bar", color: base.palette.secondary, width: 0.22 },
          { kind: "oval", x: 7.8, y: -0.6, w: 3.2, h: 3.2, color: base.palette.secondary, opacity: 0.18 },
          { kind: "oval", x: 8.5, y: 0.5, w: 2.2, h: 2.2, color: base.palette.accent, opacity: 0.22 },
        ]
      : [{ kind: "left-bar", color: base.palette.secondary, width: 0.07 }];

    return {
      slideId: slide.id,
      backgroundMode: isDark ? "dark" : "light",
      accentColor: isDark ? base.palette.secondary : base.palette.primary,
      headerStyle: slide.type === "hero" ? "none" : "band",
      decorations: slide.type === "closing" ? [{ kind: "bottom-bar", color: base.palette.secondary, height: 0.425 }] : decorations,
    };
  });

  return { ...base, slideRhythm: rhythm };
}
