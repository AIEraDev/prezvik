import type { ColorPalette } from "@prezvik/theme-layer";
import { ThemeEngine } from "./theme-engine.js";
import { VisualContextBuilder, type LayoutTree } from "./visual-context-builder.js";
import type { SlideVisualContext, ThemeTone } from "./models/visual-context.js";
import type { BackgroundElement, ShapeElement, ContentElement } from "./models/visual-element.js";

/**
 * Slide theme specification for individual slides
 */
export interface SlideTheme {
  slideId: string;
  backgroundMode: "dark" | "light";
  accentColor: string;
  headerStyle: "band" | "none";
  decorations: Decoration[];
}

export type Decoration = { kind: "left-bar"; color: string; width: number } | { kind: "oval"; x: number; y: number; w: number; h: number; color: string; opacity: number } | { kind: "bottom-bar"; color: string; height: number } | { kind: "corner-accent"; position: "top-right" | "top-left"; color: string };

/**
 * VisualLayerFacade provides a simplified interface to the Visual Layer
 * for the pipeline controller.
 *
 * The facade:
 * 1. Orchestrates ThemeEngine to generate visual elements
 * 2. Separates visual elements by type (background, decorations, content)
 * 3. Converts layout nodes to content elements
 * 4. Returns complete SlideVisualContext ready for rendering
 *
 * Requirements: 2.7, 4.5
 */
export class VisualLayerFacade {
  private themeEngine: ThemeEngine;
  // @ts-expect-error - Reserved for future use when building complete VisualContext
  private visualContextBuilder: VisualContextBuilder;

  /**
   * Create a new VisualLayerFacade
   *
   * @param themeEngine - Optional ThemeEngine instance (creates default if not provided)
   * @param visualContextBuilder - Optional VisualContextBuilder instance (creates default if not provided)
   */
  constructor(themeEngine?: ThemeEngine, visualContextBuilder?: VisualContextBuilder) {
    this.themeEngine = themeEngine || new ThemeEngine();
    this.visualContextBuilder = visualContextBuilder || new VisualContextBuilder();
  }

  /**
   * Generate visual elements for a single slide
   *
   * This method:
   * 1. Calls ThemeEngine to generate backgrounds and decorations
   * 2. Separates visual elements by type
   * 3. Converts layout tree to content elements
   * 4. Returns complete SlideVisualContext
   *
   * @param layoutTree - Layout tree for the slide
   * @param colorPalette - Resolved color palette from Theme Layer
   * @param _slideTheme - Slide-specific theme settings (reserved for future use)
   * @param themeTone - Global theme tone
   * @returns Complete visual context for the slide
   *
   * @throws Error if background element is missing
   *
   * Requirements: 2.7, 4.5
   *
   * @example
   * ```typescript
   * const facade = new VisualLayerFacade();
   * const slideVisuals = await facade.generateSlideVisuals(
   *   layoutTree,
   *   colorPalette,
   *   slideTheme,
   *   'modern'
   * );
   * ```
   */
  async generateSlideVisuals(layoutTree: LayoutTree, colorPalette: ColorPalette, _slideTheme: SlideTheme, themeTone: ThemeTone): Promise<SlideVisualContext> {
    // Extract slide metadata
    const slideType = layoutTree.metadata.slideType as any; // Cast to SlideType
    const slideId = layoutTree.metadata.slideId;

    // Extract dimensions from layout tree root
    const dimensions = this.extractDimensions(layoutTree);

    // Step 1: Generate visual elements using ThemeEngine
    // This produces backgrounds and decoration shapes
    const visualElements = this.themeEngine.generateVisuals(layoutTree.root, colorPalette, slideType, themeTone);

    // Step 2: Separate visual elements by type
    // Requirement 2.7 - separate visual elements by type
    const background = visualElements.find((e) => e.kind === "background") as BackgroundElement;
    const decorations = visualElements.filter((e) => e.kind === "shape") as ShapeElement[];

    // Validate background exists
    if (!background) {
      throw new Error(`Failed to generate background for slide ${slideId}`);
    }

    // Step 3: Convert layout tree to content elements
    // Requirement 2.7 - layout-to-content conversion
    const content = this.convertLayoutToContent(layoutTree);

    // Step 4: Return complete SlideVisualContext
    return {
      slideId,
      type: slideType,
      dimensions,
      background,
      decorations,
      content,
    };
  }

  /**
   * Extract slide dimensions from layout tree
   * Defaults to standard 16:9 dimensions if not available
   */
  private extractDimensions(layoutTree: LayoutTree) {
    const root = layoutTree.root;

    if (root._rect && root._rect.width > 0 && root._rect.height > 0) {
      return {
        width: root._rect.width,
        height: root._rect.height,
      };
    }

    // Default to standard 16:9 slide dimensions (960x540)
    return {
      width: 960,
      height: 540,
    };
  }

  /**
   * Convert layout tree to content elements
   *
   * Recursively traverses the layout tree and extracts text and image content,
   * converting them to ContentElement objects.
   *
   * This is a simplified version that delegates to VisualContextBuilder's
   * internal logic. The facade provides a clean interface for the pipeline.
   *
   * Requirement 2.7 - layout-to-content conversion
   */
  private convertLayoutToContent(layoutTree: LayoutTree): ContentElement[] {
    const content: ContentElement[] = [];
    let elementIdCounter = 0;

    /**
     * Recursively process layout node and its children
     */
    const processNode = (node: any) => {
      // Extract text content
      if (node.text && node._rect) {
        const textElement: ContentElement = {
          id: `content-text-${elementIdCounter++}`,
          kind: "text",
          zIndex: 10, // Content above decorations
          opacity: 1,
          bounds: {
            x: node._rect.x,
            y: node._rect.y,
            width: node._rect.width,
            height: node._rect.height,
          },
          content: {
            text: node.text,
            font: node.style?.fontFamily || "Calibri",
            fontSize: node.style?.fontSize || 14,
            color: node.style?.textColor || "#000000",
            align: "left",
            verticalAlign: "top",
          },
        };
        content.push(textElement);
      }

      // Extract image content
      if (node.image && node._rect) {
        const imageElement: ContentElement = {
          id: `content-image-${elementIdCounter++}`,
          kind: "image",
          zIndex: 10, // Content above decorations
          opacity: 1,
          bounds: {
            x: node._rect.x,
            y: node._rect.y,
            width: node._rect.width,
            height: node._rect.height,
          },
          content: {
            src: node.image,
            fit: "cover",
          },
        };
        content.push(imageElement);
      }

      // Recursively process children
      if (node.children) {
        for (const child of node.children) {
          processNode(child);
        }
      }
    };

    processNode(layoutTree.root);
    return content;
  }
}
