import type { Renderer, RenderOptions, RenderResult, ValidationResult, FeatureSupport } from "./renderer-interface.js";
import type { VisualContext, SlideVisualContext, LinearGradient, RadialGradient, Fill, ShapeElement, ContentElement, TextContent, ImageContent } from "@kyro/visual-layer";

/**
 * Web-specific render options
 */
export interface WebRenderOptions extends RenderOptions {
  /** Presentation theme */
  theme?: string;

  /** Slide transition effect */
  transition?: string;

  /** Show controls */
  controls?: boolean;

  /** Show progress bar */
  progress?: boolean;
}

/**
 * Web Renderer implementation
 * Converts Visual Context to HTML slides using Reveal.js
 */
export class WebRenderer implements Renderer {
  constructor() {}

  /**
   * Render Visual Context to HTML format
   */
  async render(visualContext: VisualContext, options?: WebRenderOptions): Promise<RenderResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate before rendering
      const validation = this.validate(visualContext);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
        };
      }

      // Generate HTML and CSS
      const html = this.generateHTML(visualContext, options);
      const css = this.generateCSS(visualContext);

      // Combine into complete HTML document
      const fullHTML = this.wrapInDocument(html, css, options);

      // Write to file or return as buffer
      if (options?.outputPath) {
        const fs = await import("fs/promises");
        await fs.writeFile(options.outputPath, fullHTML, "utf-8");
        return {
          success: true,
          outputPath: options.outputPath,
          errors: errors.length > 0 ? errors : undefined,
          warnings: warnings.length > 0 ? warnings : undefined,
        };
      } else {
        const buffer = Buffer.from(fullHTML, "utf-8");
        return {
          success: true,
          buffer,
          errors: errors.length > 0 ? errors : undefined,
          warnings: warnings.length > 0 ? warnings : undefined,
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Web rendering failed: ${error instanceof Error ? error.message : String(error)}`, ...errors],
        warnings,
      };
    }
  }

  /**
   * Validate Visual Context for web rendering
   */
  validate(visualContext: VisualContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check version
    if (visualContext.version !== "1.0") {
      errors.push(`Unsupported Visual Context version: ${visualContext.version}`);
    }

    // Check slides exist
    if (!visualContext.slides || visualContext.slides.length === 0) {
      errors.push("Visual Context must contain at least one slide");
    }

    // Validate each slide
    for (const slide of visualContext.slides) {
      if (!slide.background) {
        warnings.push(`Slide ${slide.slideId} has no background`);
      }

      if (!slide.dimensions || slide.dimensions.width <= 0 || slide.dimensions.height <= 0) {
        errors.push(`Slide ${slide.slideId} has invalid dimensions`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get supported features for web renderer
   */
  getSupportedFeatures(): FeatureSupport {
    return {
      gradients: true,
      patterns: true,
      blendModes: true, // CSS supports blend modes
      customShapes: true, // Via SVG
    };
  }

  /**
   * Generate HTML structure for slides
   */
  private generateHTML(visualContext: VisualContext, _options?: WebRenderOptions): string {
    const slides = visualContext.slides.map((slide) => this.generateSlideHTML(slide)).join("\n");

    return `<div class="reveal">
  <div class="slides">
${slides}
  </div>
</div>`;
  }

  /**
   * Generate HTML for a single slide
   */
  private generateSlideHTML(slide: SlideVisualContext): string {
    const backgroundStyle = this.generateBackgroundStyle(slide.background);
    const decorations = slide.decorations.map((decoration) => this.generateShapeSVG(decoration as ShapeElement)).join("\n");
    const content = slide.content.map((element) => this.generateContentHTML(element as ContentElement)).join("\n");

    return `    <section data-slide-id="${slide.slideId}" style="${backgroundStyle}">
      <div class="slide-decorations">
${decorations}
      </div>
      <div class="slide-content">
${content}
      </div>
    </section>`;
  }

  /**
   * Generate background style for slide
   */
  private generateBackgroundStyle(background: any): string {
    if (!background || !background.fill) {
      return "";
    }

    const fill = background.fill as Fill;

    if (fill.type === "solid") {
      return `background-color: ${fill.color};`;
    } else if (fill.type === "gradient") {
      const gradient = fill.gradient;
      if (gradient.type === "linear") {
        return `background: ${this.convertLinearGradientToCSS(gradient)};`;
      } else if (gradient.type === "radial") {
        return `background: ${this.convertRadialGradientToCSS(gradient)};`;
      }
    }

    return "";
  }

  /**
   * Convert linear gradient to CSS linear-gradient()
   */
  private convertLinearGradientToCSS(gradient: LinearGradient): string {
    const stops = gradient.stops.map((stop) => `${stop.color} ${Math.round(stop.position * 100)}%`).join(", ");

    return `linear-gradient(${gradient.angle}deg, ${stops})`;
  }

  /**
   * Convert radial gradient to CSS radial-gradient()
   */
  private convertRadialGradientToCSS(gradient: RadialGradient): string {
    const stops = gradient.stops.map((stop) => `${stop.color} ${Math.round(stop.position * 100)}%`).join(", ");

    const centerX = Math.round(gradient.center.x * 100);
    const centerY = Math.round(gradient.center.y * 100);
    const radius = Math.round(gradient.radius * 100);

    return `radial-gradient(circle ${radius}% at ${centerX}% ${centerY}%, ${stops})`;
  }

  /**
   * Generate SVG for shape element
   */
  private generateShapeSVG(shape: ShapeElement): string {
    const { x, y, width, height } = shape.bounds;
    const opacity = shape.opacity;
    const fill = shape.fill ? this.convertFillToSVG(shape.fill) : "none";
    const stroke = shape.stroke ? `stroke="${shape.stroke.color}" stroke-width="${shape.stroke.width}"` : "";

    let svgElement = "";

    switch (shape.shapeType) {
      case "rectangle":
        const cornerRadius = shape.properties?.cornerRadius || 0;
        svgElement = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${cornerRadius}" fill="${fill}" ${stroke} opacity="${opacity}" />`;
        break;

      case "circle":
        const cx = x + width / 2;
        const cy = y + height / 2;
        const r = Math.min(width, height) / 2;
        svgElement = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${stroke} opacity="${opacity}" />`;
        break;

      case "line":
        const x2 = x + width;
        const y2 = y + height;
        svgElement = `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" ${stroke} opacity="${opacity}" />`;
        break;

      case "polygon":
        if (shape.properties?.points && shape.properties.points.length >= 3) {
          const points = shape.properties.points.map((p) => `${p.x},${p.y}`).join(" ");
          svgElement = `<polygon points="${points}" fill="${fill}" ${stroke} opacity="${opacity}" />`;
        }
        break;

      case "path":
        if (shape.properties?.pathData) {
          svgElement = `<path d="${shape.properties.pathData}" fill="${fill}" ${stroke} opacity="${opacity}" />`;
        }
        break;

      default:
        // Default to rectangle
        svgElement = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" ${stroke} opacity="${opacity}" />`;
    }

    return `        <svg class="shape-decoration" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
          ${svgElement}
        </svg>`;
  }

  /**
   * Convert fill to SVG format
   */
  private convertFillToSVG(fill: Fill): string {
    if (fill.type === "solid") {
      return fill.color;
    } else if (fill.type === "gradient") {
      // For SVG gradients, we'd need to define them in <defs>
      // For simplicity, use the first color
      return fill.gradient.stops[0]?.color || "#000000";
    }
    return "none";
  }

  /**
   * Generate HTML for content element
   */
  private generateContentHTML(content: ContentElement): string {
    const { x, y, width, height } = content.bounds;
    const style = `position: absolute; left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px; opacity: ${content.opacity};`;

    if (content.kind === "text") {
      const textContent = content.content as TextContent;
      const textStyle = `
        font-family: ${textContent.font};
        font-size: ${textContent.fontSize}px;
        color: ${textContent.color};
        text-align: ${textContent.align};
        display: flex;
        align-items: ${this.convertVerticalAlign(textContent.verticalAlign)};
        ${textContent.bold ? "font-weight: bold;" : ""}
        ${textContent.italic ? "font-style: italic;" : ""}
      `.trim();

      return `        <div class="text-content" style="${style} ${textStyle}">
          ${this.escapeHTML(textContent.text)}
        </div>`;
    } else if (content.kind === "image") {
      const imageContent = content.content as ImageContent;
      const objectFit = imageContent.fit;

      return `        <div class="image-content" style="${style}">
          <img src="${imageContent.src}" style="width: 100%; height: 100%; object-fit: ${objectFit};" />
        </div>`;
    }

    return "";
  }

  /**
   * Convert vertical alignment to CSS flexbox alignment
   */
  private convertVerticalAlign(align: string): string {
    switch (align) {
      case "top":
        return "flex-start";
      case "middle":
        return "center";
      case "bottom":
        return "flex-end";
      default:
        return "flex-start";
    }
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  /**
   * Generate CSS for the presentation
   */
  private generateCSS(visualContext: VisualContext): string {
    const typography = visualContext.theme.typography;

    return `
/* Base styles */
.reveal {
  font-family: ${typography.bodyFont}, sans-serif;
}

.reveal h1, .reveal h2, .reveal h3 {
  font-family: ${typography.displayFont}, sans-serif;
}

/* Slide container */
.reveal .slides section {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Decorations layer */
.slide-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* Content layer */
.slide-content {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 10;
}

/* Text content */
.text-content {
  box-sizing: border-box;
}

/* Image content */
.image-content {
  overflow: hidden;
}

/* Responsive design */
@media (max-width: 768px) {
  .text-content {
    font-size: 0.8em;
  }
}
    `.trim();
  }

  /**
   * Wrap HTML and CSS in complete document
   */
  private wrapInDocument(html: string, css: string, options?: WebRenderOptions): string {
    const theme = options?.theme || "black";
    const transition = options?.transition || "slide";
    const controls = options?.controls !== false;
    const progress = options?.progress !== false;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/theme/${theme}.css">
  <style>
${css}
  </style>
</head>
<body>
${html}
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      transition: '${transition}',
      controls: ${controls},
      progress: ${progress},
      center: false,
      width: 960,
      height: 540,
      margin: 0,
      minScale: 0.2,
      maxScale: 2.0
    });
  </script>
</body>
</html>`;
  }
}
