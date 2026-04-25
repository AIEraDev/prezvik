/**
 * Serialization utilities for Visual Context
 * Provides JSON serialization and parsing with validation
 */

import type { VisualContext } from "./models/visual-context.js";

/**
 * Serializes a VisualContext object to JSON string
 * @param vc - The VisualContext object to serialize
 * @returns JSON string representation
 */
export function serializeVisualContext(vc: VisualContext): string {
  return JSON.stringify(vc);
}

/**
 * Parses a JSON string to a VisualContext object with validation
 * @param json - The JSON string to parse
 * @returns Parsed VisualContext object
 * @throws Error if JSON is invalid or doesn't match VisualContext schema
 */
export function parseVisualContext(json: string): VisualContext {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Validate the parsed object matches VisualContext schema
  if (!isVisualContext(parsed)) {
    throw new Error("Invalid VisualContext: JSON does not match expected schema");
  }

  return parsed;
}

/**
 * Type guard to validate if an object is a valid VisualContext
 */
function isVisualContext(obj: unknown): obj is VisualContext {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const vc = obj as Record<string, unknown>;

  // Check required top-level properties
  if (vc.version !== "1.0") {
    return false;
  }

  if (!Array.isArray(vc.slides)) {
    return false;
  }

  if (typeof vc.colorPalette !== "object" || vc.colorPalette === null) {
    return false;
  }

  if (typeof vc.theme !== "object" || vc.theme === null) {
    return false;
  }

  if (typeof vc.metadata !== "object" || vc.metadata === null) {
    return false;
  }

  // Validate theme structure
  const theme = vc.theme as Record<string, unknown>;
  if (typeof theme.tone !== "string" || typeof theme.typography !== "object") {
    return false;
  }

  // Validate metadata structure
  const metadata = vc.metadata as Record<string, unknown>;
  if (typeof metadata.generatedAt !== "string" || typeof metadata.layoutTreeHash !== "string" || typeof metadata.themeSpecHash !== "string") {
    return false;
  }

  return true;
}
