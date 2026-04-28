import type { ColorPalette } from "@prezvik/theme-layer";
import type { ShapeElement, SolidFill, Stroke } from "./models/visual-element.js";
import type { Rect, Point, SlideType, ThemeTone } from "./models/visual-context.js";
import { ShapeCache } from "./optimizations/shape-cache.js";
import { createSpatialIndexFromBounds } from "./optimizations/spatial-index.js";

/**
 * ShapeGenerator is responsible for procedurally generating geometric shapes
 * for slide decorations based on slide type, theme tone, and content bounds.
 *
 * Shape generation rules by theme tone:
 * - Executive: rectangles and lines (structured, professional)
 * - Minimal: circles and subtle shapes (clean, simple)
 * - Modern: polygons and dynamic shapes (bold, contemporary)
 *
 * All shapes avoid overlapping with content areas using optimized collision detection.
 */
export class ShapeGenerator {
  private idCounter = 0;
  private shapeCache: ShapeCache;

  constructor() {
    this.shapeCache = new ShapeCache();
  }

  /**
   * Generate decoration shapes for a slide
   *
   * Uses caching to avoid regenerating shapes for similar slides.
   * Uses spatial indexing for efficient collision detection.
   *
   * @param slideType - Type of slide (hero, section, content, closing)
   * @param colorPalette - Resolved color palette from Theme Layer
   * @param contentBounds - Array of rectangles representing content areas to avoid
   * @param themeTone - Theme tone determining shape style
   * @returns Array of ShapeElement objects
   */
  generateShapes(slideType: SlideType, colorPalette: ColorPalette, contentBounds: Rect[], themeTone: ThemeTone): ShapeElement[] {
    // Check cache first
    const contentBoundsHash = this.shapeCache.hashContentBounds(contentBounds);
    const cached = this.shapeCache.get(slideType, themeTone, contentBoundsHash);
    if (cached) {
      return cached;
    }

    // Create spatial index for efficient collision detection
    const spatialIndex = createSpatialIndexFromBounds(contentBounds);

    const shapes: ShapeElement[] = [];

    // Determine number of shapes based on slide type
    const shapeCount = this.getShapeCount(slideType);

    // Generate shapes based on theme tone
    for (let i = 0; i < shapeCount; i++) {
      const shape = this.generateShapeByTone(themeTone, colorPalette, spatialIndex, i);
      if (shape) {
        shapes.push(shape);
      }
    }

    // Cache the result
    this.shapeCache.set(slideType, themeTone, contentBoundsHash, shapes);

    return shapes;
  }

  /**
   * Determine number of shapes to generate based on slide type
   */
  private getShapeCount(slideType: SlideType): number {
    switch (slideType) {
      case "hero":
        return 3; // More decorative shapes for hero slides
      case "section":
        return 2; // Moderate decoration for section slides
      case "content":
        return 1; // Minimal decoration for content slides
      case "closing":
        return 2; // Moderate decoration for closing slides
      default:
        return 1;
    }
  }

  /**
   * Generate a shape based on theme tone
   */
  private generateShapeByTone(themeTone: ThemeTone, colorPalette: ColorPalette, spatialIndex: any, index: number): ShapeElement | null {
    switch (themeTone) {
      case "executive":
        return this.generateExecutiveShape(colorPalette, spatialIndex, index);
      case "minimal":
        return this.generateMinimalShape(colorPalette, spatialIndex, index);
      case "modern":
        return this.generateModernShape(colorPalette, spatialIndex, index);
      default:
        return this.generateMinimalShape(colorPalette, spatialIndex, index);
    }
  }

  /**
   * Generate executive-style shapes (rectangles and lines)
   */
  private generateExecutiveShape(colorPalette: ColorPalette, spatialIndex: any, index: number): ShapeElement | null {
    // Alternate between rectangles and lines
    const isLine = index % 2 === 1;

    if (isLine) {
      return this.generateLine(colorPalette, spatialIndex);
    } else {
      return this.generateRectangle(colorPalette, spatialIndex);
    }
  }

  /**
   * Generate minimal-style shapes (circles and subtle shapes)
   */
  private generateMinimalShape(colorPalette: ColorPalette, spatialIndex: any, _index: number): ShapeElement | null {
    return this.generateCircle(colorPalette, spatialIndex);
  }

  /**
   * Generate modern-style shapes (polygons and dynamic shapes)
   */
  private generateModernShape(colorPalette: ColorPalette, spatialIndex: any, index: number): ShapeElement | null {
    // Alternate between polygons and rectangles for variety
    const isPolygon = index % 2 === 0;

    if (isPolygon) {
      return this.generatePolygon(colorPalette, spatialIndex);
    } else {
      return this.generateRectangle(colorPalette, spatialIndex, true); // Dynamic rectangle
    }
  }

  /**
   * Generate a rectangle shape with improved sizing and placement
   */
  private generateRectangle(colorPalette: ColorPalette, spatialIndex: any, dynamic: boolean = false): ShapeElement | null {
    // Try multiple positions to find non-overlapping placement
    for (let attempt = 0; attempt < 10; attempt++) {
      // More varied sizes for better visual interest
      const width = dynamic ? 120 + Math.random() * 180 : 80 + Math.random() * 120;
      const height = dynamic ? 120 + Math.random() * 180 : 80 + Math.random() * 120;
      const bounds = this.generateRandomBounds(width, height);

      if (!spatialIndex.hasCollision(bounds)) {
        const fill: SolidFill = {
          type: "solid",
          color: this.getAccentColor(colorPalette),
        };

        return {
          id: `shape-rect-${Date.now()}-${this.idCounter++}`,
          kind: "shape",
          shapeType: "rectangle",
          zIndex: 1,
          opacity: dynamic ? 0.25 : 0.18, // Slightly more visible
          bounds,
          fill,
          properties: {
            cornerRadius: dynamic ? 12 : 4, // More rounded corners for modern look
          },
        };
      }
    }

    return null; // Could not find non-overlapping position
  }

  /**
   * Generate a circle shape with improved sizing
   */
  private generateCircle(colorPalette: ColorPalette, spatialIndex: any): ShapeElement | null {
    // Try multiple positions to find non-overlapping placement
    for (let attempt = 0; attempt < 10; attempt++) {
      const radius = 50 + Math.random() * 80; // 50-130px radius for more variety
      const bounds = this.generateRandomBounds(radius * 2, radius * 2);

      if (!spatialIndex.hasCollision(bounds)) {
        const fill: SolidFill = {
          type: "solid",
          color: this.getAccentColor(colorPalette),
        };

        return {
          id: `shape-circle-${Date.now()}-${this.idCounter++}`,
          kind: "shape",
          shapeType: "circle",
          zIndex: 1,
          opacity: 0.12, // Slightly more subtle for minimal aesthetic
          bounds,
          fill,
          properties: {
            radius,
          },
        };
      }
    }

    return null;
  }

  /**
   * Generate a line shape
   */
  private generateLine(colorPalette: ColorPalette, spatialIndex: any): ShapeElement | null {
    // Try multiple positions to find non-overlapping placement
    for (let attempt = 0; attempt < 10; attempt++) {
      const isVertical = Math.random() > 0.5;
      const bounds = isVertical
        ? this.generateRandomBounds(4, 200) // Vertical line
        : this.generateRandomBounds(200, 4); // Horizontal line

      if (!spatialIndex.hasCollision(bounds)) {
        const stroke: Stroke = {
          color: this.getAccentColor(colorPalette),
          width: 4,
        };

        return {
          id: `shape-line-${Date.now()}-${this.idCounter++}`,
          kind: "shape",
          shapeType: "line",
          zIndex: 1,
          opacity: 0.25,
          bounds,
          stroke,
        };
      }
    }

    return null;
  }

  /**
   * Generate a polygon shape (triangle) with improved sizing
   */
  private generatePolygon(colorPalette: ColorPalette, spatialIndex: any): ShapeElement | null {
    // Try multiple positions to find non-overlapping placement
    for (let attempt = 0; attempt < 10; attempt++) {
      const size = 100 + Math.random() * 100; // 100-200px for more prominent shapes
      const bounds = this.generateRandomBounds(size, size);

      if (!spatialIndex.hasCollision(bounds)) {
        // Generate triangle points relative to bounds
        const points: Point[] = [
          { x: bounds.width / 2, y: 0 }, // Top center
          { x: 0, y: bounds.height }, // Bottom left
          { x: bounds.width, y: bounds.height }, // Bottom right
        ];

        const fill: SolidFill = {
          type: "solid",
          color: this.getAccentColor(colorPalette),
        };

        return {
          id: `shape-polygon-${Date.now()}-${this.idCounter++}`,
          kind: "shape",
          shapeType: "polygon",
          zIndex: 1,
          opacity: 0.22, // Slightly more visible for modern aesthetic
          bounds,
          fill,
          properties: {
            points,
          },
        };
      }
    }

    return null;
  }

  /**
   * Generate random bounds for a shape
   * Assumes standard slide dimensions of 960x540
   */
  private generateRandomBounds(width: number, height: number): Rect {
    // Standard slide dimensions
    const slideWidth = 960;
    const slideHeight = 540;

    // Generate position with some margin from edges
    const margin = 50;
    const x = margin + Math.random() * (slideWidth - width - margin * 2);
    const y = margin + Math.random() * (slideHeight - height - margin * 2);

    return { x, y, width, height };
  }

  /**
   * Get an accent color from the palette
   * Randomly selects between accent, primary, and secondary
   */
  private getAccentColor(colorPalette: ColorPalette): string {
    const colors = [colorPalette.accent, colorPalette.primary, colorPalette.secondary];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): { size: number; maxSize: number } {
    return this.shapeCache.getStats();
  }

  /**
   * Clear shape cache
   */
  clearCache(): void {
    this.shapeCache.clear();
  }
}
