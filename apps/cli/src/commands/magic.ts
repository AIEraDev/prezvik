/**
 * Magic Command
 *
 * The viral moment: one command, full pipeline
 * "I typed a sentence → I got a presentation"
 */

import { Command } from "commander";
import { getPipeline, type PipelineOptions } from "@prezvik/core";
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
  .option("-o, --output <file>", "Output file", "prezvik-magic.pptx")
  .option("-t, --theme <theme>", "Theme name (executive, minimal, modern)", undefined)
  .option("--provider <name>", "AI provider (openai, anthropic, groq)", process.env.PREZVIK_DEFAULT_PROVIDER)
  .action(async (prompt, options) => {
    try {
      log.rocket("Prezvik Magic");
      console.log("");

      const startTime = Date.now();

      // Detect theme if not specified
      const themeName = options.theme || detectTheme(prompt);

      // Build pipeline options
      const pipelineOptions: PipelineOptions = {
        outputPath: options.output,
        themeName,
        provider: options.provider,
      };

      // Execute pipeline
      log.info("Starting pipeline...");
      console.log("");

      const pipeline = getPipeline();
      await pipeline.execute(prompt, pipelineOptions);

      // Log completion
      console.log("");
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      log.success("Magic complete!");
      log.info(`Output: ${options.output}`);
      log.info(`Total time: ${totalTime}s`);
      console.log("");
    } catch (error: any) {
      console.log("");
      logError(error);
      process.exit(1);
    }
  });
