/**
 * PPTX Renderer - FIXED
 *
 * Dumb executor: receives resolved LayoutTree with _rect computed
 * Zero positioning logic lives here
 */

import PptxGenJS from "pptxgenjs";
import type { LayoutTree, LayoutNode, TextNode, ImageNode, ShapeNode } from "../types.js";
import { pctXtoIn, pctYtoIn } from "../utils/units.js";

/**
 * Entry point: render layout trees to PPTX
 *
 * Contract: All nodes MUST have _rect computed by layout engine
 */
export async function renderPPTX(slides: LayoutTree[]): Promise<PptxGenJS> {
  const pptx = new PptxGenJS();

  // 10" × 5.625" — must match SLIDE_WIDTH_IN / SLIDE_HEIGHT_IN
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Kyro";

  for (const tree of slides) {
    const slide = pptx.addSlide();

    // Background color
    if (tree.background) {
      slide.background = { color: tree.background };
    }

    // Render node tree
    renderNode(slide, tree.root);
  }

  return pptx;
}

/**
 * Render and save to file
 */
export async function renderPPTXToFile(slides: LayoutTree[], fileName: string = "output.pptx"): Promise<void> {
  const pptx = await renderPPTX(slides);
  await pptx.writeFile({ fileName });
}

/**
 * Node dispatcher
 */
function renderNode(slide: any, node: LayoutNode): void {
  switch (node.type) {
    case "text":
      renderText(slide, node);
      break;

    case "image":
      renderImage(slide, node);
      break;

    case "shape":
      renderShape(slide, node);
      break;

    case "container":
      node.children.forEach((child) => renderNode(slide, child));
      break;
  }
}

/**
 * Render text node
 */
function renderText(slide: any, node: TextNode): void {
  const r = assertRect(node);

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
    align: mapAlign(node.text.align),
    valign: "top",

    // Line spacing as multiple (pptxgenjs uses spacingMultiple)
    lineSpacingMultiple: node.text.lineSpacingMultiple ?? 1.15,

    // Box styles
    fill: node.box?.backgroundColor ? { color: node.box.backgroundColor } : undefined,
    line: node.box?.borderColor ? { color: node.box.borderColor, width: node.box.borderWidth ?? 0.5 } : undefined,

    // Shrink overflow rather than clipping silently
    shrinkText: true,

    // Inset so text never touches box edge
    inset: 0.05,
  });
}

/**
 * Render image node
 */
function renderImage(slide: any, node: ImageNode): void {
  const r = assertRect(node);

  const sizing = node.objectFit === "contain" ? { type: "contain" as const, w: pctXtoIn(r.width), h: pctYtoIn(r.height) } : node.objectFit === "cover" ? { type: "cover" as const, w: pctXtoIn(r.width), h: pctYtoIn(r.height) } : undefined;

  slide.addImage({
    path: node.src.startsWith("data:") ? undefined : node.src,
    data: node.src.startsWith("data:") ? node.src : undefined,
    x: pctXtoIn(r.x),
    y: pctYtoIn(r.y),
    w: pctXtoIn(r.width),
    h: pctYtoIn(r.height),
    sizing,
  });
}

/**
 * Render shape node
 */
function renderShape(slide: any, node: ShapeNode): void {
  const r = assertRect(node);
  const shapeType = mapShape(node.shape);

  slide.addShape(shapeType, {
    x: pctXtoIn(r.x),
    y: pctYtoIn(r.y),
    w: pctXtoIn(r.width),
    h: pctYtoIn(r.height),
    fill: node.fill ? { color: node.fill } : { type: "none" },
    line: node.stroke ? { color: node.stroke, width: node.strokeWidth ?? 0.5 } : undefined,
  });
}

/**
 * Assert node has computed rectangle
 *
 * Enforces contract: layout engine MUST compute _rect before rendering
 */
function assertRect(node: LayoutNode) {
  if (!node._rect) {
    throw new Error(`[renderer-pptx] Node "${node.id}" has no _rect. ` + `Did you forget to call resolveLayout() before rendering?`);
  }
  return node._rect;
}

/**
 * Map text alignment
 */
function mapAlign(align?: string): "left" | "center" | "right" {
  if (align === "center" || align === "right") return align;
  return "left";
}

/**
 * Map shape type to pptxgenjs shape name
 */
function mapShape(shape: ShapeNode["shape"]): string {
  const map: Record<ShapeNode["shape"], string> = {
    rect: "rect",
    ellipse: "ellipse",
    line: "line",
    "rounded-rect": "roundRect",
  };
  return map[shape] ?? "rect";
}
