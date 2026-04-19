#!/usr/bin/env node
/**
 * Debug background color through pipeline stages
 * Run: node debug-bg.ts
 */

import { getTheme } from "./packages/design/dist/themes/index.js";
import { ThemeResolver } from "./packages/design/dist/theme-resolver.js";

console.log("=== BACKGROUND DEBUG TRACE ===\n");

// Stage 1: Theme Definition
console.log("STAGE 1: Theme Definition");
const theme = getTheme("executive");
console.log("  Theme ID:", theme.id);
console.log("  Background from theme.colors.background:", theme.colors.background);
console.log("  Has background?", !!theme.colors.background);
console.log("  Is 6-char hex?", /^[0-9A-Fa-f]{6}$/.test(theme.colors.background || ""));

// Stage 2: ThemeResolver
console.log("\nSTAGE 2: ThemeResolver.applyToTree()");
const resolver = new ThemeResolver();
const mockTree = {
  root: {
    type: "container" as const,
    id: "test",
    layout: { direction: "vertical" as const, gap: 10 },
    children: []
  }
};
console.log("  Input tree.background:", (mockTree as any).background);

const themedTrees = resolver.apply([mockTree], "executive");
const themed = themedTrees[0];
console.log("  Output themed.background:", (themed as any).background);
console.log("  Background preserved?", !!(themed as any).background);

// Stage 3: Polish (simulated)
console.log("\nSTAGE 3: Layout Polish");
const polished = { ...themed, root: themed.root };
console.log("  After polish spread:", (polished as any).background);

// Stage 4: Positioning (simulated)
console.log("\nSTAGE 4: Positioning");
const positioned = { ...polished };
console.log("  After positioning spread:", (positioned as any).background);

console.log("\n=== SUMMARY ===");
const hasBg = !!(positioned as any).background;
console.log(hasBg ? "✅ Background preserved through pipeline" : "❌ Background LOST in pipeline");
console.log("Final background value:", (positioned as any).background || "UNDEFINED");
