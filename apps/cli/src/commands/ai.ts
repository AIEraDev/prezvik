/**
 * AI Command
 *
 * Test and compare AI providers
 */

import { Command } from "commander";
import { getRouter } from "@kyro/ai";
import { log, logError } from "../utils/logger.js";

export const aiCommand = new Command("ai").description("AI provider management and testing");

// List available providers
aiCommand
  .command("list")
  .description("List available AI providers")
  .action(() => {
    const router = getRouter();
    const available = router.getAvailableAdapters();

    if (available.length === 0) {
      log.error("No AI providers available");
      log.info("Set API keys:");
      log.info("  OPENAI_API_KEY - OpenAI (gpt-4o-mini, gpt-4o)");
      log.info("  ANTHROPIC_API_KEY - Anthropic (claude-3-5-sonnet, claude-3-5-haiku)");
      log.info("  GROQ_API_KEY - Groq (llama-3.3-70b, fast inference)");
      return;
    }

    log.success(`${available.length} provider(s) available:`);
    console.log("");

    for (const adapter of available) {
      log.info(`✓ ${adapter.name} (default model: ${adapter.getDefaultModel()})`);
    }

    const defaultProvider = router.getDefaultProvider();
    if (defaultProvider) {
      console.log("");
      log.info(`Default: ${defaultProvider}`);
    }
  });

// Test a provider
aiCommand
  .command("test")
  .description("Test AI provider with a simple prompt")
  .argument("[prompt]", "Test prompt", "Hello, world!")
  .option("-p, --provider <name>", "Provider to test (openai, anthropic, groq)")
  .option("-s, --strategy <strategy>", "Routing strategy (cost, speed, quality, balanced)", "balanced")
  .action(async (prompt, options) => {
    try {
      const router = getRouter();

      if (!router.hasAvailableAdapter()) {
        log.error("No AI providers available. Set API keys.");
        return;
      }

      log.info(`Testing with prompt: "${prompt}"`);
      console.log("");

      const request = {
        messages: [{ role: "user" as const, content: prompt }],
        temperature: 0.7,
        maxTokens: 100,
      };

      const startTime = Date.now();

      const response = options.provider ? await router.generate(options.provider, request) : await router.generateSmart(options.strategy, request);

      const duration = Date.now() - startTime;

      log.success("Response:");
      console.log(response.text);
      console.log("");

      log.info(`Provider: ${response.provider}`);
      log.info(`Model: ${response.model}`);
      log.info(`Time: ${duration}ms`);

      if (response.usage) {
        log.info(`Tokens: ${response.usage.inputTokens} in, ${response.usage.outputTokens} out`);
        if (response.usage.totalCost) {
          log.info(`Cost: $${response.usage.totalCost.toFixed(6)}`);
        }
      }
    } catch (error: any) {
      logError(error);
    }
  });

// Compare providers
aiCommand
  .command("compare")
  .description("Compare all available providers with the same prompt")
  .argument("<prompt>", "Test prompt")
  .action(async (prompt) => {
    try {
      const router = getRouter();
      const available = router.getAvailableAdapters();

      if (available.length === 0) {
        log.error("No AI providers available");
        return;
      }

      log.info(`Comparing ${available.length} provider(s) with prompt:`);
      log.info(`"${prompt}"`);
      console.log("");

      const request = {
        messages: [{ role: "user" as const, content: prompt }],
        temperature: 0.7,
        maxTokens: 100,
      };

      for (const adapter of available) {
        log.info(`Testing ${adapter.name}...`);

        const startTime = Date.now();
        const response = await router.generate(adapter.name, request);
        const duration = Date.now() - startTime;

        console.log("");
        console.log(`  Response: ${response.text}`);
        console.log(`  Model: ${response.model}`);
        console.log(`  Time: ${duration}ms`);

        if (response.usage) {
          console.log(`  Tokens: ${response.usage.inputTokens} in, ${response.usage.outputTokens} out`);
          if (response.usage.totalCost) {
            console.log(`  Cost: $${response.usage.totalCost.toFixed(6)}`);
          }
        }

        console.log("");
      }
    } catch (error: any) {
      logError(error);
    }
  });

// Set default provider
aiCommand
  .command("set-default")
  .description("Set default AI provider")
  .argument("<provider>", "Provider name (openai, anthropic, groq)")
  .action((provider) => {
    try {
      const router = getRouter();
      router.setDefaultProvider(provider);
      log.success(`Default provider set to: ${provider}`);
    } catch (error: any) {
      logError(error);
    }
  });
