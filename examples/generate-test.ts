/**
 * Test Script: Generate PPTX from test deck
 *
 * Full pipeline test:
 * Schema → Layout → PPTX
 */

import { generateDeck } from "../packages/core/src/deck";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 SlideForge PPTX Generation Test\n");

  // Load test deck
  const deckPath = path.join(__dirname, "test-deck.json");
  const deck = JSON.parse(fs.readFileSync(deckPath, "utf-8"));

  console.log(`📄 Loaded deck with ${deck.slides.length} slides`);
  console.log("");

  // Generate PPTX
  const outputPath = path.join(__dirname, "output.pptx");

  console.log("⚙️  Generating layouts...");
  console.log("🎨 Applying adaptive logic...");
  console.log("📊 Rendering PPTX...");

  await generateDeck(deck, outputPath);

  console.log("");
  console.log(`✅ Generated: ${outputPath}`);
  console.log("");
  console.log("🎯 Pipeline complete:");
  console.log("   Schema → Validation → Layout → PPTX");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
