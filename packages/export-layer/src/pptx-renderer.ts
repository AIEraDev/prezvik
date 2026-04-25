import PptxGenJS from "pptxgenjs";
import type { Renderer, RenderOptions, RenderResult, ValidationResult, FeatureSupport } from "./renderer-interface.js";
import type { VisualContext } from "@kyro/visual-layer";
import type { LinearGradient, RadialGradient, Fill, ShapeElement, ContentElement, TextContent, ImageContent } from "@kyro/visual-layer";

/**
 * PPTX-specific render options
 */
export interface PPTXRenderOptions extends RenderOptions {
  /** Slide layout (16:9 or 4:3) */
  layout?: "LAYOUT_16x9" | "LAYOUT_4x3";

  /** Presentation author */
  author?: string;

  /** Presentation title */
  title?: string;

  /** Presentation subject */
  subject?: string;
}

/**
 * PPTX Renderer implementation
 * Converts Visual Context to PowerPoint presentations using PptxGenJS
 */
export class PPTXRenderer implements Renderer {
  private pptx: any;

  constructor(pptxInstance?: any) {
    // Handle both default and named exports
    const PptxConstructor = (PptxGenJS as any).default || PptxGenJS;
    this.pptx = pptxInstance || new PptxConstructor();
  }

  /**
   * Render Visual Context to PPTX format
   */
  async render(visualContext: VisualContext, options?: PPTXRenderOptions): Promise<RenderResult> {
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

      // Configure presentation
      this.configurePresentationMetadata(options);

      // Set layout
      const layout = options?.layout || "LAYOUT_16x9";
      this.pptx.layout = layout;

      // Render each slide
      for (const slideContext of visualContext.slides) {
        try {
          const slide = this.pptx.addSlide();

          // Render background
          this.renderBackground(slide, slideContext.background);

          // Render decoration shapes
          for (const decoration of slideContext.decorations) {
            if (decoration.kind === "shape") {
              this.renderShape(slide, decoration as ShapeElement);
            }
          }

          // Render content elements
          for (const content of slideContext.content) {
            if (content.kind === "text" || content.kind === "image") {
              this.renderContent(slide, content as ContentElement);
            }
          }
        } catch (error) {
          const errorMsg = `Failed to render slide ${slideContext.slideId}: ${error instanceof Error ? error.message : String(error)}`;
          errors.push(errorMsg);
          warnings.push(`Skipping slide ${slideContext.slideId}`);
        }
      }

      // Write to file or buffer
      if (options?.outputPath) {
        await this.pptx.writeFile({ fileName: options.outputPath });
        return {
          success: true,
          outputPath: options.outputPath,
          errors: errors.length > 0 ? errors : undefined,
          warnings: warnings.length > 0 ? warnings : undefined,
        };
      } else {
        const buffer = (await this.pptx.write({
          outputType: "nodebuffer",
        })) as Buffer;
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
        errors: [`PPTX rendering failed: ${error instanceof Error ? error.message : String(error)}`, ...errors],
        warnings,
      };
    }
  }

  /**
   * Validate Visual Context for PPTX rendering
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
   * Get supported features for PPTX renderer
   */
  getSupportedFeatures(): FeatureSupport {
    return {
      gradients: true,
      patterns: false, // PptxGenJS has limited pattern support
      blendModes: false, // Not supported in PowerPoint
      customShapes: true,
    };
  }

  /**
   * Configure presentation metadata
   */
  private configurePresentationMetadata(options?: PPTXRenderOptions): void {
    if (options?.author) {
      this.pptx.author = options.author;
    }
    if (options?.title) {
      this.pptx.title = options.title;
    }
    if (options?.subject) {
      this.pptx.subject = options.subject;
    }
  }

  /**
   * Render background element to slide
   */
  private renderBackground(slide: any, background: any): void {
    if (!background || !background.fill) {
      return;
    }

    const fill = background.fill as Fill;

    if (fill.type === "solid") {
      // Solid color background
      slide.background = { color: this.convertColor(fill.color) };
    } else if (fill.type === "gradient") {
      // Gradient background
      const gradientDef = this.convertGradient(fill.gradient);
      if (gradientDef) {
        slide.background = gradientDef;
      }
    }
    // Pattern fills not supported for backgrounds in PptxGenJS
  }

  /**
   * Render shape element to slide
   */
  private renderShape(slide: any, shape: ShapeElement): void {
    const bounds = shape.bounds;

    // Convert bounds to inches (PptxGenJS uses inches)
    const x = this.pixelsToInches(bounds.x);
    const y = this.pixelsToInches(bounds.y);
    const w = this.pixelsToInches(bounds.width);
    const h = this.pixelsToInches(bounds.height);

    const shapeOptions: any = {
      x,
      y,
      w,
      h,
    };

    // Apply fill
    if (shape.fill) {
      this.applyFill(shapeOptions, shape.fill);
    }

    // Apply stroke
    if (shape.stroke) {
      shapeOptions.line = {
        color: this.convertColor(shape.stroke.color),
        width: shape.stroke.width,
        dashType: shape.stroke.dashArray ? "dash" : undefined,
      };
    }

    // Set opacity
    if (shape.opacity < 1) {
      shapeOptions.transparency = Math.round((1 - shape.opacity) * 100);
    }

    // Add shape based on type
    switch (shape.shapeType) {
      case "rectangle":
        if (shape.properties?.cornerRadius) {
          shapeOptions.rectRadius = this.pixelsToInches(shape.properties.cornerRadius);
        }
        slide.addShape(this.pptx.ShapeType.rect, shapeOptions);
        break;

      case "circle":
        slide.addShape(this.pptx.ShapeType.ellipse, shapeOptions);
        break;

      case "line":
        slide.addShape(this.pptx.ShapeType.line, shapeOptions);
        break;

      case "polygon":
        // PptxGenJS doesn't have direct polygon support, but we can use triangle shape
        if (shape.properties?.points && shape.properties.points.length >= 3) {
          // Use triangle shape for 3-point polygons
          if (shape.properties.points.length === 3) {
            slide.addShape(this.pptx.ShapeType.triangle, shapeOptions);
          } else {
            // For polygons with more than 3 points, approximate with rectangle
            // This is a limitation of PptxGenJS which doesn't support arbitrary polygons
            slide.addShape(this.pptx.ShapeType.rect, shapeOptions);
          }
        }
        break;

      case "path":
        // PptxGenJS doesn't support arbitrary SVG paths
        // Fall back to rectangle
        slide.addShape(this.pptx.ShapeType.rect, shapeOptions);
        break;

      default:
        // Default to rectangle
        slide.addShape(this.pptx.ShapeType.rect, shapeOptions);
    }
  }

  /**
   * Render content element (text or image) to slide
   */
  private renderContent(slide: any, content: ContentElement): void {
    const bounds = content.bounds;

    // Convert bounds to inches
    const x = this.pixelsToInches(bounds.x);
    const y = this.pixelsToInches(bounds.y);
    const w = this.pixelsToInches(bounds.width);
    const h = this.pixelsToInches(bounds.height);

    if (content.kind === "text") {
      const textContent = content.content as TextContent;

      const textOptions: any = {
        x,
        y,
        w,
        h,
        text: textContent.text,
        fontSize: textContent.fontSize,
        fontFace: textContent.font,
        color: this.convertColor(textContent.color),
        align: textContent.align,
        valign: this.convertVerticalAlign(textContent.verticalAlign),
        bold: textContent.bold || false,
        italic: textContent.italic || false,
      };

      // Set opacity
      if (content.opacity < 1) {
        textOptions.transparency = Math.round((1 - content.opacity) * 100);
      }

      slide.addText(textContent.text, textOptions);
    } else if (content.kind === "image") {
      const imageContent = content.content as ImageContent;

      const imageOptions: any = {
        x,
        y,
        w,
        h,
        path: imageContent.src,
        sizing: {
          type: imageContent.fit === "cover" ? "cover" : imageContent.fit === "contain" ? "contain" : "crop",
        },
      };

      // Set opacity
      if (content.opacity < 1) {
        imageOptions.transparency = Math.round((1 - content.opacity) * 100);
      }

      slide.addImage(imageOptions);
    }
  }

  /**
   * Convert gradient to PptxGenJS format
   */
  private convertGradient(gradient: LinearGradient | RadialGradient): any | null {
    if (gradient.type === "linear") {
      return this.convertLinearGradient(gradient);
    } else if (gradient.type === "radial") {
      return this.convertRadialGradient(gradient);
    }
    return null;
  }

  /**
   * Convert linear gradient to PptxGenJS format
   */
  private convertLinearGradient(gradient: LinearGradient): any {
    // PptxGenJS gradient format
    const stops = gradient.stops.map((stop) => ({
      position: Math.round(stop.position * 100), // Convert 0-1 to 0-100
      color: this.convertColor(stop.color),
    }));

    return {
      type: "linear",
      angle: gradient.angle,
      stops,
    };
  }

  /**
   * Convert radial gradient to PptxGenJS format
   */
  private convertRadialGradient(gradient: RadialGradient): any {
    // PptxGenJS has limited radial gradient support
    // Convert to linear gradient as fallback
    const stops = gradient.stops.map((stop) => ({
      position: Math.round(stop.position * 100),
      color: this.convertColor(stop.color),
    }));

    return {
      type: "linear",
      angle: 0, // Default angle
      stops,
    };
  }

  /**
   * Apply fill to shape options
   */
  private applyFill(shapeOptions: any, fill: Fill): void {
    if (fill.type === "solid") {
      shapeOptions.fill = { color: this.convertColor(fill.color) };
    } else if (fill.type === "gradient") {
      const gradientDef = this.convertGradient(fill.gradient);
      if (gradientDef) {
        shapeOptions.fill = gradientDef;
      }
    }
    // Pattern fills not fully supported
  }

  /**
   * Convert color to PptxGenJS format (remove # prefix)
   */
  private convertColor(color: string): string {
    // PptxGenJS expects colors without # prefix
    return color.startsWith("#") ? color.substring(1) : color;
  }

  /**
   * Convert vertical alignment to PptxGenJS format
   */
  private convertVerticalAlign(align: string): string {
    switch (align) {
      case "top":
        return "top";
      case "middle":
        return "middle";
      case "bottom":
        return "bottom";
      default:
        return "top";
    }
  }

  /**
   * Convert pixels to inches (PptxGenJS uses inches)
   * Assumes 96 DPI (standard screen resolution)
   */
  private pixelsToInches(pixels: number): number {
    return pixels / 96;
  }
}
