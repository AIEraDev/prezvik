/**
 * Data Layout Strategy
 *
 * Data visualization slide - handles stat blocks
 * Displays one or more statistics with labels
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";

export function layoutData(content: any[]): LayoutTree {
  console.log(`        [layoutData] Building data layout - items: ${content.length}`);

  const children: (TextNode | ContainerNode)[] = [];

  // Extract title if any
  let title = "";
  const statBlocks: any[] = [];

  for (const block of content) {
    if (block.type === "heading" && !title) {
      title = block.value;
    } else if (block.type === "stat") {
      statBlocks.push(block);
    } else if (block.type === "text" && block.value) {
      statBlocks.push({ value: block.value, label: "" }); // Treat text as stat-like
    }
  }

  // Title (optional)
  if (title) {
    children.push({
      id: "title",
      type: "text",
      content: title,
      text: {
        fontSize: 28,
        fontWeight: "bold",
        align: "center",
      },
    });
  }

  // Stats container
  const statChildren: ContainerNode[] = statBlocks.map((stat, i) => {
    const statNodes: TextNode[] = [];

    // Value
    const valueText = `${stat.prefix || ""}${stat.value}${stat.suffix || ""}`;
    statNodes.push({
      id: `stat-${i}-value`,
      type: "text",
      content: String(valueText),
      text: {
        fontSize: stat.visualWeight === "hero" ? 48 : stat.visualWeight === "emphasis" ? 36 : 28,
        fontWeight: "bold",
        align: "center",
        colorRole: "accent" as any,
      },
    });

    // Label
    if (stat.label) {
      statNodes.push({
        id: `stat-${i}-label`,
        type: "text",
        content: stat.label,
        text: {
          fontSize: 14,
          align: "center",
          colorRole: "textMuted" as any,
        },
      });
    }

    return {
      id: `stat-${i}`,
      type: "container",
      children: statNodes,
      layout: {
        type: "flow",
        direction: "vertical",
        gap: 1,
        align: "center",
      },
    };
  });

  // Arrange stats horizontally or vertically based on count
  if (statChildren.length > 0) {
    children.push({
      id: "stats-container",
      type: "container",
      children: statChildren,
      layout: {
        type: "flow",
        direction: statChildren.length <= 3 ? "horizontal" : "vertical",
        gap: statChildren.length <= 3 ? 6 : 3,
        align: "center",
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
      gap: 4,
      align: "center",
    },
    padding: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  };

  console.log(`        [layoutData] COMPLETED - ${statBlocks.length} stats`);
  return { root };
}
