/**
 * Example: Testing the validation pipeline
 *
 * This demonstrates the power of type-specific validation
 */

import { parseDeck, getSupportedSlideTypes } from "../packages/schema/src/v1";
import * as fs from "fs";

// Load example deck
const deckData = JSON.parse(fs.readFileSync("./basic-deck.json", "utf-8"));

console.log("🧪 Testing SlideForge Validation Pipeline\n");

// Show supported slide types
console.log("✅ Supported slide types:");
getSupportedSlideTypes().forEach((type) => {
  console.log(`   - ${type}`);
});
console.log("");

// Parse and validate the deck
try {
  const validatedDeck = parseDeck(deckData);
  console.log("✅ Deck validation passed!");
  console.log(`   Title: ${validatedDeck.meta.title}`);
  console.log(`   Slides: ${validatedDeck.slides.length}`);
  console.log("");

  // Show each slide type
  validatedDeck.slides.forEach((slide, i) => {
    console.log(`   Slide ${i + 1}: ${slide.type}`);
  });
} catch (error) {
  console.error("❌ Validation failed:", error);
}

// Test invalid data
console.log("\n🧪 Testing invalid stat-trio (should fail):\n");
try {
  parseDeck({
    version: "1.0",
    meta: { title: "Test" },
    slides: [
      {
        id: "test",
        type: "stat-trio",
        content: {
          stats: [
            { label: "Metric 1", value: "100" },
            { label: "Metric 2", value: "200" },
            // Missing 3rd stat - should fail!
          ],
        },
      },
    ],
  });
  console.log("❌ Should have failed but didn't!");
} catch (error: any) {
  console.log("✅ Correctly rejected invalid data");
  console.log(`   Reason: ${error.errors?.[0]?.message || error.message}`);
}

console.log("\n🎯 This is compiler-level architecture for decks!");
