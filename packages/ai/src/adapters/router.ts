/**
 * LLM Router
 *
 * The brain of Kyro's AI layer
 * Routes requests to the right provider based on strategy
 */

import type { LLMAdapter, LLMRequest, LLMResponse, RoutingStrategy } from "./types.js";

export class LLMRouter {
  private adapters: Map<string, LLMAdapter> = new Map();
  private defaultProvider: string | null = null;

  /**
   * Register an adapter
   */
  register(adapter: LLMAdapter): void {
    this.adapters.set(adapter.name, adapter);

    // Set first available adapter as default
    if (!this.defaultProvider && adapter.isAvailable()) {
      this.defaultProvider = adapter.name;
    }
  }

  /**
   * Get adapter by name
   */
  getAdapter(name: string): LLMAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Get all available adapters
   */
  getAvailableAdapters(): LLMAdapter[] {
    return Array.from(this.adapters.values()).filter((a) => a.isAvailable());
  }

  /**
   * Check if any adapter is available
   */
  hasAvailableAdapter(): boolean {
    return this.getAvailableAdapters().length > 0;
  }

  /**
   * Generate text using specified provider
   */
  async generate(provider: string, request: LLMRequest): Promise<LLMResponse> {
    const adapter = this.adapters.get(provider);

    if (!adapter) {
      throw new Error(`Provider not found: ${provider}. Available: ${Array.from(this.adapters.keys()).join(", ")}`);
    }

    if (!adapter.isAvailable()) {
      throw new Error(`Provider ${provider} is not available. Check API key configuration.`);
    }

    return adapter.generateText(request);
  }

  /**
   * Generate text using smart routing strategy
   */
  async generateSmart(strategy: RoutingStrategy, request: LLMRequest): Promise<LLMResponse> {
    const provider = this.pickProvider(strategy, request);
    return this.generate(provider, request);
  }

  /**
   * Pick provider based on strategy
   */
  private pickProvider(strategy: RoutingStrategy, _request: LLMRequest): string {
    const available = this.getAvailableAdapters();

    if (available.length === 0) {
      throw new Error("No LLM providers available. Set API keys for at least one provider.");
    }

    // If only one available, use it
    if (available.length === 1) {
      return available[0].name;
    }

    switch (strategy) {
      case "speed":
        // Groq is fastest
        return this.findProvider(["groq", "openai", "anthropic"], available);

      case "quality":
        // Anthropic Claude for best reasoning
        return this.findProvider(["anthropic", "openai", "groq"], available);

      case "cost":
        // OpenAI mini or Groq for cheapest
        return this.findProvider(["groq", "openai", "anthropic"], available);

      case "balanced":
        // OpenAI as balanced default
        return this.findProvider(["openai", "anthropic", "groq"], available);

      case "manual":
      default:
        // Use default provider
        return this.defaultProvider || available[0].name;
    }
  }

  /**
   * Find first available provider from preference list
   */
  private findProvider(preferences: string[], available: LLMAdapter[]): string {
    for (const pref of preferences) {
      const adapter = available.find((a) => a.name === pref);
      if (adapter) {
        return adapter.name;
      }
    }
    return available[0].name;
  }

  /**
   * Set default provider
   */
  setDefaultProvider(name: string): void {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new Error(`Provider not found: ${name}`);
    }
    if (!adapter.isAvailable()) {
      throw new Error(`Provider ${name} is not available`);
    }
    this.defaultProvider = name;
  }

  /**
   * Get default provider name
   */
  getDefaultProvider(): string | null {
    return this.defaultProvider;
  }
}
