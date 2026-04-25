/**
 * Generate Command
 *
 * Core value - convert JSON to PPTX
 * Now supports prompt-based generation
 */

import { Command } from "commander";
import { generateDeck } from "@kyro/core";
import { generateDeckFromPrompt } from "@kyro/prompt";
import { loadJSON } from "../utils/load-file.js";
import { log, logError } from "../utils/logger.js";

export const generateCommand = new Command("generate")
  .description("Generate a PowerPoint presentation")
  .argument("[file]", "Deck JSON file (optional if using --prompt)")
  .option("-p, --prompt <text>", "Generate from natural language prompt")
  .option("-o, --output <file>", "Output file", "output.pptx")
  .option("-t, --theme <theme>", "Theme (executive, minimal)", "executive")
  .action(async (file, options) => {
    try {
      let deck;

      // Generate from prompt or load from file
      if (options.prompt) {
        log.info("Generating from prompt...");
        deck = generateDeckFromPrompt(options.prompt);
        log.info(`Created ${deck.slides.length} slides`);
      } else if (file) {
        deck = loadJSON(file);
      } else {
        log.error("Provide either a file or --prompt option");
        process.exit(1);
      }

      // Validate basic structure
      if (!deck.slides || !Array.isArray(deck.slides)) {
        log.error("Invalid deck: missing slides array");
        process.exit(1);
      }

      log.info(`Generating ${deck.slides.length} slides...`);

      // Generate PPTX
      await generateDeck(deck, options.output);

      log.success(`Generated ${options.output}`);
    } catch (error: any) {
      logError(error);
      process.exit(1);
    }
  });
