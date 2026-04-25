/**
 * Layout Engine
 *
 * Transforms Kyro Blueprint into positioned layout tree
 * This is where "beautiful slides" actually comes from
 *
 * CORE PRINCIPLE:
 * Layout is always explicit (no guessing in renderer)
 */

import type { KyroBlueprint, Slide, ContentBlock, MediaBlock } from "@kyro/schema";
import { getLayoutRule } from "@kyro/schema";
import type { LayoutTree, LayoutNode, ContainerNode, ImageNode } from "../types.js";

/**
 * Simple hash function for slide cache keys
 * Includes content length and more of the content to prevent collisions
 */
function hashSlide(slide: Slide): string {
  const contentHash = slide.content
    .map((c) => {
      const type = c.type;
      // Handle different content block types
      if ("value" in c && typeof c.value === "string") {
        // Include first 50 chars and full length to differentiate similar content
        return `${type}:${c.value.slice(0, 50)}:len${c.value.length}`;
      }
      if ("text" in c && typeof c.text === "string") {
        return `${type}:${c.text.slice(0, 50)}:len${c.text.length}`;
      }
      if ("items" in c && Array.isArray(c.items)) {
        return `${type}:items${c.items.length}`;
      }
      return type;
    })
    .join("|");

  const mediaHash = slide.media?.map((m) => `${m.type}:${m.source?.url || m.source?.query || ""}:${m.placement || "inline"}`).join("|") || "";

  // Combine all elements with content count for better collision resistance
  return `${slide.id}:${slide.layout}:${slide.type}:c${slide.content.length}:${contentHash}:m${slide.media?.length || 0}:${mediaHash}`;
}

/**
 * Layout Engine
 *
 * Converts Blueprint IR → Positioned Layout Tree
 * Uses caching to avoid regenerating identical layouts
 */
export class LayoutEngine {
  private cache = new Map<string, LayoutTree>();

  /**
   * Generate layout tree from blueprint
   * Caches layouts by slide hash for improved performance on repeated calls
   * Processes slides in parallel for better performance with large decks
   */
  async generateLayout(blueprint: KyroBlueprint): Promise<LayoutTree[]> {
    // Process all slides in parallel for better performance
    const layoutPromises = blueprint.slides.map(async (slide) => {
      const cacheKey = hashSlide(slide);

      // Check cache first
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      // Generate and cache new layout
      const layout = this.generateSlideLayout(slide);
      this.cache.set(cacheKey, layout);
      return layout;
    });

    return Promise.all(layoutPromises);
  }

  /**
   * Clear the layout cache
   * Call this if you need to force regeneration of all layouts
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Generate layout for a single slide
   */
  private generateSlideLayout(slide: Slide): LayoutTree {
    const rule = getLayoutRule(slide.layout);

    // Create root container
    const root: ContainerNode = {
      type: "container",
      id: slide.id,
      layout: {
        type: "flow",
        direction: "vertical",
        gap: rule.gap * 8, // Convert to pixels
      },
      children: [],
    };

    // Apply layout-specific composition
    switch (rule.composition) {
      case "center":
        root.children = this.composeCenterLayout(slide, rule);
        break;

      case "split":
        root.children = this.composeSplitLayout(slide, rule);
        break;

      case "grid":
        root.children = this.composeGridLayout(slide, rule);
        break;

      case "left":
      case "right":
        root.children = this.composeAlignedLayout(slide, rule);
        break;
    }

    // Add media blocks if present - use placement-aware composition
    if (slide.media && slide.media.length > 0) {
      const mediaContainers = this.composeMediaWithPlacement(slide, rule);
      // Insert media at appropriate positions based on placement type
      for (const container of mediaContainers) {
        if (container.placement === "background" || container.placement === "full_bleed") {
          // Background images should be first (bottom layer)
          root.children.unshift(container.node);
        } else if (container.placement === "side") {
          // Side images need special layout handling - add as sibling columns
          this.integrateSideMedia(root, container.node, rule);
        } else {
          // Inline images go at the end
          root.children.push(container.node);
        }
      }
    }

    return {
      root,
    };
  }

  /**
   * Compose media nodes with placement-aware positioning
   */
  private composeMediaWithPlacement(slide: Slide, rule: any): Array<{ node: LayoutNode; placement: string }> {
    const containers: Array<{ node: LayoutNode; placement: string }> = [];

    for (let i = 0; i < slide.media!.length; i++) {
      const media = slide.media![i];
      const container = this.createMediaNodeWithPlacement(media, slide.id, i, rule);
      if (container) {
        containers.push(container);
      }
    }

    return containers;
  }

  /**
   * Create layout node from media block with proper placement
   */
  private createMediaNodeWithPlacement(media: MediaBlock, slideId: string, mediaIndex: number, _rule: any): { node: LayoutNode; placement: string } | null {
    // Get source URL from media block
    let src = "";
    if (media.source?.url) {
      src = media.source.url;
    } else if (media.source?.query) {
      src = `placeholder:${media.source.query}`;
    }

    // Determine object fit based on placement and style
    let objectFit: "contain" | "cover" = "cover";
    if (media.placement === "inline" || media.style?.crop === "square") {
      objectFit = "contain";
    }

    const placement = media.placement || "inline";
    const nodeId = `${slideId}-media-${mediaIndex}`;

    switch (placement) {
      case "background":
      case "full_bleed": {
        // Full-bleed background image
        const bgNode: ImageNode & { _rect: any } = {
          type: "image",
          id: nodeId,
          src,
          objectFit: "cover",
          _rect: { x: 0, y: 0, width: 100, height: 100 },
        };
        return { node: bgNode, placement };
      }

      case "side": {
        // Side column image - will be integrated into split layout
        const sideNode: ImageNode = {
          type: "image",
          id: nodeId,
          src,
          objectFit,
        };
        return { node: sideNode, placement };
      }

      case "inline":
      default: {
        // Inline image within content flow
        const inlineNode: ImageNode = {
          type: "image",
          id: nodeId,
          src,
          objectFit,
        };
        return { node: inlineNode, placement };
      }
    }
  }

  /**
   * Integrate side media into split layout composition
   */
  private integrateSideMedia(root: ContainerNode, mediaNode: LayoutNode, rule: any): void {
    // For split layouts, convert to two-column with media on one side
    if (rule.composition === "split" || rule.composition === "center") {
      // Create a container that splits content and media
      const contentColumn: ContainerNode = {
        type: "container",
        id: `${root.id}-content`,
        layout: { type: "flow", direction: "vertical", gap: rule.gap * 8 },
        children: [...root.children], // Move existing children
      };

      const mediaColumn: ContainerNode = {
        type: "container",
        id: `${root.id}-media`,
        layout: { type: "flow", direction: "vertical", gap: 0 },
        children: [mediaNode],
      };

      // Replace root children with split columns
      root.layout = { type: "absolute" };
      root.children = [contentColumn, mediaColumn];
    } else {
      // For other layouts, add media as regular child
      root.children.push(mediaNode);
    }
  }

  /**
   * Compose center-focused layout
   */
  private composeCenterLayout(slide: Slide, rule: any): LayoutNode[] {
    const nodes: LayoutNode[] = [];

    // Add content blocks with deterministic IDs
    for (let i = 0; i < slide.content.length; i++) {
      const block = slide.content[i];
      const node = this.createContentNode(block, rule, slide.id, i);
      if (node) {
        nodes.push(node);
      }
    }

    return nodes;
  }

  /**
   * Compose split layout (two columns)
   * Supports configurable split ratio (e.g., 0.3 for 30/70, 0.5 for 50/50)
   * Uses semantic chunking to keep related content together
   */
  private composeSplitLayout(slide: Slide, rule: any): LayoutNode[] {
    // Get split ratio from rule, default to 50/50
    const splitRatio = Math.max(0.1, Math.min(0.9, rule.splitRatio ?? 0.5));
    const leftWidth = splitRatio * 100;
    const rightWidth = (1 - splitRatio) * 100;

    // Create columns with explicit _rect for absolute positioning
    const leftColumn: ContainerNode & { _rect: any } = {
      type: "container",
      id: `${slide.id}-left`,
      layout: {
        type: "flow",
        direction: "vertical",
        gap: rule.gap * 8,
        align: "left",
      },
      children: [],
      _rect: { x: 0, y: 0, width: leftWidth, height: 100 },
    };

    const rightColumn: ContainerNode & { _rect: any } = {
      type: "container",
      id: `${slide.id}-right`,
      layout: {
        type: "flow",
        direction: "vertical",
        gap: rule.gap * 8,
        align: "left",
      },
      children: [],
      _rect: { x: leftWidth, y: 0, width: rightWidth, height: 100 },
    };

    // Semantic chunking: group related content blocks together
    // Headings stay with their following content blocks
    const chunks = this.createSemanticChunks(slide.content);
    const midpoint = Math.ceil(chunks.length / 2);

    // Distribute chunks between columns
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const targetColumn = i < midpoint ? leftColumn : rightColumn;

      for (let j = 0; j < chunk.length; j++) {
        const contentIndex = slide.content.indexOf(chunk[j]);
        const node = this.createContentNode(chunk[j], rule, slide.id, contentIndex);
        if (node) {
          targetColumn.children!.push(node);
        }
      }
    }

    // Use absolute layout to respect the _rect positioning
    const container: LayoutNode = {
      type: "container",
      id: `${slide.id}-columns`,
      layout: {
        type: "absolute",
      },
      children: [leftColumn as LayoutNode, rightColumn as LayoutNode],
    };

    return [container];
  }

  /**
   * Create semantic chunks from content blocks
   * Groups headings with their following content to keep related items together
   */
  private createSemanticChunks(content: ContentBlock[]): ContentBlock[][] {
    const chunks: ContentBlock[][] = [];
    let currentChunk: ContentBlock[] = [];

    for (const block of content) {
      if (block.type === "heading") {
        // Start a new chunk with this heading
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
        }
        currentChunk = [block];
      } else {
        // Add to current chunk
        currentChunk.push(block);
      }
    }

    // Don't forget the last chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // If we ended up with too many small chunks, merge some
    if (chunks.length > 4) {
      const merged: ContentBlock[][] = [];
      let i = 0;
      while (i < chunks.length) {
        if (i + 1 < chunks.length && chunks[i].length + chunks[i + 1].length <= 3) {
          // Merge small adjacent chunks
          merged.push([...chunks[i], ...chunks[i + 1]]);
          i += 2;
        } else {
          merged.push(chunks[i]);
          i++;
        }
      }
      return merged;
    }

    return chunks;
  }

  /**
   * Compose grid layout
   */
  private composeGridLayout(slide: Slide, rule: any): LayoutNode[] {
    const grid: ContainerNode = {
      type: "container",
      id: `${slide.id}-grid`,
      layout: {
        type: "grid",
        columns: rule.columns || 2,
      },
      children: [],
    };

    // Add content blocks to grid with deterministic IDs
    for (let i = 0; i < slide.content.length; i++) {
      const node = this.createContentNode(slide.content[i], rule, slide.id, i);
      if (node) {
        grid.children.push(node);
      }
    }

    return [grid];
  }

  /**
   * Compose aligned layout (left or right)
   */
  private composeAlignedLayout(slide: Slide, rule: any): LayoutNode[] {
    const nodes: LayoutNode[] = [];

    for (let i = 0; i < slide.content.length; i++) {
      const node = this.createContentNode(slide.content[i], rule, slide.id, i);
      if (node) {
        nodes.push(node);
      }
    }

    return nodes;
  }

  /**
   * Create layout node from content block
   */
  private createContentNode(block: ContentBlock, rule: any, slideId: string, blockIndex: number): LayoutNode | null {
    switch (block.type) {
      case "heading":
        return {
          type: "text",
          id: `${slideId}-heading-${blockIndex}`,
          content: block.value,
          text: {
            fontRole: "title",
            fontSize: this.parseFontSize(rule.titleSize),
            fontWeight: "bold",
            align: rule.alignment,
          },
        };

      case "text":
        return {
          type: "text",
          id: `${slideId}-text-${blockIndex}`,
          content: block.value,
          text: {
            fontRole: "body",
            fontSize: this.parseFontSize(rule.bodySize),
            fontWeight: "normal",
            align: rule.alignment,
          },
        };

      case "bullets":
        return {
          type: "container",
          id: `${slideId}-bullets-${blockIndex}`,
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 12,
            align: "left",
          },
          children: block.items.map((item, i) => ({
            type: "text",
            id: `${slideId}-bullet-${blockIndex}-${i}`,
            content: item.icon ? `${item.icon} ${item.text}` : `• ${item.text}`,
            text: {
              fontRole: "body",
              fontSize: this.parseFontSize(rule.bodySize),
              fontWeight: item.highlight ? "bold" : "normal",
              align: "left",
            },
          })),
        };

      case "quote":
        return {
          type: "container",
          id: `${slideId}-quote-${blockIndex}`,
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 16,
            align: "center",
          },
          children: [
            {
              type: "text",
              id: `${slideId}-quote-text-${blockIndex}`,
              content: `"${block.text}"`,
              text: {
                fontRole: "title",
                fontSize: this.parseFontSize(rule.titleSize),
                fontWeight: "normal",
                align: "center",
              },
            },
            block.author
              ? {
                  type: "text",
                  id: `${slideId}-quote-author-${blockIndex}`,
                  content: block.role ? `${block.author}, ${block.role}` : block.author,
                  text: {
                    fontRole: "body",
                    fontSize: this.parseFontSize(rule.bodySize),
                    fontWeight: "normal",
                    align: "center",
                  },
                }
              : null,
          ].filter(Boolean) as LayoutNode[],
        };

      case "stat":
        return {
          type: "container",
          id: `${slideId}-stat-${blockIndex}`,
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 8,
            align: "center",
          },
          children: [
            {
              type: "text",
              id: `${slideId}-stat-value-${blockIndex}`,
              content: `${block.prefix || ""}${block.value}${block.suffix || ""}`,
              text: {
                fontRole: "display",
                fontSize: block.visualWeight === "hero" ? 96 : block.visualWeight === "emphasis" ? 72 : 56,
                fontWeight: "bold",
                align: "center",
              },
            },
            {
              type: "text",
              id: `${slideId}-stat-label-${blockIndex}`,
              content: block.label,
              text: {
                fontRole: "body",
                fontSize: this.parseFontSize(rule.bodySize),
                fontWeight: "normal",
                align: "center",
              },
            },
          ],
        };

      case "code":
        return {
          type: "text",
          id: `${slideId}-code-${blockIndex}`,
          content: block.code,
          text: {
            fontRole: "code",
            fontSize: 14,
            fontWeight: "normal",
            align: "left",
          },
        };

      default:
        return null;
    }
  }

  /**
   * Parse font size range (e.g., "48-64px") or single value (e.g., "24px") to single value
   */
  private parseFontSize(sizeRange: string): number {
    // Try range format first: "48-64px"
    const rangeMatch = sizeRange.match(/(\d+)-(\d+)px/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]);
      const max = parseInt(rangeMatch[2]);
      return (min + max) / 2; // Use midpoint
    }

    // Try single value format: "24px"
    const singleMatch = sizeRange.match(/(\d+)px/);
    if (singleMatch) {
      return parseInt(singleMatch[1]);
    }

    // Try plain number
    const numberMatch = sizeRange.match(/^(\d+)$/);
    if (numberMatch) {
      return parseInt(numberMatch[1]);
    }

    return 16; // Fallback
  }
}

/**
 * Global instance
 */
let globalEngine: LayoutEngine | null = null;

/**
 * Get global layout engine instance
 */
export function getLayoutEngine(): LayoutEngine {
  if (!globalEngine) {
    globalEngine = new LayoutEngine();
  }
  return globalEngine;
}
