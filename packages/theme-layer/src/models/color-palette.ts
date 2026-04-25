/**
 * Color space types supported by the Theme Layer
 */
export type ColorSpace = "rgb" | "hsl" | "oklch" | "lab";

/**
 * Color palette interface containing all semantic color roles
 * and generated color scales for theme-based presentation generation
 */
export interface ColorPalette {
  /** Palette version for schema evolution */
  version: "1.0";

  /** Primary brand color */
  primary: string;

  /** Secondary brand color */
  secondary: string;

  /** Accent color for highlights and emphasis */
  accent: string;

  /** Light background color */
  lightBg: string;

  /** Dark background color */
  darkBg: string;

  /** Text color for use on dark backgrounds */
  textOnDark: string;

  /** Text color for use on light backgrounds */
  textOnLight: string;

  /** Muted text color for use on dark backgrounds */
  mutedOnDark: string;

  /** Muted text color for use on light backgrounds */
  mutedOnLight: string;

  /** Generated color scales for interpolation */
  scales?: {
    [key: string]: string[]; // e.g., 'primary': ['#001', '#002', ..., '#009']
  };

  /** Metadata about palette generation */
  metadata: {
    /** Color space used for interpolation */
    colorSpace: ColorSpace;

    /** ISO timestamp of generation */
    generatedAt: string;

    /** Hash of ThemeSpec for cache invalidation */
    themeSpecHash: string;
  };
}
