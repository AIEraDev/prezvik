/**
 * Polish Layer
 *
 * The last 20% that creates 80% of perceived quality
 * Runs after layout + positioning + theme, before rendering
 *
 * Pipeline: Layout → Position → Theme → 🧼 Polish → Render
 */

import type { LayoutTree, LayoutNode } from "../types.js";
import { enforceHierarchy } from "./hierarchy.js";
import { applyVerticalRhythm, normalizeSpacing } from "./rhythm.js";
import { balanceLayout } from "./balance.js";
import { normalizePadding, addBreathingRoom, preventExcessiveWhitespace } from "./whitespace.js";

export * from "./hierarchy.js";
export * from "./rhythm.js";
export * from "./balance.js";
export * from "./whitespace.js";
export * from "./clamp.js";

/**
 * Apply all polish operations to a layout tree
 *
 * This is the main entry point - composes all polish operations
 */
export function polishLayout(tree: LayoutTree): LayoutTree {
  console.log(`          [polishLayout] START - root type: ${tree.root?.type}, children: ${(tree.root as any)?.children?.length || 0}`);

  let result = tree.root;

  // 1. Enforce hierarchy (clear visual levels)
  console.log(`          [polishLayout] 1. Enforcing hierarchy...`);
  result = enforceHierarchy(result);

  // 2. Normalize padding (prevent cramped layouts)
  console.log(`          [polishLayout] 2. Normalizing padding...`);
  result = normalizePadding(result, 4);

  // 3. Add breathing room (prevent dense content)
  console.log(`          [polishLayout] 3. Adding breathing room...`);
  result = addBreathingRoom(result);

  // 4. Prevent excessive whitespace (keep it tight)
  console.log(`          [polishLayout] 4. Preventing excessive whitespace...`);
  result = preventExcessiveWhitespace(result, 12);

  // 5. Normalize spacing (harmonic scale)
  console.log(`          [polishLayout] 5. Normalizing spacing...`);
  result = normalizeSpacing(result);

  // 6. Apply vertical rhythm (baseline grid)
  console.log(`          [polishLayout] 6. Applying vertical rhythm...`);
  result = applyVerticalRhythm(result, 4);

  // 7. Balance layout (visual stability)
  console.log(`          [polishLayout] 7. Balancing layout...`);
  result = balanceLayout(result);

  console.log(`          [polishLayout] COMPLETED`);
  return {
    ...tree,
    root: result,
  };
}

/**
 * Apply polish to a single node (for testing)
 */
export function polishNode(node: LayoutNode): LayoutNode {
  let result = node;

  result = enforceHierarchy(result);
  result = normalizePadding(result, 4);
  result = addBreathingRoom(result);
  result = preventExcessiveWhitespace(result, 12);
  result = normalizeSpacing(result);
  result = applyVerticalRhythm(result, 4);
  result = balanceLayout(result);

  return result;
}
