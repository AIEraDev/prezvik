/**
 * Dev Command
 *
 * Watch mode - this is what makes devs stay
 * Edit JSON → auto regenerate slides
 */

import { Command } from "commander";
import chokidar from "chokidar";
import { generateDeck } from "@kyro/core";
import { loadJSON } from "../utils/load-file.js";
import { log, logError } from "../utils/logger.js";

export const devCommand = new Command("dev")
  .description("Watch mode - auto-regenerate on file changes")
  .argument("<file>", "Deck JSON file")
  .option("-o, --output <file>", "Output file", "output.pptx")
  .option("-t, --theme <theme>", "Theme (executive, minimal)", "executive")
  .action((file, options) => {
    log.watch(`Watching ${file} for changes...`);
    log.info(`Output: ${options.output}`);
    log.info(`Theme: ${options.theme}`);
    console.log("");

    // Initial generation
    generate(file, options);

    // Watch for changes
    const watcher = chokidar.watch(file, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on("change", () => {
      console.log("");
      log.reload("File changed, regenerating...");
      generate(file, options);
    });

    // Handle exit
    process.on("SIGINT", () => {
      console.log("");
      log.info("Stopping watch mode");
      watcher.close();
      process.exit(0);
    });
  });

async function generate(file: string, options: any) {
  try {
    const deck = loadJSON(file);

    if (!deck.slides || !Array.isArray(deck.slides)) {
      log.error("Invalid deck: missing slides array");
      return;
    }

    await generateDeck(deck, options.output);
    log.success(`Generated ${options.output} (${deck.slides.length} slides)`);
  } catch (error: any) {
    logError(error);
  }
}
