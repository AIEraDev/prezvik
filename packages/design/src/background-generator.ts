/**
 * Background Generator
 *
 * Generates slide backgrounds from named recipes using SVG composition + sharp rasterization.
 * AI agents describe what (geometric-split, gradient), this renders how.
 */

import { SVG, registerWindow } from "@svgdotjs/svg.js";
// @ts-ignore - svgdom doesn't have types
import { createSVGWindow } from "svgdom";
import sharp from "sharp";
import type { BackgroundStyle } from "./vocabulary.js";
import type { ThemePalette } from "./theme-spec.js";

// Standard slide dimensions (16:9 at 1280x720)
const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;

export interface BackgroundRecipe {
  style: BackgroundStyle;
  palette: ThemePalette;
  slideType: string;
}

export class BackgroundGenerator {
  /**
   * Generate background image as base64 PNG
   */
  async generate(recipe: BackgroundRecipe): Promise<string> {
    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);

    const canvas = SVG(document.documentElement) as any;
    canvas.size(SLIDE_WIDTH, SLIDE_HEIGHT);

    // Render based on style
    switch (recipe.style) {
      case "dark-geometric":
        this.renderDarkGeometric(canvas, recipe.palette);
        break;
      case "light-minimal":
        this.renderLightMinimal(canvas, recipe.palette);
        break;
      case "gradient-diagonal":
        this.renderGradientDiagonal(canvas, recipe.palette);
        break;
      case "dark-gradient":
        this.renderDarkGradient(canvas, recipe.palette);
        break;
      case "mesh-vivid":
        await this.renderMeshVivid(canvas, recipe.palette);
        break;
      case "split-panel":
        this.renderSplitPanel(canvas, recipe.palette);
        break;
      case "noise-overlay":
        return await this.renderNoiseOverlay(recipe.palette);
      case "brand-saturated":
        this.renderBrandSaturated(canvas, recipe.palette);
        break;
      default:
        // Fallback to solid color
        canvas.rect(SLIDE_WIDTH, SLIDE_HEIGHT).fill(`#${recipe.palette.darkBg}`);
    }

    // Convert SVG to PNG using sharp
    const svgString = canvas.svg();
    const pngBuffer = await sharp(Buffer.from(svgString)).png().toBuffer();

    return `image/png;base64,${pngBuffer.toString("base64")}`;
  }

  /**
   * Dark geometric background (navy + colorful shapes)
   * Large compositional shapes that fill ~40% of left side
   */
  private renderDarkGeometric(canvas: any, palette: ThemePalette): void {
    const W = SLIDE_WIDTH; // 1280
    const H = SLIDE_HEIGHT; // 720

    // 1. Dark base
    canvas.rect(W, H).fill(`#${palette.darkBg}`);

    // 2. Large purple quarter-circle — top-left bleeds off canvas
    canvas
      .circle(W * 0.55)
      .fill(`#${palette.accent}`) // purple
      .move(-W * 0.05, -H * 0.15);

    // 3. Teal rectangle — mid-left
    canvas
      .rect(W * 0.19, H * 0.34)
      .fill(`#${palette.secondary}`) // teal
      .move(0, H * 0.48);

    // 4. Yellow rectangle — bottom-center-left
    canvas
      .rect(W * 0.145, H * 0.395)
      .fill("#F9CA24")
      .move(W * 0.19, H * 0.605);

    // 5. Blue circle — overlapping teal/yellow
    canvas
      .circle(W * 0.125)
      .fill("#74B9FF")
      .move(W * 0.125, H * 0.435);

    // 6. Orange semicircle — bottom-left bleeds off canvas
    canvas
      .circle(W * 0.175)
      .fill("#E17055")
      .move(-W * 0.01, H * 0.67);
  }

  /**
   * Light minimal background (white base with subtle accent elements)
   */
  private renderLightMinimal(canvas: any, palette: ThemePalette): void {
    const W = SLIDE_WIDTH;
    const H = SLIDE_HEIGHT;

    // White base
    canvas.rect(W, H).fill(`#${palette.lightBg}`);

    // Subtle left accent bar (thin, low opacity)
    canvas.rect(6, H).fill(`#${palette.secondary}`).move(0, 0);

    // Very faint large circle watermark — top right
    canvas
      .circle(H * 0.9)
      .fill(`#${palette.accent}`)
      .opacity(0.05)
      .move(W - H * 0.3, -H * 0.2);
  }

  /**
   * Diagonal gradient background
   */
  private renderGradientDiagonal(canvas: any, palette: ThemePalette): void {
    const gradient = canvas.gradient("linear", (add: any) => {
      add.stop(0, `#${palette.primary}`);
      add.stop(1, `#${palette.secondary}`);
    });
    gradient.from(0, 0).to(1, 1);

    canvas.rect(SLIDE_WIDTH, SLIDE_HEIGHT).fill(gradient);
  }

  /**
   * Dark gradient background
   */
  private renderDarkGradient(canvas: any, palette: ThemePalette): void {
    const gradient = canvas.gradient("linear", (add: any) => {
      add.stop(0, `#${palette.darkBg}`);
      add.stop(1, `#${palette.primary}`);
    });
    gradient.from(0, 0).to(0, 1);

    canvas.rect(SLIDE_WIDTH, SLIDE_HEIGHT).fill(gradient);
  }

  /**
   * Mesh vivid background — 4 radial gradients at corners
   */
  private async renderMeshVivid(canvas: any, palette: ThemePalette): Promise<void> {
    const W = SLIDE_WIDTH;
    const H = SLIDE_HEIGHT;

    canvas.rect(W, H).fill(`#${palette.darkBg}`);

    const corners = [
      { cx: 0, cy: 0, color: palette.primary },
      { cx: W, cy: 0, color: palette.accent },
      { cx: 0, cy: H, color: palette.secondary },
      { cx: W, cy: H, color: palette.accent },
    ];

    for (const { cx, cy, color } of corners) {
      const grad = canvas.gradient("radial", (add: any) => {
        add.stop(0, `#${color}`, 0.4);
        add.stop(1, `#${color}`, 0);
      });
      grad.from(cx / W, cy / H, 0).to(cx / W, cy / H, 800 / W);
      canvas.rect(W, H).fill(grad).move(0, 0);
    }
  }

  /**
   * Split panel background — left dark, right light
   */
  private renderSplitPanel(canvas: any, palette: ThemePalette): void {
    const W = SLIDE_WIDTH;
    const H = SLIDE_HEIGHT;
    const splitX = Math.round(W * 0.38);

    canvas.rect(splitX, H).fill(`#${palette.darkBg}`).move(0, 0);
    canvas.rect(W - splitX, H).fill(`#${palette.lightBg}`).move(splitX, 0);
    canvas.rect(3, H).fill(`#${palette.accent}`).move(splitX, 0);
  }

  /**
   * Noise overlay background — solid base + film grain via sharp
   */
  private async renderNoiseOverlay(palette: ThemePalette): Promise<string> {
    const W = SLIDE_WIDTH;
    const H = SLIDE_HEIGHT;

    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);
    const baseCanvas = SVG(document.documentElement) as any;
    baseCanvas.size(W, H);
    baseCanvas.rect(W, H).fill(`#${palette.darkBg}`);

    const svgString = baseCanvas.svg();
    const basePngBuffer = await sharp(Buffer.from(svgString)).png().toBuffer();

    // Generate noise as RGBA raw, then set alpha to 8% opacity
    const noiseRaw = await sharp({
      create: {
        width: W,
        height: H,
        channels: 4 as const,
        background: { r: 128, g: 128, b: 128, alpha: 1 },
        noise: { type: "gaussian" as const, mean: 128, sigma: 25 },
      },
    }).raw().toBuffer();

    // Set alpha channel bytes to 20 (≈8% of 255)
    for (let i = 3; i < noiseRaw.length; i += 4) {
      noiseRaw[i] = 20;
    }

    const noiseBuf = await sharp(noiseRaw, { raw: { width: W, height: H, channels: 4 } })
      .png()
      .toBuffer();

    const result = await sharp(basePngBuffer)
      .composite([{ input: noiseBuf, blend: "over" }])
      .png()
      .toBuffer();

    return `image/png;base64,${result.toString("base64")}`;
  }

  /**
   * Brand saturated background — solid accent color
   */
  private renderBrandSaturated(canvas: any, palette: ThemePalette): void {
    canvas.rect(SLIDE_WIDTH, SLIDE_HEIGHT).fill(`#${palette.accent}`);
  }
}
