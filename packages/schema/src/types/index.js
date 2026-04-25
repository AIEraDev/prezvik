/**
 * Type-specific validators registry
 *
 * This is the critical layer that makes validation dynamic and extensible.
 * Each slide type owns its own validation rules.
 */
import { HeroContentSchema } from "./hero";
import { BulletListContentSchema } from "./bullet-list";
import { StatTrioContentSchema } from "./stat-trio";
import { TwoColumnContentSchema } from "./two-column";
/**
 * Slide type validators registry
 *
 * Maps slide type strings to their Zod validators
 * This becomes the foundation for:
 * - Dynamic validation
 * - Layout engine mapping
 * - Type-safe content handling
 */
export const SlideTypeValidators = {
    hero: HeroContentSchema,
    "bullet-list": BulletListContentSchema,
    "stat-trio": StatTrioContentSchema,
    "two-column": TwoColumnContentSchema,
};
/**
 * Re-export all type schemas
 */
export * from "./hero";
export * from "./bullet-list";
export * from "./stat-trio";
export * from "./two-column";
//# sourceMappingURL=index.js.map