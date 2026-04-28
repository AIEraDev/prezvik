/**
 * Node Renderer
 *
 * Traverse LayoutNode tree and render to Google Slides
 */

import type { LayoutNode, TextNode, ContainerNode } from "@prezvik/layout";
import { renderText } from "../mappers/text.js";

/**
 * Render a layout node to Google Slides
 *
 * Recursively traverses the tree and dispatches to appropriate mappers
 */
export async function renderNode(presentationId: string, slideId: string, node: LayoutNode): Promise<void> {
  // Render based on node type
  if (node.type === "text") {
    await renderText(presentationId, slideId, node as TextNode);
  }

  // Recursively render children
  if (node.type === "container") {
    const containerNode = node as ContainerNode;
    if (containerNode.children) {
      for (const child of containerNode.children) {
        await renderNode(presentationId, slideId, child);
      }
    }
  }

  // TODO: Handle image and shape nodes
}
