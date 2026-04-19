/**
 * Kyro Template Agent
 *
 * Infinite template generation with bounded constraints.
 *
 * CORE PRINCIPLE:
 * Generate thousands of template variations by combining:
 * - 7 base layouts (center_focus, two_column, etc.)
 * - 5 density levels
 * - 4 visual emphases
 * - 4 media strategies
 * - 3 spacing systems
 *
 * All templates are validated by Layout Rules Engine before acceptance.
 *
 * @example
 * ```typescript
 * const agent = new TemplateAgent();
 * const templates = agent.generateTemplates({
 *   contentType: "pitch",
 *   itemCount: 5,
 *   hasMedia: true
 * });
 *
 * // Get best validated template
 * const best = agent.selectBestTemplate(templates, content);
 * ```
 */

export { TemplateAgent, createTemplateAgent } from "./agent.js";
export { TemplateGenerator } from "./generator.js";
export { TemplateValidator } from "./validator.js";
export { TemplateRanker } from "./ranker.js";

export type { TemplateVariant, TemplateConfig, TemplateGenerationOptions, TemplateSelectionCriteria, ContentProfile, TemplateScore } from "./types.js";

// Base layout primitives (the "physics")
export { BASE_LAYOUTS, DENSITY_LEVELS, VISUAL_EMPHASIS, MEDIA_STRATEGIES, SPACING_SYSTEMS, calculateTemplatePossibilities } from "./primitives.js";
