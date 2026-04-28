/**
 * Blueprint Generator
 *
 * Converts user intent → Prezvik Blueprint IR
 * Template-driven - deterministic, fast
 */

import type { PrezVikBlueprint } from "@prezvik/schema";
import { detectIntent } from "./intent-detector.js";
import { pitchTemplate } from "./templates/pitch.js";
import { reportTemplate } from "./templates/report.js";
import { educationalTemplate } from "./templates/educational.js";

/**
 * Generate blueprint from prompt
 */
export function generateBlueprint(prompt: string): PrezVikBlueprint {
  // Detect intent
  const intent = detectIntent(prompt);

  // Select template
  let template;
  switch (intent.type) {
    case "pitch":
      template = pitchTemplate;
      break;
    case "report":
      template = reportTemplate;
      break;
    case "educational":
      template = educationalTemplate;
      break;
    default:
      template = pitchTemplate;
  }

  // Generate blueprint from template
  return template(intent);
}
