/**
 * Kyro Layout Engine
 *
 * Pure function: validated content → positioned elements
 * This is the moat.
 */

// Core engine
export * from "./engine/layout-engine.js";
export * from "./engine/registry.js";

// V2 Engine (Blueprint v2 support)
export * from "./v2/index.js";

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

// Strategies
export { layoutHero } from "./strategies/hero.js";
export { layoutStatTrio } from "./strategies/stat-trio.js";
export { layoutBulletList } from "./strategies/bullet-list.js";
export { layoutTwoColumn } from "./strategies/two-column.js";

// Register all strategies
import { layoutRegistry } from "./engine/registry.js";
import { layoutHero } from "./strategies/hero.js";
import { layoutStatTrio } from "./strategies/stat-trio.js";
import { layoutBulletList } from "./strategies/bullet-list.js";
import { layoutTwoColumn } from "./strategies/two-column.js";

layoutRegistry.register("hero", layoutHero);
layoutRegistry.register("stat-trio", layoutStatTrio);
layoutRegistry.register("bullet-list", layoutBulletList);
layoutRegistry.register("two-column", layoutTwoColumn);
