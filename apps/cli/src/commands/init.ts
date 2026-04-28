/**
 * Init Command
 *
 * Create a starter deck - this is the growth hack
 * Gets devs from zero to value in 30 seconds
 */

import { Command } from "commander";
import { writeJSON } from "../utils/load-file.js";
import { log } from "../utils/logger.js";

export const initCommand = new Command("init")
  .description("Create a starter deck")
  .option("-o, --output <file>", "Output file", "deck.json")
  .action((options) => {
    const template = {
      version: "1.0",
      meta: {
        title: "My First Deck",
        author: "Prezvik",
      },
      slides: [
        {
          id: "slide-1",
          type: "hero",
          content: {
            title: "Welcome to Prezvik",
            subtitle: "Generate professional slides with code",
          },
        },
        {
          id: "slide-2",
          type: "bullet-list",
          content: {
            title: "Why Prezvik?",
            bullets: ["Type-safe schema validation", "Adaptive layout engine", "Professional design system", "Flow-based positioning", "Visual polish layer"],
          },
        },
        {
          id: "slide-3",
          type: "stat-trio",
          content: {
            title: "Quick Stats",
            stats: [
              { label: "Build Time", value: "<1s" },
              { label: "Type Safety", value: "100%" },
              { label: "Slide Types", value: "10" },
            ],
          },
        },
      ],
    };

    writeJSON(options.output, template);
    log.success(`Created ${options.output}`);
    log.info(`Run: prezvik generate ${options.output}`);
  });
