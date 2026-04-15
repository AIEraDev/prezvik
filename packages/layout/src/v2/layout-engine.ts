/**
 * Layout Engine v2
 *
 * Transforms Kyro Blueprint into positioned layout tree
 * This is where "beautiful slides" actually comes from
 *
 * CORE PRINCIPLE:
 * Layout is always explicit (no guessing in renderer)
 */

import type { KyroBlueprint, Slide, ContentBlock } from "@kyro/schema/v2";
import { getLayoutRule, type LayoutType } from "@kyro/schema/v2";
import type { LayoutTree, LayoutNode } from "../types.js";

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
    const root: LayoutNode = {
      type: "container",
      id: slide.id,
      layout: {
        mode: "flow",
        direction: "vertical",
        gap: rule.gap * 8, // Convert to pixels
        padding: rule.padding * 8,
        alignment: rule.alignment,
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
      id: slide.id,
      root,
      metadata: {
        slideType: slide.type,
        layout: slide.layout,
        intent: slide.intent,
      },
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
    const leftColumn: LayoutNode = {
      type: "container",
      id: `${slide.id}-left`,
      layout: {
        mode: "flow",
        direction: "vertical",
        gap: rule.gap * 8,
        alignment: "left",
      },
      width: "50%",
      children: [],
    };

    const rightColumn: LayoutNode = {
      type: "container",
      id: `${slide.id}-right`,
      layout: {
        mode: "flow",
        direction: "vertical",
        gap: rule.gap * 8,
        alignment: "left",
      },
      width: "50%",
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
        mode: "flow",
        direction: "horizontal",
        gap: rule.gap * 8,
        alignment: "top",
      },
      children: [leftColumn, rightColumn],
    };

    return [container];
  }

  /**
   * Compose grid layout
   */
  private composeGridLayout(slide: Slide, rule: any): LayoutNode[] {
    const grid: LayoutNode = {
      type: "container",
      id: `${slide.id}-grid`,
      layout: {
        mode: "grid",
        columns: rule.columns || 2,
        rows: rule.rows,
        gap: rule.gap * 8,
        alignment: "center",
      },
      children: [],
    };

    // Add content blocks to grid
    for (const block of slide.content) {
      const node = this.createContentNode(block, rule);
      if (node) {
        grid.children!.push(node);
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
          fontRole: "title",
          fontSize: this.parseFontSize(rule.titleSize),
          fontWeight: 700,
          alignment: rule.alignment,
        };

      case "text":
        return {
          type: "text",
          id: `text-${Math.random().toString(36).substr(2, 9)}`,
          content: block.value,
          fontRole: "body",
          fontSize: this.parseFontSize(rule.bodySize),
          fontWeight: 400,
          alignment: rule.alignment,
        };

      case "bullets":
        return {
          type: "container",
          id: `bullets-${Math.random().toString(36).substr(2, 9)}`,
          layout: {
            mode: "flow",
            direction: "vertical",
            gap: 12,
            alignment: "left",
          },
          children: block.items.map((item, i) => ({
            type: "text",
            id: `bullet-${i}`,
            content: item.icon ? `${item.icon} ${item.text}` : `• ${item.text}`,
            fontRole: "body",
            fontSize: this.parseFontSize(rule.bodySize),
            fontWeight: item.highlight ? 600 : 400,
            alignment: "left",
          })),
        };

      case "quote":
        return {
          type: "container",
          id: `quote-${Math.random().toString(36).substr(2, 9)}`,
          layout: {
            mode: "flow",
            direction: "vertical",
            gap: 16,
            alignment: "center",
          },
          children: [
            {
              type: "text",
              id: "quote-text",
              content: `"${block.text}"`,
              fontRole: "title",
              fontSize: this.parseFontSize(rule.titleSize),
              fontWeight: 400,
              alignment: "center",
            },
            block.author
              ? {
                  type: "text",
                  id: "quote-author",
                  content: block.role ? `${block.author}, ${block.role}` : block.author,
                  fontRole: "body",
                  fontSize: this.parseFontSize(rule.bodySize),
                  fontWeight: 400,
                  alignment: "center",
                }
              : null,
          ].filter(Boolean) as LayoutNode[],
        };

      case "stat":
        return {
          type: "container",
          id: `stat-${Math.random().toString(36).substr(2, 9)}`,
          layout: {
            mode: "flow",
            direction: "vertical",
            gap: 8,
            alignment: "center",
          },
          children: [
            {
              type: "text",
              id: "stat-value",
              content: `${block.prefix || ""}${block.value}${block.suffix || ""}`,
              fontRole: "display",
              fontSize: block.visualWeight === "hero" ? 96 : block.visualWeight === "emphasis" ? 72 : 56,
              fontWeight: 700,
              alignment: "center",
            },
            {
              type: "text",
              id: "stat-label",
              content: block.label,
              fontRole: "body",
              fontSize: this.parseFontSize(rule.bodySize),
              fontWeight: 400,
              alignment: "center",
            },
          ],
        };

      case "code":
        return {
          type: "text",
          id: `code-${Math.random().toString(36).substr(2, 9)}`,
          content: block.code,
          fontRole: "code",
          fontSize: 14,
          fontWeight: 400,
          alignment: "left",
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
