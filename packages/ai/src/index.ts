/**
 * Prezvik AI Package
 *
 * Model-agnostic AI infrastructure using Vercel AI SDK:
 * 1. Provider layer (OpenAI, Anthropic, Groq, etc.)
 * 2. Domain-specific AI (theme generation, content enhancement)
 * 3. Blueprint generation
 */

// High-level Prezvik AI interface
export * from "./prezvik-ai.js";

// Model Router (task-aware model selection)
export { MODEL_ROUTER, getModelConfig } from "./model-router.js";
export type { TaskType, Strategy, ModelConfig } from "./model-router.js";

// Providers
export * from "./providers/index.js";

// Theme generation
export { generateTheme, isThemeGenerationAvailable } from "./theme/generator.js";
export * from "./theme/validator.js";
export * from "./theme/normalizer.js";

// Content intelligence
export { rewriteText, rewriteTexts } from "./content/rewrite.js";
export * from "./content/enhancer.js";
export * from "./content/summarizer.js";
export * from "./content/scorer.js";

// Blueprint generation
export { BlueprintGenerator, BlueprintGenerationError } from "./blueprint/generator.js";
export type { BlueprintGeneratorOptions } from "./blueprint/generator.js";
