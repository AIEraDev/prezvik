import type { ColorPalette } from "@kyro/theme-layer";
import type { VisualElement } from "./visual-element.js";

/**
 * Utility type for dimensions
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Utility type for 2D points
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Utility type for rectangular bounds
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Theme tone options
 */
export type ThemeTone = "executive" | "minimal" | "modern";

/**
 * Slide type classification
 */
export type SlideType = "hero" | "section" | "content" | "closing";

/**
 * Typography settings for theme
 */
export interface ThemeTypography {
  displayFont: string;
  bodyFont: string;
}

/**
 * Visual context for a single slide containing all visual elements
 */
export interface SlideVisualContext {
  /** Slide identifier */
  slideId: string;

  /** Slide type */
  type: SlideType;

  /** Slide dimensions */
  dimensions: Dimensions;

  /** Background element */
  background: VisualElement;

  /** Decoration shapes */
  decorations: VisualElement[];

  /** Content elements from layout tree */
  content: VisualElement[];
}

/**
 * Complete visual context containing all visual elements for rendering
 * This is the intermediate representation passed from Visual Layer to Export Layer
 */
export interface VisualContext {
  /** Schema version */
  version: "1.0";

  /** Slides with visual elements */
  slides: SlideVisualContext[];

  /** Color palette used */
  colorPalette: ColorPalette;

  /** Global theme settings */
  theme: {
    tone: ThemeTone;
    typography: ThemeTypography;
  };

  /** Metadata */
  metadata: {
    /** ISO timestamp of generation */
    generatedAt: string;

    /** Hash of layout tree for cache invalidation */
    layoutTreeHash: string;

    /** Hash of ThemeSpec for cache invalidation */
    themeSpecHash: string;
  };
}
