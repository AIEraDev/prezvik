/**
 * Model Router
 *
 * Task-aware model selection per Claude's recommendations
 * Maps tasks to optimal models for speed/balanced/quality
 */

export type TaskType = "blueprint" | "theme" | "enhance" | "summarize" | "score";
export type Strategy = "speed" | "balanced" | "quality";

export interface ModelConfig {
  provider: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Task-aware model router
 *
 * Groq LPU delivers 200-350 tokens/second - 3-10x faster than GPU providers
 * Google Gemini: 1,500 requests/day free tier (vs Groq's 1,000)
 */
export const MODEL_ROUTER: Record<TaskType, Record<Strategy, ModelConfig>> = {
  // Blueprint generation — needs quality + large output
  blueprint: {
    speed: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 4000, temperature: 0.7 },
    balanced: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 4000, temperature: 0.7 },
    quality: { provider: "anthropic", model: "claude-haiku-4-5", maxTokens: 4000, temperature: 0.7 },
  },
  // ThemeAgent — small JSON, speed wins
  theme: {
    speed: { provider: "groq", model: "llama-3.1-8b-instant", maxTokens: 800, temperature: 0.7 },
    balanced: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 1000, temperature: 0.7 },
    quality: { provider: "anthropic", model: "claude-haiku-4-5", maxTokens: 1000, temperature: 0.7 },
  },
  // Content enhancement — medium quality, small output
  enhance: {
    speed: { provider: "groq", model: "llama-3.1-8b-instant", maxTokens: 500, temperature: 0.7 },
    balanced: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 500, temperature: 0.7 },
    quality: { provider: "anthropic", model: "claude-haiku-4-5", maxTokens: 500, temperature: 0.7 },
  },
  // Summarize — small output, speed matters
  summarize: {
    speed: { provider: "groq", model: "llama-3.1-8b-instant", maxTokens: 200, temperature: 0.5 },
    balanced: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 200, temperature: 0.5 },
    quality: { provider: "anthropic", model: "claude-haiku-4-5", maxTokens: 200, temperature: 0.5 },
  },
  // Score content — small output, structured
  score: {
    speed: { provider: "groq", model: "llama-3.1-8b-instant", maxTokens: 200, temperature: 0.3 },
    balanced: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 200, temperature: 0.3 },
    quality: { provider: "anthropic", model: "claude-haiku-4-5", maxTokens: 200, temperature: 0.3 },
  },
};

/**
 * Get model configuration for a task and strategy
 */
export function getModelConfig(task: TaskType, strategy: Strategy = "speed", overrideProvider?: string): ModelConfig {
  // If provider is overridden, use it with the strategy's token/temp settings
  if (overrideProvider) {
    const baseConfig = MODEL_ROUTER[task][strategy];
    return {
      ...baseConfig,
      provider: overrideProvider,
      model: getDefaultModelForProvider(overrideProvider, task),
    };
  }
  return MODEL_ROUTER[task][strategy];
}

/**
 * Get default model for a provider
 */
function getDefaultModelForProvider(provider: string, task: TaskType): string {
  const defaults: Record<string, Record<TaskType, string>> = {
    groq: {
      blueprint: "llama-3.3-70b-versatile",
      theme: "llama-3.1-8b-instant",
      enhance: "llama-3.1-8b-instant",
      summarize: "llama-3.1-8b-instant",
      score: "llama-3.1-8b-instant",
    },
    anthropic: {
      blueprint: "claude-haiku-4-5",
      theme: "claude-haiku-4-5",
      enhance: "claude-haiku-4-5",
      summarize: "claude-haiku-4-5",
      score: "claude-haiku-4-5",
    },
    openai: {
      blueprint: "gpt-4o",
      theme: "gpt-4o",
      enhance: "gpt-4o",
      summarize: "gpt-4o",
      score: "gpt-4o",
    },
  };

  return defaults[provider]?.[task] || defaults.groq[task];
}
