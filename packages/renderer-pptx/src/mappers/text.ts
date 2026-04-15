/**
 * Text Mapper
 *
 * Converts LayoutNode (text) → PPTX text element
 */

import type { TextNode } from "../types.js";
import { pctXtoIn, pctYtoIn } from "../utils/units.js";

/**
 * Render text node to PPTX slide
 */
export function renderText(slide: any, node: TextNode): void {
  const r = node._rect;
  if (!r) {
    throw new Error(`[renderer-pptx] TextNode "${node.id}" has no _rect`);
  }

  slide.addText(node.content, {
    x: pctXtoIn(r.x),
    y: pctYtoIn(r.y),
    w: pctXtoIn(r.width),
    h: pctYtoIn(r.height),

    fontSize: node.text.fontSize,
    fontFace: node.text.fontFamily ?? "Calibri",
    bold: node.text.fontWeight === "bold",
    italic: node.text.italic ?? false,
    color: node.text.color ?? "000000",
    align: node.text.align ?? "left",
    valign: "top",

    lineSpacingMultiple: node.text.lineSpacingMultiple ?? 1.15,

    fill: node.box?.backgroundColor ? { color: node.box.backgroundColor } : undefined,
    line: node.box?.borderColor ? { color: node.box.borderColor, width: node.box.borderWidth ?? 0.5 } : undefined,

    shrinkText: true,
    inset: 0.05,
  });
}
