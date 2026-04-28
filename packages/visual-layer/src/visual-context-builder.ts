import type { ColorPalette } from "@prezvik/theme-layer";
import type { VisualContext, SlideVisualContext, ThemeTone, ThemeTypography, Dimensions } from "./models/visual-context.js";
import type { VisualElement, ContentElement, TextContent, ImageContent } from "./models/visual-element.js";
import type { LayoutNode } from "./theme-engine.js";
import { createHash } from "crypto";

/**
 * Layout tree structure containing slide metadata
 */
export interface LayoutTree {
  root: LayoutNode;
  metadata: {
    slideId: string;
    slideType: string;
  };
}

/**
 * VisualContextBuilder constructs the Visual Context intermediate representation
 * by merging layout trees with generated visual elements.
 *
 * The builder:
 * 1. Converts layout nodes to content elements (text/image)
 * 2. Merges content with generated visual elements (backgrounds/decorations)
 * 3. Organizes elements by slide
 * 4. Adds metadata for caching and debugging
 * 5. Validates completeness
 *
 * Requirements: 2.8, 4.5
 */
export class VisualContextBuilder {
  /**
   * Build Visual Context from layout trees and visual elements
   *
   * @param layoutTrees - Resolved layout trees for all slides
   * @param visualElements - Generated visual elements per slide (backgrounds + decorations)
   * @param colorPalette - Color palette used for generation
   * @param themeTone - Theme tone applied
   * @param typography - Typography settings
   * @param themeSpecHash - Hash of ThemeSpec for cache invalidation
   * @returns Complete Visual Context ready for rendering
   *
   * @throws Error if layoutTrees and visualElements arrays have different lengths
   * @throws Error if any slide is missing required elements
   *
   * Requirements: 2.8, 4.5
   */
  build(layoutTrees: LayoutTree[], visualElements: VisualElement[][], colorPalette: ColorPalette, themeTone: ThemeTone, typography: ThemeTypography, themeSpecHash: string): VisualContext {
    // Validate input arrays have matching lengths
    if (layoutTrees.length !== visualElements.length) {
      throw new Error(`Layout trees count (${layoutTrees.length}) does not match visual elements count (${visualElements.length})`);
    }

    const slides: SlideVisualContext[] = [];

    // Process each slide
    for (let i = 0; i < layoutTrees.length; i++) {
      const layoutTree = layoutTrees[i];
      const slideVisuals = visualElements[i];

      // Build slide visual context
      const slideContext = this.buildSlideContext(layoutTree, slideVisuals);

      slides.push(slideContext);
    }

    // Validate completeness
    this.validateCompleteness(slides);

    // Construct Visual Context
    const visualContext: VisualContext = {
      version: "1.0",
      slides,
      colorPalette,
      theme: {
        tone: themeTone,
        typography,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        layoutTreeHash: this.hashLayoutTrees(layoutTrees),
        themeSpecHash,
      },
    };

    return visualContext;
  }

  /**
   * Build visual context for a single slide
   *
   * Merges layout tree content with generated visual elements:
   * - Separates background element (kind: 'background')
   * - Separates decoration shapes (kind: 'shape')
   * - Converts layout nodes to content elements (kind: 'text' | 'image')
   */
  private buildSlideContext(layoutTree: LayoutTree, visualElements: VisualElement[]): SlideVisualContext {
    // Extract slide metadata
    const { slideId, slideType } = layoutTree.metadata;

    // Extract dimensions from root layout node
    const dimensions = this.extractDimensions(layoutTree.root);

    // Separate visual elements by kind
    const background = visualElements.find((el) => el.kind === "background");
    const decorations = visualElements.filter((el) => el.kind === "shape");

    // Validate background exists
    if (!background) {
      throw new Error(`Slide ${slideId} is missing background element`);
    }

    // Convert layout nodes to content elements
    // Requirement 2.7 - layout-to-content conversion
    const content = this.layoutToContent(layoutTree.root);

    return {
      slideId,
      type: slideType as any, // Cast to SlideType
      dimensions,
      background,
      decorations,
      content,
    };
  }

  /**
   * Convert layout node tree to content elements
   *
   * Recursively traverses the layout tree and extracts text and image content,
   * converting them to ContentElement objects with proper bounds and styling.
   *
   * Requirement 2.7 - layout-to-content conversion
   *
   * @param layoutNode - Root layout node to convert
   * @returns Array of content elements (text and image)
   */
  private layoutToContent(layoutNode: LayoutNode): ContentElement[] {
    const content: ContentElement[] = [];
    let elementIdCounter = 0;

    /**
     * Recursively process layout node and its children
     */
    const processNode = (node: LayoutNode) => {
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
          content: this.extractTextContent(node),
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
          content: this.extractImageContent(node),
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

    processNode(layoutNode);
    return content;
  }

  /**
   * Extract text content properties from layout node
   *
   * Requirement 2.7 - extract text content from layout nodes
   */
  private extractTextContent(node: LayoutNode): TextContent {
    const style = node.style || {};

    return {
      text: node.text || "",
      font: style.fontFamily || "Arial",
      fontSize: style.fontSize || 16,
      color: style.textColor || "#000000",
      align: "left", // Default alignment
      verticalAlign: "top", // Default vertical alignment
      bold: false,
      italic: false,
    };
  }

  /**
   * Extract image content properties from layout node
   *
   * Requirement 2.7 - extract image content from layout nodes
   */
  private extractImageContent(node: LayoutNode): ImageContent {
    return {
      src: node.image || "",
      fit: "cover", // Default fit mode
    };
  }

  /**
   * Extract slide dimensions from layout node
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
   * Validate that all slides have required elements
   *
   * Requirement 2.8 - validate completeness
   */
  private validateCompleteness(slides: SlideVisualContext[]): void {
    for (const slide of slides) {
      // Validate background exists
      if (!slide.background) {
        throw new Error(`Slide ${slide.slideId} is missing background element`);
      }

      // Validate dimensions are positive
      if (slide.dimensions.width <= 0 || slide.dimensions.height <= 0) {
        throw new Error(`Slide ${slide.slideId} has invalid dimensions: ${JSON.stringify(slide.dimensions)}`);
      }

      // Validate decorations array exists (can be empty)
      if (!Array.isArray(slide.decorations)) {
        throw new Error(`Slide ${slide.slideId} has invalid decorations (not an array)`);
      }

      // Validate content array exists (can be empty)
      if (!Array.isArray(slide.content)) {
        throw new Error(`Slide ${slide.slideId} has invalid content (not an array)`);
      }
    }
  }

  /**
   * Generate hash of layout trees for cache invalidation
   *
   * Requirement 4.5 - add metadata for caching
   */
  private hashLayoutTrees(layoutTrees: LayoutTree[]): string {
    // Create a stable string representation of layout trees
    const treeString = JSON.stringify(
      layoutTrees.map((tree) => ({
        slideId: tree.metadata.slideId,
        slideType: tree.metadata.slideType,
        // Include root rect for structural changes
        rootRect: tree.root._rect,
      })),
    );

    // Generate hash
    return createHash("sha256").update(treeString).digest("hex").substring(0, 16);
  }
}
