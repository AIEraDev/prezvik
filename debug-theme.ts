/**
 * Debug script to trace theme background through pipeline layers
 * Run: npx ts-node debug-theme.ts
 */

import { getTheme } from "./packages/design/src/themes/index.js";
import { ThemeResolver } from "./packages/design/src/theme-resolver.js";
import type { LayoutTree } from "./packages/layout/src/types.js";

// Layer 1: Check theme definition
console.log("=== LAYER 1: Theme Definition ===");
const theme = getTheme("executive");
console.log("Theme ID:", theme.id);
console.log("Background color:", theme.colors.background);
console.log("Has background?", !!theme.colors.background);

// Layer 2: Check ThemeResolver applies background
console.log("\n=== LAYER 2: ThemeResolver ===");
const resolver = new ThemeResolver();
const mockTree: LayoutTree = {
  root: {
    type: "container",
    id: "test",
    layout: { direction: "vertical" },
    children: []
  }
};
console.log("Input tree has background?", "background" in mockTree, mockTree.background);
const themedTrees = resolver.apply([mockTree], "executive");
const themed = themedTrees[0];
console.log("Output tree has background?", "background" in themed, themed.background);

// Layer 3: Check with stripHash
console.log("\n=== LAYER 3: Color Format ===");
console.log("Theme background:", theme.colors.background);
console.log("Expected (no #):", theme.colors.background?.replace("#", ""));

// Layer 4: Check hex format validation
const bg = theme.colors.background || "";
console.log("\n=== LAYER 4: Hex Validation ===");
console.log("Has # prefix?", bg.startsWith("#"));
console.log("Length with #:", bg.length);
console.log("6-digit hex?", /^[0-9A-Fa-f]{6}$/.test(bg.replace("#", "")));

// Test pptxgenjs compatibility
console.log("\n=== LAYER 5: PPTX Compatibility ===");
const cleanBg = bg.replace("#", "");
console.log("For pptxgenjs:", cleanBg);
console.log("Is valid?", /^[0-9A-Fa-f]{6}$/.test(cleanBg));
