/**
 * Kyro AI Package
 *
 * Model-agnostic AI infrastructure:
 * 1. Adapter layer (OpenAI, Anthropic, Groq, etc.)
 * 2. Smart routing (cost, speed, quality, balanced)
 * 3. Domain-specific AI (theme generation, content enhancement)
 */

// Adapter layer (THE FOUNDATION)
export * from "./adapters/index.js";

// High-level Kyro AI interface
export * from "./kyro-ai.js";

// Theme generation (v1 - OpenAI only, for backwards compatibility)
export { generateTheme as generateThemeV1, isThemeGenerationAvailable as isThemeGenerationAvailableV1 } from "./theme/generator.js";
export * from "./theme/validator.js";
export * from "./theme/normalizer.js";

// Theme generation (v2 - model-agnostic, RECOMMENDED)
export { generateTheme, isThemeGenerationAvailable } from "./theme/generator-v2.js";

// Content intelligence (v1 - OpenAI only, for backwards compatibility)
export { rewriteText as rewriteTextV1, rewriteTexts as rewriteTextsV1 } from "./content/rewrite.js";
export * from "./content/enhancer.js";
export * from "./content/summarizer.js";
export * from "./content/scorer.js";

// Content intelligence (v2 - model-agnostic, RECOMMENDED)
export { rewriteText, rewriteTexts } from "./content/rewrite-v2.js";

// Blueprint generation
export { BlueprintGenerator, BlueprintGenerationError } from "./blueprint/generator.js";
export type { BlueprintGeneratorOptions } from "./blueprint/generator.js";
