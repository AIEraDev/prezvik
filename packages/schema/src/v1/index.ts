/**
 * Prezvik Schema
 *
 * Core type definitions and validation schemas for presentation generation
 *
 * Architecture:
 * - Blueprint: The primary IR format for presentations
 * - Validator: Zod-based validation for Blueprint structures
 * - Layout Rules: Layout configuration for different slide types
 * - Theme: Design token system for theme-aware generation
 */

// Blueprint schema (PRIMARY EXPORTS)
export * from "./blueprint.js";

// Layout rules
export * from "./layout-rules.js";

// Theme v1 schema
export * from "./theme.js";

// Template v1 schema
export * from "./template.js";

// Validator
export * from "./validator.js";
