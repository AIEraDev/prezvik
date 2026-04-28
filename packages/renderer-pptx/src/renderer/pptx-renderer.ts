/**
 * PPTX Renderer - FIXED
 *
 * Dumb executor: receives resolved LayoutTree with _rect computed
 * Zero positioning logic lives here
 */

import PptxGenJS from "pptxgenjs";
import type { LayoutTree, LayoutNode, TextNode, ImageNode, ShapeNode } from "../types.js";
import type { ThemeSpec, SlideTheme, BackgroundStyle } from "@prezvik/design";
import { DecorationEngine } from "../decoration-engine.js";
import { pctXtoIn, pctYtoIn } from "../utils/units.js";

// Minimum dimension to prevent invalid EMU values (Google Slides compatibility)
const MIN_DIMENSION_PCT = 1.0; // 1% minimum

/**
 * Entry point: render layout trees to PPTX
 *
 * Contract: All nodes MUST have _rect computed by layout engine
 */
export async function renderPPTX(slides: LayoutTree[], themeSpec?: ThemeSpec): Promise<PptxGenJS> {
  console.log(`    [renderPPTX] Starting PPTX generation for ${slides.length} slides...`);

  if (themeSpec) {
    console.log(`    [renderPPTX] ========== THEME SPEC RECEIVED ==========`);
    console.log(`    [renderPPTX] Primary: ${themeSpec.palette.primary}`);
    console.log(`    [renderPPTX] Secondary: ${themeSpec.palette.secondary}`);
    console.log(`    [renderPPTX] Dark BG: ${themeSpec.palette.darkBg}`);
    console.log(`    [renderPPTX] Light BG: ${themeSpec.palette.lightBg}`);
    console.log(`    [renderPPTX] Display Font: ${themeSpec.typography.displayFont}`);
    console.log(`    [renderPPTX] Body Font: ${themeSpec.typography.bodyFont}`);
    console.log(`    [renderPPTX] Slide Rhythm: ${themeSpec.slideRhythm.length} slides`);
    console.log(`    [renderPPTX] ============================================`);
  } else {
    console.log(`    [renderPPTX] WARNING: No ThemeSpec provided!`);
  }

  console.log(`    [renderPPTX] Creating PptxGenJS instance...`);

  const pptx = new PptxGenJS();
  const decorationEngine = new DecorationEngine();

  console.log(`    [renderPPTX] PptxGenJS instance created, decoration engine ready`);

  // 10" × 5.625" — must match SLIDE_WIDTH_IN / SLIDE_HEIGHT_IN
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Prezvik";
  console.log(`    [renderPPTX] Layout set to LAYOUT_WIDE`);

  for (let i = 0; i < slides.length; i++) {
    const tree = slides[i];
    console.log(`    [renderPPTX] Processing slide ${i + 1}/${slides.length}...`);
    const slide = pptx.addSlide();
    console.log(`    [renderPPTX] Slide ${i + 1} added to presentation`);

    // Get slide theme from ThemeSpec by index
    const slideTheme = themeSpec?.slideRhythm[i];

    // Background color from themeSpec or fallback to tree.background
    if (slideTheme && themeSpec) {
      // Check if this slide needs a generated background image
      const IMAGE_STYLES: BackgroundStyle[] = ["dark-geometric", "gradient-diagonal", "dark-gradient", "mesh-vivid", "noise-overlay", "split-panel", "brand-saturated"];
      const needsBackgroundImage = IMAGE_STYLES.includes(slideTheme.backgroundStyle);

      if (needsBackgroundImage) {
        // Generate background image with geometric shapes
        console.log(`    [renderPPTX] Slide ${i + 1}: Generating background image (${slideTheme.backgroundStyle})`);
        try {
          const { BackgroundGenerator } = await import("@prezvik/design");
          const bgGenerator = new BackgroundGenerator();
          const base64Bg = await bgGenerator.generate({
            style: slideTheme.backgroundStyle,
            palette: themeSpec.palette,
            slideType: tree.slideId ?? "content",
          });

          // Apply as image background
          slide.background = { data: base64Bg };
          console.log(`    [renderPPTX] Slide ${i + 1}: Background image applied`);
        } catch (error) {
          console.error(`    [renderPPTX] Slide ${i + 1}: Failed to generate background image:`, error);
          // Fallback to solid color
          const bgColor = slideTheme.backgroundMode === "dark" ? themeSpec.palette.darkBg : themeSpec.palette.lightBg;
          slide.background = { color: bgColor };
        }
      } else {
        // Use solid color background
        const bgColor = slideTheme.backgroundMode === "dark" ? themeSpec.palette.darkBg : themeSpec.palette.lightBg;
        console.log(`    [renderPPTX] Slide ${i + 1}: Applying ${slideTheme.backgroundMode} background (${bgColor})`);
        slide.background = { color: bgColor };
      }

      // Header band (drawn BEFORE content so content sits on top)
      if (slideTheme.headerStyle === "band") {
        console.log(`    [renderPPTX] Slide ${i + 1}: Adding header band (${slideTheme.accentColor})`);
        renderHeaderBand(slide, slideTheme);
      }

      // Only run DecorationEngine for solid color backgrounds
      // Image backgrounds already contain all their visual chrome
      const nonGeometricDecorations = slideTheme.decorations.filter((d) => d.kind !== "geometric-split");
      if (!needsBackgroundImage && nonGeometricDecorations.length > 0) {
        console.log(`    [renderPPTX] Slide ${i + 1}: Adding ${nonGeometricDecorations.length} decorations`);
        decorationEngine.apply(slide, pptx, { ...slideTheme, decorations: nonGeometricDecorations });
      }
    } else if (tree.background) {
      console.log(`    [renderPPTX] Slide ${i + 1}: Using fallback background (${tree.background})`);
      // Fallback to tree.background if no themeSpec
      slide.background = { color: tree.background };
    } else {
      console.log(`    [renderPPTX] Slide ${i + 1}: WARNING - No background applied!`);
    }

    // Render node tree
    renderNode(slide, tree.root, themeSpec, slideTheme);

    // Render slide number
    renderSlideNumber(slide, i + 1, slides.length, slideTheme, themeSpec);
  }

  return pptx;
}

/**
 * Render and save to file
 */
export async function renderPPTXToFile(slides: LayoutTree[], fileName: string = "output.pptx", themeSpec?: ThemeSpec): Promise<void> {
  console.log(`    [renderPPTXToFile] Starting render to file: ${fileName}`);
  console.log(`    [renderPPTXToFile] Calling renderPPTX for ${slides.length} slides...`);

  const pptx = await renderPPTX(slides, themeSpec);
  console.log(`    [renderPPTXToFile] PPTX object ready, writing to file...`);

  try {
    await pptx.writeFile({ fileName });
    console.log(`    [renderPPTXToFile] File written successfully: ${fileName}`);
  } catch (writeError) {
    console.error(`    [renderPPTXToFile] ERROR writing file:`, writeError);
    throw writeError;
  }
}

/**
 * Render header band
 */
function renderHeaderBand(slide: any, slideTheme: SlideTheme): void {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 10,
    h: 0.88,
    fill: { color: slideTheme.accentColor },
    line: { color: slideTheme.accentColor },
  });
}

/**
 * Render slide number
 */
function renderSlideNumber(slide: any, currentSlide: number, _totalSlides: number, slideTheme?: SlideTheme, themeSpec?: ThemeSpec): void {
  const color = slideTheme && themeSpec ? (slideTheme.backgroundMode === "dark" ? themeSpec.palette.textOnDark : themeSpec.palette.textOnLight) : "666666";

  slide.addText(`${currentSlide}`, {
    x: 9.5,
    y: 5.3,
    w: 0.5,
    h: 0.3,
    fontSize: 12,
    color,
    align: "right",
    valign: "bottom",
  });
}

/**
 * Render chart for data slides (placeholder)
 * TODO: Implement actual chart rendering using pptxgenjs chart API
 */
export function _renderChart(_slide: any, _data: any, _slideTheme?: SlideTheme, _themeSpec?: ThemeSpec): void {
  // Placeholder: chart rendering would use pptxgenjs addChart API
  // This would render bar charts, line charts, pie charts based on data
  console.log("[pptx-renderer] Chart rendering not yet implemented");
}

/**
 * Render table for comparison slides (placeholder)
 * TODO: Implement actual table rendering using pptxgenjs table API
 */
export function _renderTable(_slide: any, _data: any, _slideTheme?: SlideTheme, _themeSpec?: ThemeSpec): void {
  // Placeholder: table rendering would use pptxgenjs addTable API
  // This would render comparison tables with styled headers and cells
  console.log("[pptx-renderer] Table rendering not yet implemented");
}

/**
 * Render icon (placeholder)
 * TODO: Implement icon rendering using react-icons + sharp
 */
export function _renderIcon(_slide: any, iconName: string, _x: number, _y: number, _size: number, _color?: string): void {
  // Placeholder: icon rendering would:
  // 1. Load icon from react-icons
  // 2. Convert to SVG
  // 3. Use sharp to convert to PNG
  // 4. Add as image to slide
  console.log(`[pptx-renderer] Icon rendering not yet implemented: ${iconName}`);
}

/**
 * Node dispatcher
 */
function renderNode(slide: any, node: LayoutNode, themeSpec?: ThemeSpec, slideTheme?: SlideTheme): void {
  console.log(`        [renderNode] Processing node: type=${node.type}, id=${node.id}, hasContent=${!!(node as any).content}`);

  switch (node.type) {
    case "text":
      renderText(slide, node, themeSpec, slideTheme);
      break;

    case "image":
      renderImage(slide, node);
      break;

    case "shape":
      renderShape(slide, node);
      break;

    case "container":
      console.log(`        [renderNode] Container has ${node.children.length} children`);
      node.children.forEach((child) => renderNode(slide, child, themeSpec, slideTheme));
      break;

    default:
      console.warn(`        [renderNode] Unknown node type: ${(node as any).type}`);
  }
}

/**
 * Render text node
 */
function renderText(slide: any, node: TextNode, themeSpec?: ThemeSpec, slideTheme?: SlideTheme): void {
  const r = assertRect(node);
  console.log(`        [renderText] Text: "${node.content?.substring(0, 30)}..." at (${r.x.toFixed(1)}%, ${r.y.toFixed(1)}%), size: ${r.width.toFixed(1)}% x ${r.height.toFixed(1)}%`);

  // Enforce minimum dimensions to prevent invalid EMU values
  const width = Math.max(r.width, MIN_DIMENSION_PCT);
  const height = Math.max(r.height, MIN_DIMENSION_PCT);

  // Font selection: display font for titles, body font for everything else
  const isTitle = node.text.fontRole === "hero" || node.text.fontRole === "h1" || node.text.fontRole === "h2";
  const fontFace = isTitle && themeSpec ? themeSpec.typography.displayFont : (themeSpec?.typography.bodyFont ?? node.text.fontFamily ?? "Calibri");

  // Color selection from ThemeSpec
  let color = node.text.color;
  if (!color && themeSpec && slideTheme) {
    const isOnDark = slideTheme.backgroundMode === "dark";
    color = isOnDark ? themeSpec.palette.textOnDark : themeSpec.palette.textOnLight;
  }

  slide.addText(node.content, {
    x: pctXtoIn(r.x),
    y: pctYtoIn(r.y),
    w: pctXtoIn(width),
    h: pctYtoIn(height),

    fontSize: node.text.fontSize,
    fontFace,
    bold: node.text.fontWeight === "bold",
    italic: node.text.italic ?? false,
    color: color ?? "000000",
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
  console.log(`        [renderImage] Image at (${r.x.toFixed(1)}%, ${r.y.toFixed(1)}%), src: ${node.src?.substring(0, 30)}...`);

  // Validate image URL
  if (!isValidImageUrl(node.src)) {
    console.warn(`        [renderImage] Invalid or unsupported image URL: ${node.src?.substring(0, 50)}... Rendering placeholder.`);
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
  console.log(`        [renderShape] Shape: ${node.shape} at (${r.x.toFixed(1)}%, ${r.y.toFixed(1)}%)`);

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
