/**
 * Kyro Prompt Package
 *
 * Structured prompt compiler: Natural language → DeckSchema
 */

// Main generator
export * from "./generator.js";

// Parser utilities
export * from "./parser/intent.js";
export * from "./parser/extract.js";
export * from "./parser/normalize.js";

// Templates
export * from "./templates/pitch.js";
export * from "./templates/report.js";
export * from "./templates/educational.js";
