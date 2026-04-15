/**
 * Slide Renderer
 *
 * Converts LayoutTree → PPTX slide
 */

import type { LayoutTree } from "../types.js";
import { renderNode } from "./node.js";

/**
 * Render a layout tree to a PPTX slide
 *
 * Entry point for rendering a single slide
 */
export function renderSlide(slide: any, layout: LayoutTree): void {
  renderNode(slide, layout.root);
}
