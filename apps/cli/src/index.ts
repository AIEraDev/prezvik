#!/usr/bin/env node

/**
 * Prezvik CLI
 *
 * AI-native presentation engine
 * Dead simple, fast, opinionated, immediately useful
 */

import "dotenv/config";
import { program } from "commander";
import { generateCommand } from "./commands/generate.js";
import { initCommand } from "./commands/init.js";
import { devCommand } from "./commands/dev.js";
import { validateCommand } from "./commands/validate.js";
import { magicCommand } from "./commands/magic.js";
import { aiCommand } from "./commands/ai.js";

program.name("prezvik").description("AI-native presentation engine").version("0.1.0");

// Commands
program.addCommand(magicCommand); // Magic first - it's the star
program.addCommand(aiCommand); // AI provider management
program.addCommand(initCommand);
program.addCommand(generateCommand);
program.addCommand(validateCommand);
program.addCommand(devCommand);

program.parse();
