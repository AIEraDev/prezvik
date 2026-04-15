/**
 * Anthropic Adapter
 *
 * Wraps Anthropic API into Kyro's unified interface
 */

import Anthropic from "@anthropic-ai/sdk";
import type { LLMAdapter, LLMRequest, LLMResponse, ProviderConfig } from "./types.js";

export class AnthropicAdapter implements LLMAdapter {
  readonly name = "anthropic";
  private client: Anthropic | null = null;
  private config: ProviderConfig;

  constructor(config: ProviderConfig = {}) {
    this.config = config;

    // Initialize client if API key available
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({
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
    return this.config.defaultModel || "claude-3-5-sonnet-20241022";
  }

  async generateText(request: LLMRequest): Promise<LLMResponse> {
    if (!this.client) {
      throw new Error("Anthropic adapter not available. Set ANTHROPIC_API_KEY environment variable.");
    }

    const model = request.model || this.getDefaultModel();

    // Anthropic requires system message separate
    const systemMessage = request.messages.find((m) => m.role === "system");
    const messages = request.messages.filter((m) => m.role !== "system");

    const response = await this.client.messages.create({
      model,
      system: systemMessage?.content,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      max_tokens: request.maxTokens ?? 1024,
      temperature: request.temperature ?? 0.7,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Calculate cost
    const cost = this.calculateCost(model, response.usage.input_tokens, response.usage.output_tokens);

    return {
      text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalCost: cost,
      },
      raw: response,
      provider: this.name,
      model,
    };
  }

  /**
   * Calculate approximate cost in USD
   * Prices as of 2024 (update as needed)
   */
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing: Record<string, { input: number; output: number }> = {
      "claude-3-5-sonnet-20241022": { input: 3 / 1_000_000, output: 15 / 1_000_000 },
      "claude-3-5-haiku-20241022": { input: 0.8 / 1_000_000, output: 4 / 1_000_000 },
      "claude-3-opus-20240229": { input: 15 / 1_000_000, output: 75 / 1_000_000 },
    };

    const price = pricing[model] || pricing["claude-3-5-sonnet-20241022"];
    return inputTokens * price.input + outputTokens * price.output;
  }
}
