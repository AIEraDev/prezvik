/**
 * Validation Layer for Blueprint v2
 *
 * Provides validation functions using Zod schemas with clear error formatting
 */

import { ZodError } from "zod";
import { KyroBlueprintSchema, SlideSchema, ContentBlockSchema, type KyroBlueprint, type Slide, type ContentBlock } from "./blueprint.js";

/**
 * Validation result interface
 *
 * Contains the result of a validation operation, including either the
 * validated data or a list of validation errors.
 *
 * @template T - The type of data being validated
 *
 * @example
 * ```typescript
 * const result: ValidationResult<KyroBlueprint> = validateBlueprint(json);
 *
 * if (result.success) {
 *   console.log("Valid Blueprint:", result.data);
 * } else {
 *   console.error("Validation errors:", result.errors);
 * }
 * ```
 */
export interface ValidationResult<T = unknown> {
  /** Whether validation succeeded */
  success: boolean;

  /** Validated data (only present if success is true) */
  data?: T;

  /** Validation errors (only present if success is false) */
  errors?: ValidationError[];
}

/**
 * Validation error interface
 *
 * Represents a single validation error with field path, message, and error code.
 *
 * @example
 * ```typescript
 * const error: ValidationError = {
 *   path: ["slides", "0", "type"],
 *   message: "Must be one of ['hero', 'section', ...], but received 'invalid'",
 *   code: "invalid_enum_value"
 * };
 * ```
 */
export interface ValidationError {
  /** Path to the field that failed validation (e.g., ["slides", "0", "type"]) */
  path: string[];

  /** Human-readable error message */
  message: string;

  /** Zod error code for programmatic handling */
  code: string;
}

/**
 * Validate Blueprint v2 JSON
 *
 * Validates unknown JSON data against the Blueprint v2 schema using Zod.
 * Returns either the validated Blueprint object or a list of validation errors.
 *
 * **Validation Checks:**
 * - Version field is "2.0"
 * - Meta object has required fields (title, goal, tone)
 * - Slides array is present and non-empty
 * - Each slide has valid type, layout, and content
 * - Content blocks match discriminated union types
 *
 * @param json - Unknown JSON data to validate
 * @returns ValidationResult with parsed Blueprint or errors
 *
 * @example
 * ```typescript
 * const result = validateBlueprint(blueprintJSON);
 *
 * if (result.success) {
 *   console.log("Valid Blueprint with", result.data.slides.length, "slides");
 * } else {
 *   console.error("Validation failed:");
 *   result.errors?.forEach(err => {
 *     console.error(`  - ${err.path.join(".")}: ${err.message}`);
 *   });
 * }
 * ```
 */
export function validateBlueprint(json: unknown): ValidationResult<KyroBlueprint> {
  const result = KyroBlueprintSchema.safeParse(json);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: formatZodError(result.error),
  };
}

/**
 * Validate a single slide
 *
 * @param slide - Unknown slide data to validate
 * @returns ValidationResult with parsed Slide or errors
 */
export function validateSlide(slide: unknown): ValidationResult<Slide> {
  const result = SlideSchema.safeParse(slide);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: formatZodError(result.error),
  };
}

/**
 * Validate a content block
 *
 * @param block - Unknown content block data to validate
 * @returns ValidationResult with parsed ContentBlock or errors
 */
export function validateContentBlock(block: unknown): ValidationResult<ContentBlock> {
  const result = ContentBlockSchema.safeParse(block);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: formatZodError(result.error),
  };
}

/**
 * Format Zod errors into readable ValidationError array
 *
 * @param error - ZodError from validation
 * @returns Array of ValidationError with readable paths and messages
 */
export function formatZodError(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    path: err.path.map(String),
    message: generateActionableMessage(err),
    code: err.code,
  }));
}

/**
 * Generate actionable error messages from Zod errors
 *
 * @param err - Individual Zod issue
 * @returns Human-readable, actionable error message
 */
function generateActionableMessage(err: any): string {
  const fieldPath = err.path.length > 0 ? `Field '${err.path.join(".")}'` : "Root";

  switch (err.code) {
    case "invalid_type":
      return `${fieldPath}: Expected ${err.expected}, but received ${err.received}`;

    case "invalid_literal":
      return `${fieldPath}: Must be exactly '${err.expected}'`;

    case "invalid_enum_value":
      const options = err.options.join("', '");
      return `${fieldPath}: Must be one of ['${options}'], but received '${err.received}'`;

    case "too_small":
      if (err.type === "array") {
        return `${fieldPath}: Array must contain at least ${err.minimum} item(s)`;
      }
      if (err.type === "string") {
        return `${fieldPath}: String must be at least ${err.minimum} character(s)`;
      }
      return `${fieldPath}: Value is too small (minimum: ${err.minimum})`;

    case "too_big":
      if (err.type === "array") {
        return `${fieldPath}: Array must contain at most ${err.maximum} item(s)`;
      }
      if (err.type === "string") {
        return `${fieldPath}: String must be at most ${err.maximum} character(s)`;
      }
      return `${fieldPath}: Value is too large (maximum: ${err.maximum})`;

    case "invalid_union":
      return `${fieldPath}: Does not match any of the expected types (discriminated union validation failed)`;

    case "unrecognized_keys":
      const keys = err.keys.join("', '");
      return `${fieldPath}: Unrecognized keys: ['${keys}']`;

    default:
      return `${fieldPath}: ${err.message}`;
  }
}
