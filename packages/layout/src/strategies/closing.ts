/**
 * Closing Layout Strategy
 *
 * Final slide - thank you, Q&A, or call to action
 * Similar to hero but with different tone/purpose
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";

export function layoutClosing(content: any[]): LayoutTree {
  // Extract from Blueprint content blocks
  let title = "";
  let subtitle = "";
  let cta = ""; // Call to action

  for (const block of content) {
    if (block.type === "heading" && block.value && !title) {
      title = block.value;
    } else if (block.type === "text" && block.value && !subtitle) {
      subtitle = block.value;
    } else if (block.type === "bullets" && block.items && !cta) {
      cta = block.items[0]?.text || "";
    }
  }

  // Fallback defaults
  if (!title) title = "Thank You";
  if (!subtitle) subtitle = "Questions?";

  console.log(`        [layoutClosing] Building closing layout - title: "${title.substring(0, 30)}..."`);

  const children: TextNode[] = [];

  // Main title (large)
  children.push({
    id: "title",
    type: "text",
    content: title,
    text: {
      fontSize: 56,
      fontWeight: "bold",
      align: "center",
    },
  });

  // Decorative line
  children.push({
    id: "divider",
    type: "text",
    content: "—",
    text: {
      fontSize: 24,
      align: "center",
      colorRole: "accent" as any,
    },
  });

  // Subtitle
  children.push({
    id: "subtitle",
    type: "text",
    content: subtitle,
    text: {
      fontSize: 24,
      align: "center",
      colorRole: "textMuted" as any,
    },
  });

  // CTA (optional)
  if (cta) {
    children.push({
      id: "cta",
      type: "text",
      content: cta,
      text: {
        fontSize: 18,
        fontWeight: "bold",
        align: "center",
        colorRole: "accent" as any,
      },
    });
  }

  const root: ContainerNode = {
    id: "root",
    type: "container",
    children,
    layout: {
      type: "flow",
      direction: "vertical",
      gap: 3,
      align: "center",
    },
    padding: {
      top: 20,
      right: 15,
      bottom: 20,
      left: 15,
    },
  };

  console.log(`        [layoutClosing] COMPLETED`);
  return { root };
}
