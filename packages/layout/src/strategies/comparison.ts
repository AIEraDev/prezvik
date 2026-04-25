/**
 * Comparison Layout Strategy
 *
 * Side-by-side comparison of two items
 * Ideal for comparing features, options, or pros/cons
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";

export function layoutComparison(content: any[]): LayoutTree {
  // Extract title and split content into left/right
  let title = "";
  const leftItems: any[] = [];
  const rightItems: any[] = [];

  for (let i = 0; i < content.length; i++) {
    const block = content[i];
    if (block.type === "heading" && !title) {
      title = block.value;
    } else if (i < content.length / 2) {
      leftItems.push(block);
    } else {
      rightItems.push(block);
    }
  }

  console.log(`        [layoutComparison] Building comparison layout - title: "${title?.substring(0, 30) || "none"}..."`);

  const children: (TextNode | ContainerNode)[] = [];

  // Title (optional)
  if (title) {
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
  }

  // Build left column
  const leftChildren = leftItems.map((block, i) => blockToNode(block, `left-${i}`));
  const leftColumn: ContainerNode = {
    id: "left-column",
    type: "container",
    children: leftChildren,
    layout: {
      type: "flow",
      direction: "vertical",
      gap: 1,
      align: "left",
    },
  };

  // Build right column
  const rightChildren = rightItems.map((block, i) => blockToNode(block, `right-${i}`));
  const rightColumn: ContainerNode = {
    id: "right-column",
    type: "container",
    children: rightChildren,
    layout: {
      type: "flow",
      direction: "vertical",
      gap: 1,
      align: "left",
    },
  };

  // Comparison row
  children.push({
    id: "comparison-row",
    type: "container",
    children: [leftColumn, rightColumn],
    layout: {
      type: "flow",
      direction: "horizontal",
      gap: 4,
      align: "center",
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
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  };

  console.log(`        [layoutComparison] COMPLETED`);
  return { root };
}

function blockToNode(block: any, id: string): TextNode {
  if (block.type === "heading") {
    return {
      id,
      type: "text",
      content: block.value,
      text: {
        fontSize: 20,
        fontWeight: "bold",
        align: "left",
      },
    };
  } else if (block.type === "text") {
    return {
      id,
      type: "text",
      content: block.value,
      text: {
        fontSize: 14,
        align: "left",
      },
    };
  } else if (block.type === "bullets") {
    const bulletText = block.items.map((item: any) => `• ${item.text}`).join("\n");
    return {
      id,
      type: "text",
      content: bulletText,
      text: {
        fontSize: 14,
        align: "left",
      },
    };
  }

  // Default
  return {
    id,
    type: "text",
    content: String(block.value || block.text || ""),
    text: {
      fontSize: 14,
      align: "left",
    },
  };
}
