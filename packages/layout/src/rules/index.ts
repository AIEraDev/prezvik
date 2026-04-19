/**
 * Kyro Layout Rules Engine v1
 *
 * Spatial validation and quality scoring for layout trees.
 *
 * CORE PRINCIPLE:
 * Layouts must satisfy spatial constraints before rendering:
 * - No overlapping nodes
 * - Balanced whitespace
 * - Proper visual hierarchy
 * - Readable typography
 *
 * This engine validates positioned layouts and assigns quality scores,
 * enabling template ranking and automatic layout correction.
 *
 * @example
 * ```typescript
 * const rules = new LayoutRulesEngine();
 * const result = rules.validate(tree);
 *
 * if (result.valid) {
 *   console.log(`Quality score: ${result.qualityScore}`);
 * } else {
 *   console.log('Violations:', result.violations);
 * }
 * ```
 */

export { LayoutRulesEngine } from "./engine.js";
export { CollisionDetector } from "./collision.js";
export { WhitespaceAnalyzer } from "./whitespace.js";
export { HierarchyChecker } from "./hierarchy.js";
export { QualityScorer } from "./quality.js";

export type {
  LayoutValidationResult,
  LayoutViolation,
  CollisionReport,
  WhitespaceBalance,
  HierarchyCheck,
  QualityScore,
  SpatialBounds,
} from "./types.js";
