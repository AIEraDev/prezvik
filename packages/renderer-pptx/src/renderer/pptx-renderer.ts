/**
 * PPTX Renderer - FIXED
 *
 * Dumb executor: receives resolved LayoutTree with _rect computed
 * Zero positioning logic lives here
 */

import PptxGenJS from "pptxgenjs";
import type { LayoutTree, LayoutNode, TextNode, ImageNode, ShapeNode } from "../types.js";
import { pctXtoIn, pctYtoIn } from "../utils/units.js";

// Minimum dimension to prevent invalid EMU values (Google Slides compatibility)
const MIN_DIMENSION_PCT = 1.0; // 1% minimum

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

    // Background color - FORCE TEST COLOR
    console.log(`[pptx-renderer] Slide background: ${tree.background || "undefined"}`);
    if (tree.background) {
      slide.background = { color: tree.background };
      console.log(`[pptx-renderer] Applied background: ${tree.background}`);
    } else {
      // Force test color to verify pptxgenjs works
      slide.background = { color: "FF0000" }; // RED for testing
      console.log(`[pptx-renderer] Applied TEST RED background`);
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

  // Enforce minimum dimensions to prevent invalid EMU values
  const width = Math.max(r.width, MIN_DIMENSION_PCT);
  const height = Math.max(r.height, MIN_DIMENSION_PCT);

  slide.addText(node.content, {
    x: pctXtoIn(r.x),
    y: pctYtoIn(r.y),
    w: pctXtoIn(width),
    h: pctYtoIn(height),

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
 * Validate image URL
 * Returns true if URL is valid and supported
 */
function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === "") {
    return false;
  }
  // Support http/https URLs and data URIs
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image/");
}

/**
 * Render image node
 */
function renderImage(slide: any, node: ImageNode): void {
  const r = assertRect(node);

  // Validate image URL
  if (!isValidImageUrl(node.src)) {
    console.warn(`[pptx-renderer] Invalid or unsupported image URL: ${node.src?.substring(0, 50)}... Rendering placeholder.`);
    // Render placeholder shape instead
    slide.addShape("rect", {
      x: pctXtoIn(r.x),
      y: pctYtoIn(r.y),
      w: pctXtoIn(Math.max(r.width, MIN_DIMENSION_PCT)),
      h: pctYtoIn(Math.max(r.height, MIN_DIMENSION_PCT)),
      fill: { color: "E5E7EB" }, // Light gray placeholder
      line: { color: "9CA3AF", width: 1 },
    });
    // Add placeholder text
    slide.addText("[Image]", {
      x: pctXtoIn(r.x),
      y: pctYtoIn(r.y + r.height / 2 - 5),
      w: pctXtoIn(Math.max(r.width, MIN_DIMENSION_PCT)),
      h: pctYtoIn(10),
      fontSize: 10,
      color: "6B7280",
      align: "center",
    });
    return;
  }

  // Enforce minimum dimensions to prevent invalid EMU values
  const width = Math.max(r.width, MIN_DIMENSION_PCT);
  const height = Math.max(r.height, MIN_DIMENSION_PCT);

  const sizing = node.objectFit === "contain" ? { type: "contain" as const, w: pctXtoIn(width), h: pctYtoIn(height) } : node.objectFit === "cover" ? { type: "cover" as const, w: pctXtoIn(width), h: pctYtoIn(height) } : undefined;

  try {
    slide.addImage({
      path: node.src.startsWith("data:") ? undefined : node.src,
      data: node.src.startsWith("data:") ? node.src : undefined,
      x: pctXtoIn(r.x),
      y: pctYtoIn(r.y),
      w: pctXtoIn(width),
      h: pctYtoIn(height),
      sizing,
    });
  } catch (error) {
    console.warn(`[pptx-renderer] Failed to render image: ${node.src?.substring(0, 50)}... Error: ${error}`);
    // Render fallback placeholder
    slide.addShape("rect", {
      x: pctXtoIn(r.x),
      y: pctYtoIn(r.y),
      w: pctXtoIn(width),
      h: pctYtoIn(height),
      fill: { color: "FEE2E2" }, // Light red error placeholder
      line: { color: "EF4444", width: 1 },
    });
  }
}

/**
 * Render shape node
 */
function renderShape(slide: any, node: ShapeNode): void {
  const r = assertRect(node);

  // Enforce minimum dimensions to prevent invalid EMU values
  const width = Math.max(r.width, MIN_DIMENSION_PCT);
  const height = Math.max(r.height, MIN_DIMENSION_PCT);

  const shapeType = mapShape(node.shape);

  slide.addShape(shapeType, {
    x: pctXtoIn(r.x),
    y: pctYtoIn(r.y),
    w: pctXtoIn(width),
    h: pctYtoIn(height),
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
