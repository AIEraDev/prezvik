/**
 * LLM Adapter Layer
 *
 * Model-agnostic AI infrastructure for Kyro
 * Any LLM → same interface → interchangeable at runtime
 */

export * from "./types.js";
export * from "./openai.js";
export * from "./anthropic.js";
export * from "./groq.js";
export * from "./router.js";

// Convenience: Create pre-configured router
import { LLMRouter } from "./router.js";
import { OpenAIAdapter } from "./openai.js";
import { AnthropicAdapter } from "./anthropic.js";
import { GroqAdapter } from "./groq.js";

/**
 * Create router with all available adapters
 */
export function createRouter(): LLMRouter {
  const router = new LLMRouter();

  // Register all adapters
  router.register(new OpenAIAdapter());
  router.register(new AnthropicAdapter());
  router.register(new GroqAdapter());

  return router;
}

/**
 * Global router instance (singleton)
 */
let globalRouter: LLMRouter | null = null;

/**
 * Get global router instance
 */
export function getRouter(): LLMRouter {
  if (!globalRouter) {
    globalRouter = createRouter();
  }
  return globalRouter;
}
