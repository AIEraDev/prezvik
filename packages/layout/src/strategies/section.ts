/**
 * Section Layout Strategy
 *
 * Section divider slide - large title, minimal content
 * Used to introduce new sections in a presentation
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";

export function layoutSection(content: any[]): LayoutTree {
  // Extract from Blueprint content blocks
  let title = "";
  let subtitle = "";

  for (const block of content) {
    if (block.type === "heading" && block.value && !title) {
      title = block.value;
    } else if ((block.type === "text" || block.type === "kicker") && block.value && !subtitle) {
      subtitle = block.value;
    }
  }

  // Fallback
  if (!title) title = "Section";

  console.log(`        [layoutSection] Building section layout - title: "${title.substring(0, 30)}..."`);

  const children: TextNode[] = [];

  // Subtitle/kicker (optional, appears first in section slides)
  if (subtitle) {
    children.push({
      id: "subtitle",
      type: "text",
      content: subtitle,
      text: {
        fontSize: 20,
        fontWeight: "normal",
        align: "center",
        fontRole: "small" as any,
        colorRole: "textMuted" as any,
      },
    });
  }

  // Large title
  children.push({
    id: "title",
    type: "text",
    content: title,
    text: {
      fontSize: 56,
      fontWeight: "bold",
      align: "center",
      fontRole: "hero" as any,
      colorRole: "text" as any,
    },
  });

  const root: ContainerNode = {
    id: "root",
    type: "container",
    children,
    layout: {
      type: "flow",
      direction: "vertical",
      gap: 4,
      align: "center",
    },
    padding: {
      top: 20,
      right: 15,
      bottom: 20,
      left: 15,
    },
  };

  console.log(`        [layoutSection] COMPLETED - created ${children.length} text nodes`);
  return { root };
}
