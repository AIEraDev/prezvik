/**
 * Kyro Layout Engine
 *
 * Pure function: validated content → positioned elements
 * This is the moat.
 */

// Core engine
export * from "./engine/layout-engine.js";
export * from "./engine/registry.js";

// Layout Engine (Blueprint support)
export * from "./v1/index.js";
export { LayoutEngine, getLayoutEngine } from "./v1/layout-engine.js";

// Types
export * from "./types.js";

// Positioning (flow-based layout)
export * from "./positioning/index.js";

// Polish (visual quality)
export * from "./polish/index.js";

// Layout Rules (spatial validation)
export * from "./rules/index.js";

// Templates (infinite template generation)
export * from "./templates/index.js";

// Primitives
export * from "./primitives/grid.js";
export * from "./primitives/spacing.js";
export * from "./primitives/typography.js";

// Strategies (unified module with content extractor)
export { layoutHero, layoutSection, layoutBulletList, layoutTwoColumn, layoutStatTrio, layoutQuote, layoutComparison, layoutTimeline, layoutGrid, layoutClosing, layoutFallback, extractFromBlocks } from "./strategies/index.js";
export type { ExtractedContent } from "./strategies/content-extractor.js";

// Register all strategies
import { layoutRegistry } from "./engine/registry.js";
import { layoutHero, layoutSection, layoutBulletList, layoutTwoColumn, layoutStatTrio, layoutQuote, layoutComparison, layoutTimeline, layoutGrid, layoutClosing, layoutFallback } from "./strategies/index.js";

layoutRegistry.register("hero", layoutHero);
layoutRegistry.register("section", layoutSection);
layoutRegistry.register("bullet-list", layoutBulletList);
layoutRegistry.register("two-column", layoutTwoColumn);
layoutRegistry.register("stat-trio", layoutStatTrio);
layoutRegistry.register("quote", layoutQuote);
layoutRegistry.register("comparison", layoutComparison);
layoutRegistry.register("timeline", layoutTimeline);
layoutRegistry.register("grid", layoutGrid);
layoutRegistry.register("closing", layoutClosing);
// Fallback for unknown types
layoutRegistry.register("fallback", layoutFallback);
// Legacy aliases
layoutRegistry.register("content", layoutBulletList);
layoutRegistry.register("data", layoutStatTrio);
layoutRegistry.register("callout", layoutQuote);
