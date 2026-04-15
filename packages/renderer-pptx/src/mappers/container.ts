/**
 * Container Mapper
 *
 * Handles layout containers (groups of elements)
 */

import type { ContainerNode } from "../types.js";
import { renderNode } from "../renderer/node.js";

/**
 * Render container node to PPTX slide
 *
 * Containers don't render themselves - they just render their children
 */
export function renderContainer(slide: any, node: ContainerNode): void {
  if (!node.children) return;

  // Render all children
  node.children.forEach((child) => renderNode(slide, child));
}
