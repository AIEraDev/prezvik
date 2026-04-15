/**
 * Typography Tokens
 *
 * Font families, sizes, weights, and line heights
 * Never hardcode these values - always reference tokens
 */

export interface TypographyTokens {
  fontFamily: string;
  scale: {
    hero: number;
    title: number;
    subtitle: number;
    h1: number;
    h2: number;
    body: number;
    small: number;
    caption: number;
  };
  weight: {
    regular: number;
    medium: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

/**
 * Default typography tokens
 */
export const typography: TypographyTokens = {
  fontFamily: "Inter",

  scale: {
    hero: 72,
    title: 48,
    subtitle: 32,
    h1: 36,
    h2: 28,
    body: 18,
    small: 14,
    caption: 12,
  },

  weight: {
    regular: 400,
    medium: 500,
    bold: 700,
  },

  lineHeight: {
    tight: 1.1,
    normal: 1.15,
    relaxed: 1.5,
  },
};
