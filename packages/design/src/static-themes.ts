/**
 * Static Theme Fallbacks
 *
 * Hardcoded theme specifications for fallback when AI ThemeAgent fails.
 * Provides immediate professional-quality styling without AI calls.
 */

import type { PrezVikBlueprint } from "@prezvik/schema";
import type { ThemeSpec, SlideTheme } from "./theme-spec.js";

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
export function buildStaticThemeSpec(blueprint: PrezVikBlueprint, themeName: string): ThemeSpec {
  const base = STATIC_THEME_SPECS[themeName] ?? STATIC_THEME_SPECS.executive;

  const rhythm: SlideTheme[] = blueprint.slides.map((slide, i) => {
    const isDark = slide.type === "hero" || slide.type === "closing" || slide.type === "data" || i % 3 === 0;

    // Hero slides get dark-geometric background
    if (slide.type === "hero") {
      return {
        slideId: slide.id,
        backgroundMode: "dark",
        backgroundStyle: "dark-geometric",
        accentColor: base.palette.secondary,
        headerStyle: "none",
        decorations: [], // Shapes are in the background image
      };
    }

    return {
      slideId: slide.id,
      backgroundMode: isDark ? "dark" : "light",
      backgroundStyle: isDark ? "dark-gradient" : "light-minimal",
      accentColor: isDark ? base.palette.secondary : base.palette.primary,
      headerStyle: "none",
      decorations: [], // Shapes are in the background image
    };
  });

  return { ...base, slideRhythm: rhythm };
}
