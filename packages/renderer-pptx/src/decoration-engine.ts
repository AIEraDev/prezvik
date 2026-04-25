/**
 * Decoration Engine
 *
 * Renders decorative shapes (bars, circles, spines) from ThemeSpec to pptxgenjs slides.
 * Pure renderer - no intelligence, just drawing.
 */

import type { SlideTheme, Decoration } from "@kyro/design";
import type PptxGenJS from "pptxgenjs";

export class DecorationEngine {
  /**
   * Apply all decorations from a slide theme to a pptxgenjs slide
   */
  apply(slide: PptxGenJS.Slide, pptx: PptxGenJS, theme: SlideTheme): void {
    for (const dec of theme.decorations) {
      this.renderDecoration(slide, pptx, dec);
    }
  }

  /**
   * Render a single decoration
   */
  private renderDecoration(slide: any, pptx: any, dec: Decoration): void {
    switch (dec.kind) {
      case "left-bar":
        slide.addShape(pptx.shapes.RECTANGLE, {
          x: 0,
          y: 0,
          w: dec.width,
          h: 5.625,
          fill: { color: dec.color },
          line: { color: dec.color },
        });
        break;

      case "oval":
        slide.addShape(pptx.shapes.OVAL, {
          x: dec.x,
          y: dec.y,
          w: dec.w,
          h: dec.h,
          fill: { color: dec.color, transparency: Math.round((1 - dec.opacity) * 100) },
          line: { color: dec.color, transparency: Math.round((1 - dec.opacity) * 100) },
        });
        break;

      case "bottom-bar":
        slide.addShape(pptx.shapes.RECTANGLE, {
          x: 0,
          y: 5.625 - dec.height,
          w: 10,
          h: dec.height,
          fill: { color: dec.color },
          line: { color: dec.color },
        });
        break;

      case "timeline-spine":
        // Horizontal bar across the middle of the slide
        slide.addShape(pptx.shapes.RECTANGLE, {
          x: 0.5,
          y: 2.88,
          w: 9.0,
          h: 0.07,
          fill: { color: dec.color },
          line: { color: dec.color },
        });
        break;

      case "corner-accent": {
        const x = dec.position === "top-right" ? 7.8 : 0;
        slide.addShape(pptx.shapes.OVAL, {
          x,
          y: -0.6,
          w: 3.2,
          h: 3.2,
          fill: { color: dec.color, transparency: 82 },
          line: { color: dec.color, transparency: 82 },
        });
        break;
      }
    }
  }
}
