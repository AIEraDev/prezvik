/**
 * Two Column Layout Strategy (with adaptive logic)
 *
 * Split content layout with flexible blocks
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";
import { getFontSize } from "../primitives/typography.js";

export interface ContentBlock {
  type: "text" | "image" | "list";
  text?: string;
  src?: string;
  alt?: string;
  items?: string[];
}

export interface TwoColumnContent {
  title?: string;
  left: ContentBlock[];
  right: ContentBlock[];
}

export function layoutTwoColumn(content: TwoColumnContent): LayoutTree {
  console.log(`        [layoutTwoColumn] Building two-column layout - title: "${content.title?.substring(0, 30) || "none"}...", left blocks: ${content.left?.length || 0}, right blocks: ${content.right?.length || 0}`);

  const children: (TextNode | ContainerNode)[] = [];

  // Title (optional)
  if (content.title) {
    children.push({
      id: "title",
      type: "text",
      content: content.title,
      text: {
        fontSize: getFontSize("title"),
        fontWeight: "bold",
        align: "left",
      },
    });
  }

  // Left column
  const leftColumn: ContainerNode = {
    id: "left-column",
    type: "container",
    children: content.left.map((block, i) => layoutBlock(block, `left-${i}`)),
    layout: {
      type: "flow",
      direction: "vertical",
      gap: 2,
    },
  };

  // Right column
  const rightColumn: ContainerNode = {
    id: "right-column",
    type: "container",
    children: content.right.map((block, i) => layoutBlock(block, `right-${i}`)),
    layout: {
      type: "flow",
      direction: "vertical",
      gap: 2,
    },
  };

  // Columns container
  children.push({
    id: "columns",
    type: "container",
    children: [leftColumn, rightColumn],
    layout: {
      type: "grid",
      columns: 2,
      columnGap: 4,
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
    },
    padding: {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5,
    },
  };

  return { root };
}

/**
 * Layout a content block
 */
function layoutBlock(block: ContentBlock, id: string): TextNode {
  if (block.type === "text" && block.text) {
    return {
      id,
      type: "text",
      content: block.text,
      text: {
        fontSize: getFontSize("body"),
        align: "left",
      },
    };
  }

  // TODO: Handle image and list types
  return {
    id,
    type: "text",
    content: "",
    text: {
      fontSize: getFontSize("body"),
      align: "left",
    },
  };
}
