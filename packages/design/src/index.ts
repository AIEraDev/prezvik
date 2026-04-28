/**
 * Prezvik Design System
 *
 * Token-based theme architecture
 * - Tokens: Design primitives (colors, typography, spacing)
 * - Themes: Token compositions (executive, minimal, modern)
 * - ThemeSpec: AI-driven theme specifications with decorations
 * - ThemeAgent: AI-powered theme generation
 * - Vocabulary: Constrained design language for AI reasoning
 * - PaletteEngine: Intelligent color derivation
 * - BackgroundGenerator: SVG-based background rendering
 */

// Tokens (foundation)
export * from "./tokens/index.js";

// Themes (product layer)
export * from "./themes/index.js";

// ThemeSpec (AI-driven theme specifications)
export * from "./theme-spec.js";
export * from "./static-themes.js";
export * from "./theme-agent.js";

// AI-friendly design vocabulary
export * from "./vocabulary.js";
export * from "./palette-engine.js";
export * from "./background-generator.js";
