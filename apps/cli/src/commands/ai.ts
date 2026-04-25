/**
 * AI Command
 *
 * Test AI providers using KyroAI (Vercel AI SDK)
 */

import { Command } from "commander";
import { KyroAI } from "@kyro/ai";
import { log, logError } from "../utils/logger.js";

export const aiCommand = new Command("ai").description("AI provider management and testing");

// List available providers
aiCommand
  .command("list")
  .description("List available AI providers")
  .action(() => {
    const kyroAI = new KyroAI();
    const available = kyroAI.getAvailableProviders();

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

    for (const provider of available) {
      const model = provider === "openai" ? "gpt-4o" : provider === "anthropic" ? "claude-3-5-sonnet-20241022" : "llama-3.3-70b-versatile";
      log.info(`✓ ${provider} (default model: ${model})`);
    }
  });

// Test a provider
aiCommand
  .command("test")
  .description("Test AI provider with a simple prompt")
  .argument("[prompt]", "Test prompt", "Hello, world!")
  .option("-p, --provider <name>", "Provider to test (openai, anthropic, groq)")
  .action(async (prompt, options) => {
    try {
      const kyroAI = new KyroAI();

      if (!kyroAI.isAvailable()) {
        log.error("No AI providers available. Set API keys.");
        return;
      }

      log.info(`Testing with prompt: "${prompt}"`);
      console.log("");

      const startTime = Date.now();

      // Use summarize as a simple test
      const result = await kyroAI.summarize(prompt, 100, {
        provider: options.provider,
        temperature: 0.7,
        maxTokens: 100,
      });

      const duration = Date.now() - startTime;

      log.success("Response:");
      console.log(result);
      console.log("");

      log.info(`Provider: ${options.provider || "openai"}`);
      log.info(`Time: ${duration}ms`);
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
      const kyroAI = new KyroAI();
      const available = kyroAI.getAvailableProviders();

      if (available.length === 0) {
        log.error("No AI providers available");
        return;
      }

      log.info(`Comparing ${available.length} provider(s) with prompt:`);
      log.info(`"${prompt}"`);
      console.log("");

      for (const providerName of available) {
        log.info(`Testing ${providerName}...`);

        const startTime = Date.now();
        const result = await kyroAI.summarize(prompt, 100, {
          provider: providerName,
          temperature: 0.7,
          maxTokens: 100,
        });
        const duration = Date.now() - startTime;

        console.log("");
        console.log(`  Response: ${result}`);
        console.log(`  Time: ${duration}ms`);
        console.log("");
      }
    } catch (error: any) {
      logError(error);
    }
  });

// Set default provider (deprecated with Vercel SDK)
aiCommand
  .command("set-default")
  .description("Set default AI provider (deprecated - select provider per call with Vercel SDK)")
  .argument("<provider>", "Provider name (openai, anthropic, groq)")
  .action((_provider) => {
    console.warn("setDefaultProvider is deprecated with Vercel AI SDK");
    log.info("Select provider per call using the --provider option instead");
  });
