/**
 * Groq Adapter
 *
 * Wraps Groq API (fast inference) into Kyro's unified interface
 */

import Groq from "groq-sdk";
import type { LLMAdapter, LLMRequest, LLMResponse, ProviderConfig } from "./types.js";

export class GroqAdapter implements LLMAdapter {
  readonly name = "groq";
  private client: Groq | null = null;
  private config: ProviderConfig;

  constructor(config: ProviderConfig = {}) {
    this.config = config;

    // Initialize client if API key available
    const apiKey = config.apiKey || process.env.GROQ_API_KEY;
    if (apiKey) {
      this.client = new Groq({
        apiKey,
      });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getDefaultModel(): string {
    return this.config.defaultModel || "llama-3.3-70b-versatile";
  }

  async generateText(request: LLMRequest): Promise<LLMResponse> {
    if (!this.client) {
      throw new Error("Groq adapter not available. Set GROQ_API_KEY environment variable.");
    }

    const model = request.model || this.getDefaultModel();

    const response = await this.client.chat.completions.create({
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
    });

    const text = response.choices[0].message.content?.trim() || "";
    const usage = response.usage;

    // Groq is very cheap - approximate pricing
    const cost = usage ? (usage.prompt_tokens * 0.05 + usage.completion_tokens * 0.08) / 1_000_000 : 0;

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
}
