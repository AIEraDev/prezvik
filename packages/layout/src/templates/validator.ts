/**
 * Template Validator
 *
 * Validates generated templates against Layout Rules Engine.
 *
 * CORE PRINCIPLE:
 * Every generated template must pass spatial validation before
 * being accepted into the template pool.
 *
 * Validation checks:
 * 1. Layout rules compatibility
 * 2. Spatial constraints (no collisions possible)
 * 3. Content capacity feasibility
 * 4. Visual hierarchy achievability
 */

import type { TemplateVariant } from "./types.js";
import { isValidTemplateConfig } from "./primitives.js";

/**
 * Validation result for a single template
 */
export interface TemplateValidationResult {
  /** Whether template passed all checks */
  valid: boolean;
  /** Validation score (0-100) */
  score: number;
  /** List of validation failures */
  failures: ValidationFailure[];
  /** Estimated quality ceiling */
  qualityCeiling: number;
}

/**
 * Validation failure record
 */
export interface ValidationFailure {
  /** Failure type */
  type: string;
  /** Human-readable message */
  message: string;
  /** Severity */
  severity: "error" | "warning";
}

/**
 * Template Validator
 *
 * Validates templates against layout rules
 *
 * @example
 * ```typescript
 * const validator = new TemplateValidator();
 * const result = validator.validate(template);
 *
 * if (result.valid) {
 *   console.log(`Template valid with score ${result.score}`);
 * }
 * ```
 */
export class TemplateValidator {
  /** Minimum acceptable validation score */
  private readonly MIN_SCORE = 60;

  /**
   * Validate a single template
   *
   * @param template - Template to validate
   * @returns Validation result
   */
  validate(template: TemplateVariant): TemplateValidationResult {
    const failures: ValidationFailure[] = [];
    let score = 100;

    // Check 1: Layout-media compatibility
    if (!isValidTemplateConfig(template.baseLayout, template.mediaStrategy)) {
      failures.push({
        type: "invalid_combination",
        message: `Layout "${template.baseLayout}" is incompatible with media strategy "${template.mediaStrategy}"`,
        severity: "error",
      });
      score = 0;
    }

    // Check 2: Content capacity sanity
    if (template.minItems > template.maxItems) {
      failures.push({
        type: "invalid_capacity",
        message: `Min items (${template.minItems}) exceeds max items (${template.maxItems})`,
        severity: "error",
      });
      score = 0;
    }

    // Check 3: Media support consistency
    if (template.mediaStrategy !== "none" && !template.supportsMedia) {
      failures.push({
        type: "media_mismatch",
        message: "Template has media strategy but doesn't support media",
        severity: "error",
      });
      score -= 20;
    }

    // Check 4: Data support consistency
    if (template.emphasis === "data" && !template.supportsData) {
      failures.push({
        type: "data_mismatch",
        message: "Data emphasis but layout doesn't support data",
        severity: "warning",
      });
      score -= 10;
    }

    // Check 5: Density-capacity alignment
    const densityCapacityRatio = template.maxItems / template.minItems;
    if (densityCapacityRatio < 1.2) {
      failures.push({
        type: "low_flexibility",
        message: `Low capacity flexibility (${template.minItems}-${template.maxItems} items)`,
        severity: "warning",
      });
      score -= 5;
    }

    // Check 6: Style tokens sanity
    if (template.styleTokens.fontScale < 0.5 || template.styleTokens.fontScale > 2.0) {
      failures.push({
        type: "extreme_font_scale",
        message: `Extreme font scale: ${template.styleTokens.fontScale}`,
        severity: "warning",
      });
      score -= 15;
    }

    const valid = score >= this.MIN_SCORE && !failures.some((f) => f.severity === "error");

    return {
      valid,
      score: Math.max(0, Math.min(100, score)),
      failures,
      qualityCeiling: this.estimateQualityCeiling(template),
    };
  }

  /**
   * Validate multiple templates
   *
   * @param templates - Templates to validate
   * @returns Validated templates with results
   */
  validateAll(
    templates: TemplateVariant[]
  ): Array<{ template: TemplateVariant; result: TemplateValidationResult }> {
    return templates.map((template) => ({
      template,
      result: this.validate(template),
    }));
  }

  /**
   * Filter to only valid templates
   *
   * @param templates - All generated templates
   * @returns Only valid templates
   */
  filterValid(templates: TemplateVariant[]): TemplateVariant[] {
    return templates.filter((t) => {
      const result = this.validate(t);
      t.isValid = result.valid;
      t.qualityScore = result.score;
      return result.valid;
    });
  }

  /**
   * Estimate quality ceiling for a template
   *
   * Determines the maximum achievable quality score
   * based on template characteristics
   */
  private estimateQualityCeiling(template: TemplateVariant): number {
    let ceiling = 100;

    // Penalize overly constrained templates
    if (template.maxItems - template.minItems < 2) {
      ceiling -= 10; // Low flexibility
    }

    // Penalize extreme densities
    if (template.density === "maximal") {
      ceiling -= 15; // Hard to make dense layouts beautiful
    }

    // Penalize certain layout-media combos
    if (template.baseLayout === "image_dominant" && template.mediaStrategy === "none") {
      ceiling -= 30; // Image-dominant without images
    }

    // Bonus for balanced configurations
    if (template.density === "medium" && template.spacing === "balanced") {
      ceiling += 5;
    }

    return Math.max(50, Math.min(100, ceiling));
  }

  /**
   * Check if template can support specific content
   *
   * @param template - Template to check
   * @param itemCount - Number of content items
   * @param hasMedia - Whether content has media
   * @returns Whether template can support the content
   */
  canSupportContent(
    template: TemplateVariant,
    itemCount: number,
    hasMedia: boolean
  ): boolean {
    // Check capacity
    if (itemCount < template.minItems || itemCount > template.maxItems) {
      return false;
    }

    // Check media requirement
    if (hasMedia && !template.supportsMedia) {
      return false;
    }

    return true;
  }
}
