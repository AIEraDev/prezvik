import type { ColorPalette } from "@kyro/theme-layer";
import { BackgroundGenerator } from "./background-generator.js";
import { ShapeGenerator } from "./shape-generator.js";
import type { VisualElement } from "./models/visual-element.js";
import type { Dimensions, Rect, SlideType, ThemeTone } from "./models/visual-context.js";

/**
 * Layout node structure from the layout engine
 */
export interface LayoutNode {
  type: string;
  _rect: { x: number; y: number; width: number; height: number };
  children?: LayoutNode[];
  text?: string;
  image?: string;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
  };
}

/**
 * ThemeEngine orchestrates procedural generation of backgrounds, shapes, and decorations
 * for slides based on theme specifications and layout constraints.
 *
 * The engine delegates to specialized generators:
 * - BackgroundGenerator: Creates slide backgrounds
 * - ShapeGenerator: Creates decoration shapes
 *
 * It applies decoration rules based on slide type and theme tone, ensuring that
 * decorations don't overlap with content areas defined in the layout tree.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.8, 5.9
 */
export class ThemeEngine {
  private backgroundGenerator: BackgroundGenerator;
  private shapeGenerator: ShapeGenerator;

  constructor(backgroundGenerator?: BackgroundGenerator, shapeGenerator?: ShapeGenerator) {
    this.backgroundGenerator = backgroundGenerator || new BackgroundGenerator();
    this.shapeGenerator = shapeGenerator || new ShapeGenerator();
  }

  /**
   * Generate visual elements for a slide based on theme and layout
   *
   * This method orchestrates the generation of:
   * 1. Background element (gradient or solid based on slide type)
   * 2. Decoration shapes (geometric elements that don't overlap content)
   *
   * @param layoutNode - Root node of layout tree for the slide
   * @param colorPalette - Resolved color palette from Theme Layer
   * @param slideType - Type of slide (hero, section, content, closing)
   * @param themeTone - Theme tone (executive, minimal, modern)
   * @returns Array of visual elements (background + decorations)
   *
   * @example
   * ```typescript
   * const engine = new ThemeEngine();
   * const visuals = engine.generateVisuals(
   *   layoutNode,
   *   colorPalette,
   *   'hero',
   *   'modern'
   * );
   * // Returns: [BackgroundElement, ...ShapeElement[]]
   * ```
   */
  generateVisuals(layoutNode: LayoutNode, colorPalette: ColorPalette, slideType: SlideType, themeTone: ThemeTone): VisualElement[] {
    const visuals: VisualElement[] = [];

    // Extract slide dimensions from layout node
    const dimensions = this.extractDimensions(layoutNode);

    // Step 1: Generate background element
    // Requirements 5.5, 5.6, 5.7 - backgrounds vary by slide type
    const background = this.backgroundGenerator.generateBackground(slideType, colorPalette, dimensions);
    visuals.push(background);

    // Step 2: Extract content bounds to avoid overlap
    // Requirement 5.9 - ensure decorations don't overlap with content
    const contentBounds = this.extractContentBounds(layoutNode);

    // Step 3: Generate decoration shapes based on theme tone and slide type
    // Requirements 5.2, 5.3, 5.4, 5.8 - apply decoration rules
    const shapes = this.generateDecorations(slideType, themeTone, colorPalette, contentBounds);
    visuals.push(...shapes);

    return visuals;
  }

  /**
   * Extract slide dimensions from layout node
   * Defaults to standard 16:9 dimensions if not available or invalid
   */
  private extractDimensions(layoutNode: LayoutNode): Dimensions {
    if (layoutNode._rect && layoutNode._rect.width > 0 && layoutNode._rect.height > 0) {
      return {
        width: layoutNode._rect.width,
        height: layoutNode._rect.height,
      };
    }

    // Default to standard 16:9 slide dimensions (960x540)
    return {
      width: 960,
      height: 540,
    };
  }

  /**
   * Extract content bounds from layout tree to avoid overlap
   * Recursively traverses the layout tree and collects all content rectangles
   *
   * Requirement 5.9 - collision detection to prevent overlap
   */
  private extractContentBounds(layoutNode: LayoutNode): Rect[] {
    const bounds: Rect[] = [];

    // Helper function to recursively collect bounds
    const collectBounds = (node: LayoutNode) => {
      // Only collect bounds for nodes with actual content (text or images)
      if ((node.text || node.image) && node._rect) {
        bounds.push({
          x: node._rect.x,
          y: node._rect.y,
          width: node._rect.width,
          height: node._rect.height,
        });
      }

      // Recursively process children
      if (node.children) {
        for (const child of node.children) {
          collectBounds(child);
        }
      }
    };

    collectBounds(layoutNode);
    return bounds;
  }

  /**
   * Generate decoration shapes based on slide type and theme tone
   *
   * Decoration rules:
   * - Hero slides: More decorative shapes (3)
   * - Section slides: Moderate decoration (2)
   * - Content slides: Minimal decoration (1)
   * - Closing slides: Moderate decoration (2)
   *
   * Theme tone determines shape style:
   * - Executive: Rectangles and lines (structured)
   * - Minimal: Circles and subtle shapes (clean)
   * - Modern: Polygons and dynamic shapes (bold)
   *
   * Requirements 5.2, 5.3, 5.4, 5.8
   */
  private generateDecorations(slideType: SlideType, themeTone: ThemeTone, colorPalette: ColorPalette, contentBounds: Rect[]): VisualElement[] {
    // Requirement 5.8 - apply decoration shapes based on theme tone
    const shapes = this.shapeGenerator.generateShapes(slideType, colorPalette, contentBounds, themeTone);

    // Filter out any null shapes (couldn't find non-overlapping position)
    return shapes.filter((shape) => shape !== null);
  }
}
