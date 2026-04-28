/**
 * DecorationPresets - Predefined decoration configurations
 *
 * Provides a library of decoration styles that can be applied to slides
 * based on slide type, position, and theme.
 */

import type { SlideTheme } from "@prezvik/design";

export interface DecorationConfig {
  showAccentBar: boolean;
  showOvalDecoration: boolean;
  showBottomBar: boolean;
  showTimelineSpine: boolean;
  showCornerAccents: boolean;
}

export class DecorationPresets {
  /**
   * Get decoration configuration based on slide index and theme
   */
  static getConfig(slideIndex: number, slideTheme: SlideTheme): DecorationConfig {
    // Content slides with band headers get standard decorations
    if (slideTheme.headerStyle === "band") {
      return {
        showAccentBar: true,
        showOvalDecoration: slideIndex % 2 === 0, // Alternating
        showBottomBar: true,
        showTimelineSpine: false,
        showCornerAccents: false,
      };
    }

    // Default minimal decorations
    return {
      showAccentBar: false,
      showOvalDecoration: false,
      showBottomBar: false,
      showTimelineSpine: false,
      showCornerAccents: false,
    };
  }

  /**
   * Get decoration configuration for specific slide types
   */
  static forSlideType(slideType: string, slideIndex: number): DecorationConfig {
    switch (slideType) {
      case "hero":
        return {
          showAccentBar: false,
          showOvalDecoration: true,
          showBottomBar: false,
          showTimelineSpine: false,
          showCornerAccents: false,
        };
      case "content":
        return {
          showAccentBar: true,
          showOvalDecoration: slideIndex % 2 === 0,
          showBottomBar: true,
          showTimelineSpine: false,
          showCornerAccents: false,
        };
      case "data":
        return {
          showAccentBar: true,
          showOvalDecoration: false,
          showBottomBar: true,
          showTimelineSpine: false,
          showCornerAccents: true,
        };
      case "comparison":
        return {
          showAccentBar: true,
          showOvalDecoration: false,
          showBottomBar: true,
          showTimelineSpine: false,
          showCornerAccents: true,
        };
      case "timeline":
        return {
          showAccentBar: true,
          showOvalDecoration: false,
          showBottomBar: true,
          showTimelineSpine: true,
          showCornerAccents: false,
        };
      default:
        return {
          showAccentBar: false,
          showOvalDecoration: false,
          showBottomBar: false,
          showTimelineSpine: false,
          showCornerAccents: false,
        };
    }
  }
}
