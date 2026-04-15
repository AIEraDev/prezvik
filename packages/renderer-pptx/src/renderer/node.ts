/**
 * Core Node Renderer
 *
 * Dispatches LayoutNode to appropriate mapper
 */

import type { LayoutNode, TextNode, ContainerNode } from "../types.js";
import { renderText } from "../mappers/text.js";
import { renderContainer } from "../mappers/container.js";

/**
 * Render a layout node to PPTX slide
 *
 * This is the core dispatcher - routes nodes to appropriate mappers
 */
export function renderNode(slide: any, node: LayoutNode): void {
  switch (node.type) {
    case "text":
      renderText(slide, node as TextNode);
      break;

    case "container":
      renderContainer(slide, node as ContainerNode);
      break;

    case "image":
      // TODO: Implement image rendering
      break;

    case "shape":
      // TODO: Implement shape rendering
      break;

    default:
      // Unknown node type - skip
      break;
  }
}
