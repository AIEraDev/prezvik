/**
 * Layout Engine v2
 *
 * Transforms Kyro Blueprint into positioned layout tree
 * This is where "beautiful slides" actually comes from
 *
 * CORE PRINCIPLE:
 * Layout is always explicit (no guessing in renderer)
 */

import type { KyroBlueprint, Slide, ContentBlock } from "@kyro/schema";
import { getLayoutRule } from "@kyro/schema";
import type { LayoutTree, LayoutNode, ContainerNode } from "../types.js";

/**
 * Layout Engine
 *
 * Converts Blueprint IR → Positioned Layout Tree
 */
export class LayoutEngineV2 {
  /**
   * Generate layout tree from blueprint
   */
  generateLayout(blueprint: KyroBlueprint): LayoutTree[] {
    return blueprint.slides.map((slide) => this.generateSlideLayout(slide));
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

    return {
      root,
    };
  }

  /**
   * Compose center-focused layout
   */
  private composeCenterLayout(slide: Slide, rule: any): LayoutNode[] {
    const nodes: LayoutNode[] = [];

    // Add content blocks
    for (const block of slide.content) {
      const node = this.createContentNode(block, rule);
      if (node) {
        nodes.push(node);
      }
    }

    return nodes;
  }

  /**
   * Compose split layout (two columns)
   */
  private composeSplitLayout(slide: Slide, rule: any): LayoutNode[] {
    const leftColumn: ContainerNode = {
      type: "container",
      id: `${slide.id}-left`,
      layout: {
        type: "flow",
        direction: "vertical",
        gap: rule.gap * 8,
        align: "left",
      },
      children: [],
    };

    const rightColumn: ContainerNode = {
      type: "container",
      id: `${slide.id}-right`,
      layout: {
        type: "flow",
        direction: "vertical",
        gap: rule.gap * 8,
        align: "left",
      },
      children: [],
    };

    // Distribute content between columns
    const midpoint = Math.ceil(slide.content.length / 2);
    const leftContent = slide.content.slice(0, midpoint);
    const rightContent = slide.content.slice(midpoint);

    for (const block of leftContent) {
      const node = this.createContentNode(block, rule);
      if (node) {
        leftColumn.children!.push(node);
      }
    }

    for (const block of rightContent) {
      const node = this.createContentNode(block, rule);
      if (node) {
        rightColumn.children!.push(node);
      }
    }

    // Wrap in horizontal container
    const container: LayoutNode = {
      type: "container",
      id: `${slide.id}-columns`,
      layout: {
        type: "flow",
        direction: "horizontal",
        gap: rule.gap * 8,
        verticalAlign: "top",
      },
      children: [leftColumn, rightColumn],
    };

    return [container];
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

    // Add content blocks to grid
    for (const block of slide.content) {
      const node = this.createContentNode(block, rule);
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

    for (const block of slide.content) {
      const node = this.createContentNode(block, rule);
      if (node) {
        nodes.push(node);
      }
    }

    return nodes;
  }

  /**
   * Create layout node from content block
   */
  private createContentNode(block: ContentBlock, rule: any): LayoutNode | null {
    switch (block.type) {
      case "heading":
        return {
          type: "text",
          id: `heading-${Math.random().toString(36).substr(2, 9)}`,
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
          id: `text-${Math.random().toString(36).substr(2, 9)}`,
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
          id: `bullets-${Math.random().toString(36).substr(2, 9)}`,
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 12,
            align: "left",
          },
          children: block.items.map((item, i) => ({
            type: "text",
            id: `bullet-${i}`,
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
          id: `quote-${Math.random().toString(36).substr(2, 9)}`,
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 16,
            align: "center",
          },
          children: [
            {
              type: "text",
              id: "quote-text",
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
                  id: "quote-author",
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
          id: `stat-${Math.random().toString(36).substr(2, 9)}`,
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 8,
            align: "center",
          },
          children: [
            {
              type: "text",
              id: "stat-value",
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
              id: "stat-label",
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
          id: `code-${Math.random().toString(36).substr(2, 9)}`,
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
   * Parse font size range (e.g., "48-64px") to single value
   */
  private parseFontSize(sizeRange: string): number {
    const match = sizeRange.match(/(\d+)-(\d+)px/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      return (min + max) / 2; // Use midpoint
    }
    return 16; // Fallback
  }
}

/**
 * Global instance
 */
let globalEngine: LayoutEngineV2 | null = null;

/**
 * Get global layout engine instance
 */
export function getLayoutEngine(): LayoutEngineV2 {
  if (!globalEngine) {
    globalEngine = new LayoutEngineV2();
  }
  return globalEngine;
}
