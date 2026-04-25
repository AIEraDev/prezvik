/**
 * Content Layout Strategy
 *
 * General content slide - flexible layout for mixed content
 * Handles headings, text, bullets, and code blocks
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";

export function layoutContent(content: any[]): LayoutTree {
  console.log(`        [layoutContent] Building content layout - blocks: ${content.length}`);

  const children: (TextNode | ContainerNode)[] = [];

  for (let i = 0; i < content.length; i++) {
    const block = content[i];

    if (block.type === "heading") {
      children.push({
        id: `heading-${i}`,
        type: "text",
        content: block.value,
        text: {
          fontSize: block.level === "h1" ? 36 : block.level === "h2" ? 28 : 22,
          fontWeight: "bold",
          align: "left",
          fontRole: block.level || "h1" as any,
        },
      });
    } else if (block.type === "text") {
      children.push({
        id: `text-${i}`,
        type: "text",
        content: block.value,
        text: {
          fontSize: 16,
          align: "left",
          fontRole: "body" as any,
        },
      });
    } else if (block.type === "bullets") {
      // Create bullet items as a container
      const bulletChildren: TextNode[] = block.items.map((item: any, j: number) => ({
        id: `bullet-${i}-${j}`,
        type: "text",
        content: item.icon ? `${item.icon} ${item.text}` : `• ${item.text}`,
        text: {
          fontSize: 16,
          align: "left",
          fontRole: "body" as any,
        },
      }));

      children.push({
        id: `bullets-${i}`,
        type: "container",
        children: bulletChildren,
        layout: {
          type: "flow",
          direction: "vertical",
          gap: 1,
          align: "left",
        },
      });
    } else if (block.type === "code") {
      children.push({
        id: `code-${i}`,
        type: "text",
        content: block.code,
        text: {
          fontSize: 12,
          align: "left",
          fontRole: "mono" as any,
          colorRole: "textMuted" as any,
        },
      });
    }
  }

  const root: ContainerNode = {
    id: "root",
    type: "container",
    children,
    layout: {
      type: "flow",
      direction: "vertical",
      gap: 2,
      align: "left",
    },
    padding: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  };

  console.log(`        [layoutContent] COMPLETED - created ${children.length} nodes`);
  return { root };
}
