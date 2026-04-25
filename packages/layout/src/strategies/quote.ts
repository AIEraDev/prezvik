/**
 * Quote Layout Strategy
 *
 * Testimonial or quote slide with attribution
 * Large quote text with optional author and role
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";

export function layoutQuote(content: any[]): LayoutTree {
  // Extract from Blueprint content blocks
  let quoteText = "";
  let author = "";
  let role = "";

  for (const block of content) {
    if (block.type === "quote" && block.text) {
      quoteText = block.text;
      if (block.author) author = block.author;
      if (block.role) role = block.role;
    } else if (block.type === "text" && block.value && !quoteText) {
      quoteText = block.value;
    } else if (block.type === "heading" && block.value && !author) {
      author = block.value;
    }
  }

  // Fallback
  if (!quoteText) quoteText = "Quote text here...";

  console.log(`        [layoutQuote] Building quote layout - author: "${author || "none"}"`);

  const children: TextNode[] = [];

  // Quote marks
  children.push({
    id: "quote-marks",
    type: "text",
    content: '"',
    text: {
      fontSize: 48,
      fontWeight: "bold",
      align: "center",
      colorRole: "accent" as any,
    },
  });

  // Quote text
  children.push({
    id: "quote-text",
    type: "text",
    content: quoteText,
    text: {
      fontSize: 28,
      italic: true,
      align: "center",
    },
  });

  // Attribution
  if (author) {
    children.push({
      id: "author",
      type: "text",
      content: `— ${author}${role ? ", " + role : ""}`,
      text: {
        fontSize: 16,
        fontWeight: "normal",
        align: "center",
        colorRole: "textMuted" as any,
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
      top: 15,
      right: 15,
      bottom: 15,
      left: 15,
    },
  };

  console.log(`        [layoutQuote] COMPLETED`);
  return { root };
}
