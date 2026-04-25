/**
 * Grid Layout Strategy
 *
 * 2x2 or 3x3 grid layout for multiple items
 * Ideal for feature grids, team members, or product showcases
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";

export function layoutGrid(content: any[]): LayoutTree {
  console.log(`        [layoutGrid] Building grid layout - items: ${content.length}`);

  // Split content into grid cells
  const cells: ContainerNode[] = [];

  for (let i = 0; i < content.length; i++) {
    const block = content[i];
    const cellChildren: TextNode[] = [];

    if (block.type === "heading") {
      cellChildren.push({
        id: `cell-${i}-title`,
        type: "text",
        content: block.value,
        text: {
          fontSize: 18,
          fontWeight: "bold",
          align: "center",
        },
      });
    } else if (block.type === "text") {
      cellChildren.push({
        id: `cell-${i}-text`,
        type: "text",
        content: block.value,
        text: {
          fontSize: 14,
          align: "center",
        },
      });
    } else if (block.type === "stat") {
      cellChildren.push({
        id: `cell-${i}-value`,
        type: "text",
        content: `${block.prefix || ""}${block.value}${block.suffix || ""}`,
        text: {
          fontSize: 32,
          fontWeight: "bold",
          align: "center",
        },
      });
      if (block.label) {
        cellChildren.push({
          id: `cell-${i}-label`,
          type: "text",
          content: block.label,
          text: {
            fontSize: 12,
            align: "center",
            colorRole: "textMuted" as any,
          },
        });
      }
    } else if (block.type === "bullets" && block.items) {
      for (let j = 0; j < Math.min(block.items.length, 2); j++) {
        const item = block.items[j];
        cellChildren.push({
          id: `cell-${i}-bullet-${j}`,
          type: "text",
          content: item.icon ? `${item.icon} ${item.text}` : `• ${item.text}`,
          text: {
            fontSize: 12,
            align: "center",
          },
        });
      }
    }

    cells.push({
      id: `cell-${i}`,
      type: "container",
      children: cellChildren,
      layout: {
        type: "flow",
        direction: "vertical",
        gap: 1,
        align: "center",
      },
      padding: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
    });
  }

  // Arrange in grid rows
  const rows: ContainerNode[] = [];
  const cols = content.length <= 4 ? 2 : 3;

  for (let i = 0; i < cells.length; i += cols) {
    const rowCells = cells.slice(i, i + cols);
    rows.push({
      id: `row-${i / cols}`,
      type: "container",
      children: rowCells,
      layout: {
        type: "flow",
        direction: "horizontal",
        gap: 3,
        align: "center",
      },
    });
  }

  const root: ContainerNode = {
    id: "root",
    type: "container",
    children: rows,
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

  console.log(`        [layoutGrid] COMPLETED - ${cells.length} cells in ${rows.length} rows`);
  return { root };
}
