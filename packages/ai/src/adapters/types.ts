/**
 * LLM Adapter Types
 *
 * Unified interface for all LLM providers
 * This is the contract - everything normalizes to this
 */

/**
 * Message format (normalized across all providers)
 */
export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Request format (what Kyro sends to adapters)
 */
export type LLMRequest = {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
  stream?: boolean;
  metadata?: Record<string, any>;
};

/**
 * Response format (what adapters return to Kyro)
 */
export type LLMResponse = {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalCost?: number; // USD
  };
  raw?: unknown; // Provider-specific response
  provider?: string;
  model?: string;
};

/**
 * Adapter interface (every provider must implement this)
 */
export interface LLMAdapter {
  /**
   * Provider name (e.g., "openai", "anthropic", "groq")
   */
  readonly name: string;

  /**
   * Generate text from messages
   */
  generateText(request: LLMRequest): Promise<LLMResponse>;

  /**
   * Check if adapter is available (API key set, etc.)
   */
  isAvailable(): boolean;

  /**
   * Get default model for this provider
   */
  getDefaultModel(): string;
}

/**
 * Routing strategy
 */
export type RoutingStrategy = "cost" | "speed" | "quality" | "balanced" | "manual";

/**
 * Provider configuration
 */
export type ProviderConfig = {
  apiKey?: string;
  baseURL?: string;
  defaultModel?: string;
  timeout?: number;
};
