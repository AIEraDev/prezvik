/**
 * File Loading Utilities
 */

import * as fs from "fs";
import { log } from "./logger.js";

/**
 * Load and parse JSON file
 */
export function loadJSON(filePath: string): any {
  if (!fs.existsSync(filePath)) {
    log.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error: any) {
    log.error(`Failed to parse JSON: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Write JSON file
 */
export function writeJSON(filePath: string, data: any): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error: any) {
    log.error(`Failed to write file: ${error.message}`);
    process.exit(1);
  }
}
