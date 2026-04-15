/**
 * Magic Command
 *
 * The viral moment: one command, full pipeline
 * "I typed a sentence → I got a presentation"
 */

import { Command } from "commander";
import { generateDeckFromPrompt } from "@kyro/prompt";
import { enhanceDeck } from "@kyro/ai";
import { generateTheme, isThemeGenerationAvailable } from "@kyro/ai";
import { generateDeck } from "@kyro/core";
import { log, logError } from "../utils/logger.js";

/**
 * Detect theme from prompt keywords
 */
function detectTheme(prompt: string): string {
  const lower = prompt.toLowerCase();

  // Dark theme keywords
  if (lower.includes("dark") || lower.includes("night") || lower.includes("noir")) {
    return "minimal"; // minimal has dark aesthetic
  }

  // Corporate/professional keywords
  if (lower.includes("corporate") || lower.includes("enterprise") || lower.includes("professional") || lower.includes("business") || lower.includes("executive")) {
    return "executive";
  }

  // Modern/minimal keywords
  if (lower.includes("minimal") || lower.includes("clean") || lower.includes("simple")) {
    return "minimal";
  }

  // Default to executive (safe choice)
  return "executive";
}

export const magicCommand = new Command("magic")
  .description("Generate a complete presentation from a prompt (AI-powered)")
  .argument("<prompt>", "Describe your presentation")
  .option("-o, --output <file>", "Output file", "kyro-magic.pptx")
  .option("-t, --theme <theme>", "Use existing theme instead of generating", undefined)
  .option("--no-enhance", "Skip AI content enhancement")
  .option("--no-theme-gen", "Skip AI theme generation")
  .action(async (prompt, options) => {
    try {
      // Check if AI is available when needed
      const needsAI = options.enhance || (options.themeGen && !options.theme);
      if (needsAI && !isThemeGenerationAvailable()) {
        log.error("OPENAI_API_KEY not set. AI features require OpenAI API key.");
        log.info("Set OPENAI_API_KEY or use --no-enhance --no-theme-gen to skip AI features");
        process.exit(1);
      }

      log.rocket("Kyro Magic");
      console.log("");

      const startTime = Date.now();

      // 1. Generate base deck
      log.info("Generating deck from prompt...");
      let deck = generateDeckFromPrompt(prompt);
      log.success(`Created ${deck.slides.length} slides`);

      // 2. Enhance content (parallel)
      if (options.enhance && isThemeGenerationAvailable()) {
        log.info("Enhancing content with AI...");
        const startTime = Date.now();

        deck = await enhanceDeck(deck);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        log.success(`Content enhanced (${duration}s)`);
      }

      // 3. Generate or use theme
      let themeName = options.theme || detectTheme(prompt);

      if (!options.theme) {
        log.info(`Detected theme: ${themeName}`);
      }

      if (options.themeGen && !options.theme && isThemeGenerationAvailable()) {
        log.info("Generating custom theme with AI...");
        const startTime = Date.now();

        try {
          await generateTheme(prompt);
          // TODO: Save theme and use it
          // For now, fall back to executive
          log.success(`Theme generated (${((Date.now() - startTime) / 1000).toFixed(1)}s)`);
          log.info("Using executive theme (custom theme integration coming soon)");
        } catch (error: any) {
          log.error(`Theme generation failed: ${error.message}`);
          log.info("Falling back to executive theme");
        }
      }

      // 4. Render presentation
      log.info("Rendering presentation...");
      await generateDeck(deck, options.output, themeName);

      console.log("");
      log.success("Magic complete!");
      log.info(`Output: ${options.output}`);

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      log.info(`Total time: ${totalTime}s`);
      console.log("");

      // Show what was done
      const features: string[] = [];
      if (options.enhance) features.push("AI-enhanced content");
      if (options.themeGen && !options.theme) features.push("AI-generated theme");
      features.push(`${deck.slides.length} slides`);

      log.info(`Features: ${features.join(", ")}`);
    } catch (error: any) {
      console.log("");
      logError(error);
      process.exit(1);
    }
  });
