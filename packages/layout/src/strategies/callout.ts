/**
 * Callout Layout Strategy
 *
 * Highlight/important info slide
 * Eye-catching design for key messages or warnings
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";

export function layoutCallout(content: any[]): LayoutTree {
  // Extract from Blueprint content blocks
  let title = "";
  let message = "";
  let icon = "⚠️"; // Default warning icon

  for (const block of content) {
    if (block.type === "heading" && block.value && !title) {
      title = block.value;
    } else if (block.type === "text" && block.value && !message) {
      message = block.value;
    } else if (block.type === "bullets" && block.items && !message) {
      message = block.items.map((item: any) => item.text).join("\n");
    }
  }

  // Fallback
  if (!title) title = "Important";
  if (!message) message = "Key information here...";

  console.log(`        [layoutCallout] Building callout layout - title: "${title.substring(0, 30)}..."`);

  const children: TextNode[] = [];

  // Icon
  children.push({
    id: "icon",
    type: "text",
    content: icon,
    text: {
      fontSize: 48,
      align: "center",
    },
  });

  // Title
  children.push({
    id: "title",
    type: "text",
    content: title,
    text: {
      fontSize: 32,
      fontWeight: "bold",
      align: "center",
    },
  });

  // Message
  children.push({
    id: "message",
    type: "text",
    content: message,
    text: {
      fontSize: 18,
      align: "center",
      colorRole: "textMuted" as any,
    },
  });

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
      top: 15,
      right: 15,
      bottom: 15,
      left: 15,
    },
  };

  console.log(`        [layoutCallout] COMPLETED`);
  return { root };
}
