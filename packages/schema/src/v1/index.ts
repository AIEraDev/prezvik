/**
 * Kyro Schema
 *
 * Core type definitions and validation schemas for presentation generation
 *
 * Architecture:
 * - Blueprint: The primary IR format for presentations
 * - Validator: Zod-based validation for Blueprint structures
 * - Layout Rules: Layout configuration for different slide types
 */

// Blueprint schema (PRIMARY EXPORTS)
export * from "./blueprint.js";

// Layout rules
export * from "./layout-rules.js";

// Validator
export * from "./validator.js";
