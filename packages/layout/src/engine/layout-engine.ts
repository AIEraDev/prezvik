/**
 * Layout Engine - FLOW-BASED
 *
 * All intelligence lives here
 * Uses flow-based positioning (no manual x/y coordinates)
 */

import type { LayoutTree } from "../types.js";
import { layoutFlow } from "../positioning/flow.js";
import type { Frame } from "../positioning/frame.js";

/**
 * Resolve layout tree using flow-based positioning
 *
 * This is the entry point - converts structure to positioned elements
 * MUST be called before rendering
 */
export function resolveLayout(tree: LayoutTree, bounds?: Frame): LayoutTree {
  console.log(`            [resolveLayout] START - computing positions for ${(tree.root as any)?.children?.length || 0} children`);

  const defaultBounds: Frame = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  };

  const targetBounds = bounds ?? defaultBounds;
  console.log(`            [resolveLayout] Bounds: ${targetBounds.width}% x ${targetBounds.height}% at (${targetBounds.x}%, ${targetBounds.y}%)`);

  const positioned = layoutFlow(tree.root, targetBounds);

  // Count positioned nodes
  const countNodes = (node: any): number => {
    if (!node) return 0;
    if (node.type === "container" && node.children) {
      return 1 + node.children.reduce((sum: number, child: any) => sum + countNodes(child), 0);
    }
    return 1;
  };

  console.log(`            [resolveLayout] COMPLETED - positioned ${countNodes(positioned)} nodes`);

  return {
    ...tree,
    root: positioned,
  };
}
