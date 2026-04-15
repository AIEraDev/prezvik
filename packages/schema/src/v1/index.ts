/**
 * Kyro Schema v1
 *
 * Core type definitions and validation schemas for deck generation
 *
 * Architecture:
 * - Base schemas (deck, slide) provide structural validation
 * - Type-specific schemas (hero, bullet-list, etc.) provide semantic validation
 * - Validators orchestrate the validation pipeline
 */

// Slide type system (UX LAYER) - PRIMARY EXPORTS
export * from "./slide-types";

// Type-specific validators (CRITICAL LAYER)
export * from "./types";

// Slide schemas
export * from "./slide";

// Deck schemas
export * from "./deck";

// Validators (orchestration layer)
export * from "./validators";

// Legacy exports (deprecated - kept for backwards compatibility)
// Note: enums and content are deprecated in favor of slide-types
export { NarrativeTypes, type NarrativeType } from "./enums";
export * from "./content";
