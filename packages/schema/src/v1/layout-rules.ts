/**
 * Layout Rules
 *
 * Defines the rules for each layout type
 * This is where "beautiful slides" comes from
 */

export type LayoutType = "center_focus" | "two_column" | "three_column" | "split_screen" | "grid_2x2" | "hero_overlay" | "timeline" | "stat_highlight" | "image_dominant";

export type LayoutRule = {
  // Unique identifier for the layout
  layoutId: string;

  // Composition
  composition: "center" | "left" | "right" | "split" | "grid";
  alignment: "left" | "center" | "right";

  // Typography
  titleSize: string; // e.g., "48-64px"
  bodySize: string; // e.g., "16-20px"

  // Spacing
  whitespace: "minimal" | "balanced" | "maximum";
  padding: number; // base units (8px)
  gap: number; // base units (8px)

  // Grid
  columns?: number;
  rows?: number;

  // Split layouts: ratio of left column (0.0-1.0), defaults to 0.5 for 50/50
  // Example: 0.3 = 30/70 split, 0.4 = 40/60 split
  splitRatio?: number;

  // Focal point
  focal: "title" | "content" | "media" | "balanced";
};

/**
 * Layout Rules Registry
 *
 * These rules define how each layout type should be composed
 */
export const LAYOUT_RULES: Record<LayoutType, LayoutRule> = {
  center_focus: {
    layoutId: "center_focus",
    composition: "center",
    alignment: "center",
    titleSize: "56-72px",
    bodySize: "20-24px",
    whitespace: "maximum",
    padding: 8, // 64px
    gap: 4, // 32px
    focal: "title",
  },

  two_column: {
    layoutId: "two_column",
    composition: "split",
    alignment: "left",
    titleSize: "40-48px",
    bodySize: "16-20px",
    whitespace: "balanced",
    padding: 6, // 48px
    gap: 4, // 32px
    columns: 2,
    splitRatio: 0.5, // 50/50 split
    focal: "balanced",
  },

  three_column: {
    layoutId: "three_column",
    composition: "grid",
    alignment: "left",
    titleSize: "36-44px",
    bodySize: "14-18px",
    whitespace: "balanced",
    padding: 6, // 48px
    gap: 3, // 24px
    columns: 3,
    focal: "content",
  },

  split_screen: {
    layoutId: "split_screen",
    composition: "split",
    alignment: "center",
    titleSize: "40-48px",
    bodySize: "16-20px",
    whitespace: "balanced",
    padding: 0, // Full bleed
    gap: 0,
    splitRatio: 0.5, // 50/50 split - can be overridden (e.g., 0.4 for 40/60)
    columns: 2,
    focal: "balanced",
  },

  grid_2x2: {
    layoutId: "grid_2x2",
    composition: "grid",
    alignment: "center",
    titleSize: "36-44px",
    bodySize: "14-18px",
    whitespace: "balanced",
    padding: 6, // 48px
    gap: 3, // 24px
    columns: 2,
    rows: 2,
    focal: "content",
  },

  hero_overlay: {
    layoutId: "hero_overlay",
    composition: "center",
    alignment: "center",
    titleSize: "64-80px",
    bodySize: "20-28px",
    whitespace: "maximum",
    padding: 8, // 64px
    gap: 4, // 32px
    focal: "title",
  },

  timeline: {
    layoutId: "timeline",
    composition: "left",
    alignment: "left",
    titleSize: "40-48px",
    bodySize: "16-20px",
    whitespace: "balanced",
    padding: 6, // 48px
    gap: 3, // 24px
    focal: "content",
  },

  stat_highlight: {
    layoutId: "stat_highlight",
    composition: "center",
    alignment: "center",
    titleSize: "80-120px", // Large stat
    bodySize: "16-20px",
    whitespace: "maximum",
    padding: 8, // 64px
    gap: 2, // 16px
    focal: "content",
  },

  image_dominant: {
    layoutId: "image_dominant",
    composition: "center",
    alignment: "center",
    titleSize: "40-48px",
    bodySize: "16-20px",
    whitespace: "minimal",
    padding: 4, // 32px
    gap: 2, // 16px
    focal: "media",
  },
};

/**
 * Get layout rule for a layout type
 */
export function getLayoutRule(layout: LayoutType): LayoutRule {
  return LAYOUT_RULES[layout];
}

/**
 * Slide type to layout mapping
 *
 * Default layout for each slide type
 */
export const SLIDE_TYPE_LAYOUTS: Record<string, LayoutType> = {
  hero: "center_focus",
  section: "center_focus",
  content: "two_column",
  comparison: "split_screen",
  grid: "grid_2x2",
  quote: "center_focus",
  data: "stat_highlight",
  callout: "hero_overlay",
  closing: "center_focus",
};

/**
 * Get default layout for slide type
 */
export function getDefaultLayout(slideType: string): LayoutType {
  return SLIDE_TYPE_LAYOUTS[slideType] || "two_column";
}

/**
 * Register a custom layout rule
 * Allows extending Kyro with custom layouts at runtime
 *
 * @param layoutId - Unique identifier for the layout
 * @param rule - Layout rule configuration
 *
 * @example
 * ```typescript
 * registerLayout("custom_hero", {
 *   layoutId: "custom_hero",
 *   composition: "center",
 *   alignment: "center",
 *   titleSize: "72-96px",
 *   bodySize: "24-32px",
 *   whitespace: "maximum",
 *   padding: 10,
 *   gap: 5,
 *   focal: "title",
 * });
 * ```
 */
export function registerLayout(layoutId: string, rule: LayoutRule): void {
  if (LAYOUT_RULES[layoutId as LayoutType]) {
    console.warn(`[layout-rules] Overriding existing layout: ${layoutId}`);
  }
  (LAYOUT_RULES as Record<string, LayoutRule>)[layoutId] = rule;
}

/**
 * Check if a layout is registered
 */
export function isLayoutRegistered(layoutId: string): boolean {
  return !!LAYOUT_RULES[layoutId as LayoutType];
}
