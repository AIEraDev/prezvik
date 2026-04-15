/**
 * OpenAI Adapter
 *
 * Wraps OpenAI API into Kyro's unified interface
 */

import OpenAI from "openai";
import type { LLMAdapter, LLMRequest, LLMResponse, ProviderConfig } from "./types.js";

export class OpenAIAdapter implements LLMAdapter {
  readonly name = "openai";
  private client: OpenAI | null = null;
  private config: ProviderConfig;

  constructor(config: ProviderConfig = {}) {
    this.config = config;

    // Initialize client if API key available
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        baseURL: config.baseURL,
        timeout: config.timeout,
      });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getDefaultModel(): string {
    return this.config.defaultModel || "gpt-4o-mini";
  }

  async generateText(request: LLMRequest): Promise<LLMResponse> {
    if (!this.client) {
      throw new Error("OpenAI adapter not available. Set OPENAI_API_KEY environment variable.");
    }

    const model = request.model || this.getDefaultModel();

    const response = await this.client.chat.completions.create({
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
      stream: false, // Force non-streaming for now
    });

    // Type guard for non-streaming response
    if ("choices" in response && response.choices) {
      const text = response.choices[0].message.content?.trim() || "";
      const usage = response.usage;

      // Calculate cost (approximate)
      const cost = this.calculateCost(model, usage?.prompt_tokens || 0, usage?.completion_tokens || 0);

      return {
        text,
        usage: usage
          ? {
              inputTokens: usage.prompt_tokens,
              outputTokens: usage.completion_tokens,
              totalCost: cost,
            }
          : undefined,
        raw: response,
        provider: this.name,
        model,
      };
    }

    throw new Error("Unexpected response format from OpenAI");
  }

  /**
   * Calculate approximate cost in USD
   * Prices as of 2024 (update as needed)
   */
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing: Record<string, { input: number; output: number }> = {
      "gpt-4o": { input: 2.5 / 1_000_000, output: 10 / 1_000_000 },
      "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
      "gpt-4-turbo": { input: 10 / 1_000_000, output: 30 / 1_000_000 },
      "gpt-3.5-turbo": { input: 0.5 / 1_000_000, output: 1.5 / 1_000_000 },
    };

    const price = pricing[model] || pricing["gpt-4o-mini"];
    return inputTokens * price.input + outputTokens * price.output;
  }
}
