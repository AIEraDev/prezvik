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
  const defaultBounds: Frame = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  };

  const positioned = layoutFlow(tree.root, bounds ?? defaultBounds);

  return {
    ...tree,
    root: positioned,
  };
}
