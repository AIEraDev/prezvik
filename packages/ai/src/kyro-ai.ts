/**
 * Kyro AI
 *
 * High-level AI interface for Kyro-specific tasks
 * Wraps the adapter layer with domain-specific methods
 */

import { getRouter } from "./adapters/index.js";
import type { LLMRequest, RoutingStrategy } from "./adapters/types.js";

export class KyroAI {
  private router = getRouter();

  /**
   * Generate slide deck from prompt
   */
  async generateSlideDeck(prompt: string, options: { provider?: string; strategy?: RoutingStrategy } = {}): Promise<string> {
    const request: LLMRequest = {
      messages: [
        {
          role: "system",
          content: "You are a presentation expert. Generate structured slide content in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    };

    const response = options.provider ? await this.router.generate(options.provider, request) : await this.router.generateSmart(options.strategy || "balanced", request);

    return response.text;
  }

  /**
   * Enhance slide content
   */
  async enhanceContent(content: string, options: { provider?: string; strategy?: RoutingStrategy } = {}): Promise<string> {
    const request: LLMRequest = {
      messages: [
        {
          role: "system",
          content: "You are a presentation expert. Improve slide content for clarity and impact.",
        },
        {
          role: "user",
          content: `Enhance this slide content:\n\n${content}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 500,
    };

    const response = options.provider ? await this.router.generate(options.provider, request) : await this.router.generateSmart(options.strategy || "quality", request);

    return response.text;
  }

  /**
   * Generate theme from description
   */
  async generateTheme(description: string, options: { provider?: string; strategy?: RoutingStrategy } = {}): Promise<any> {
    const request: LLMRequest = {
      messages: [
        {
          role: "system",
          content: "You are a design system expert. Generate theme JSON with colors, typography, and spacing.",
        },
        {
          role: "user",
          content: `Generate a theme for: ${description}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    };

    const response = options.provider ? await this.router.generate(options.provider, request) : await this.router.generateSmart(options.strategy || "quality", request);

    return JSON.parse(response.text);
  }

  /**
   * Summarize text
   */
  async summarize(text: string, maxLength: number = 100, options: { provider?: string; strategy?: RoutingStrategy } = {}): Promise<string> {
    const request: LLMRequest = {
      messages: [
        {
          role: "user",
          content: `Summarize this in ${maxLength} characters or less:\n\n${text}`,
        },
      ],
      temperature: 0.5,
      maxTokens: 200,
    };

    const response = options.provider ? await this.router.generate(options.provider, request) : await this.router.generateSmart(options.strategy || "speed", request);

    return response.text;
  }

  /**
   * Score content quality
   */
  async scoreContent(text: string, options: { provider?: string; strategy?: RoutingStrategy } = {}): Promise<{ score: number; feedback: string }> {
    const request: LLMRequest = {
      messages: [
        {
          role: "user",
          content: `Score this presentation text from 1-10 for quality. Return JSON: { score: number, feedback: string }\n\n"${text}"`,
        },
      ],
      temperature: 0.3,
      maxTokens: 200,
    };

    const response = options.provider ? await this.router.generate(options.provider, request) : await this.router.generateSmart(options.strategy || "quality", request);

    return JSON.parse(response.text);
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return this.router.getAvailableAdapters().map((a) => a.name);
  }

  /**
   * Check if any provider is available
   */
  isAvailable(): boolean {
    return this.router.hasAvailableAdapter();
  }

  /**
   * Set default provider
   */
  setDefaultProvider(name: string): void {
    this.router.setDefaultProvider(name);
  }
}

/**
 * Global instance
 */
let globalKyroAI: KyroAI | null = null;

/**
 * Get global Kyro AI instance
 */
export function getKyroAI(): KyroAI {
  if (!globalKyroAI) {
    globalKyroAI = new KyroAI();
  }
  return globalKyroAI;
}
