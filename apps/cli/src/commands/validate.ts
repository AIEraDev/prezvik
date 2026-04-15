/**
 * Validate Command
 *
 * Dev confidence - check schema before generating
 */

import { Command } from "commander";
import { loadJSON } from "../utils/load-file.js";
import { log, logError } from "../utils/logger.js";

export const validateCommand = new Command("validate")
  .description("Validate a deck JSON file")
  .argument("<file>", "Deck JSON file")
  .action((file) => {
    try {
      const deck = loadJSON(file);

      // Basic validation
      if (!deck.slides || !Array.isArray(deck.slides)) {
        log.error("Invalid deck: missing slides array");
        process.exit(1);
      }

      if (deck.slides.length === 0) {
        log.error("Invalid deck: no slides");
        process.exit(1);
      }

      // Validate each slide
      for (const slide of deck.slides) {
        if (!slide.type) {
          log.error(`Invalid slide ${slide.id}: missing type`);
          process.exit(1);
        }

        if (!slide.content) {
          log.error(`Invalid slide ${slide.id}: missing content`);
          process.exit(1);
        }
      }

      log.success(`Valid deck with ${deck.slides.length} slides`);

      // Show slide types
      const types = deck.slides.map((s: any) => s.type);
      const uniqueTypes = [...new Set(types)];
      log.info(`Slide types: ${uniqueTypes.join(", ")}`);
    } catch (error: any) {
      logError(error);
      process.exit(1);
    }
  });
