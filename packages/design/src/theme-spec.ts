/**
 * ThemeSpec
 *
 * AI-generated or static theme specification for visual presentation styling.
 * Defines palette, typography, and per-slide visual rhythm (backgrounds, decorations).
 */

import type { BackgroundStyle } from "./vocabulary.js";

/**
 * Color palette with semantic naming
 */
export interface ThemePalette {
  /** Dominant dark/brand color (e.g., navy blue) */
  primary: string;
  /** Accent/secondary color (e.g., teal) */
  secondary: string;
  /** Highlight/CTA color (e.g., bright blue) */
  accent: string;
  /** Light slide background (e.g., off-white) */
  lightBg: string;
  /** Dark slide background (e.g., navy) */
  darkBg: string;
  /** Text color on dark backgrounds */
  textOnDark: string;
  /** Text color on light backgrounds */
  textOnLight: string;
  /** Muted text color on dark backgrounds */
  mutedOnDark: string;
  /** Muted text color on light backgrounds */
  mutedOnLight: string;
}

/**
 * Typography pairing
 */
export interface ThemeTypography {
  /** Font for titles, heroes, headings (e.g., Georgia) */
  displayFont: string;
  /** Font for body text, captions (e.g., Calibri) */
  bodyFont: string;
}

/**
 * Decoration types
 */
export type Decoration = { kind: "left-bar"; color: string; width: number } | { kind: "oval"; x: number; y: number; w: number; h: number; color: string; opacity: number } | { kind: "bottom-bar"; color: string; height: number } | { kind: "timeline-spine"; color: string } | { kind: "corner-accent"; position: "top-right" | "top-left"; color: string } | { kind: "geometric-split"; colors: string[] };

/**
 * Per-slide theme specification
 */
export interface SlideTheme {
  /** Slide identifier matching blueprint slide.id */
  slideId: string;
  /** Background mode determines which bg color to use */
  backgroundMode: "dark" | "light";
  /** Background style determines which generator to use */
  backgroundStyle: BackgroundStyle;
  /** Specific accent color for this slide */
  accentColor: string;
  /** Whether to draw a full-width header band */
  headerStyle: "band" | "none";
  /** Decorative shapes to draw on this slide */
  decorations: Decoration[];
}

/**
 * Complete theme specification
 */
export interface ThemeSpec {
  palette: ThemePalette;
  typography: ThemeTypography;
  /** One entry per slide in blueprint, defines visual rhythm */
  slideRhythm: SlideTheme[];
}
