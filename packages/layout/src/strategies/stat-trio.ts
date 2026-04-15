/**
 * Stat Trio Layout Strategy
 *
 * Three stats side-by-side with labels, values, and optional deltas
 * Now with semantic roles
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";

export interface Stat {
  label: string;
  value: string;
  delta?: string;
}

export interface StatTrioContent {
  title?: string;
  stats: [Stat, Stat, Stat];
}

export function layoutStatTrio(content: StatTrioContent): LayoutTree {
  const children: (TextNode | ContainerNode)[] = [];

  // Title (optional)
  if (content.title) {
    children.push({
      id: "title",
      type: "text",
      content: content.title,
      text: {
        fontSize: 36,
        fontWeight: "bold",
        align: "center",
        fontRole: "h1" as any,
        colorRole: "text" as any,
        weightRole: "bold" as any,
      },
    });
  }

  // Stats grid
  const statNodes: ContainerNode[] = content.stats.map((stat, i): ContainerNode => {
    const statChildren: TextNode[] = [
      {
        id: `stat-${i}-value`,
        type: "text",
        content: stat.value,
        text: {
          fontSize: 72,
          fontWeight: "bold",
          align: "center",
          fontRole: "hero" as any,
          colorRole: "primary" as any,
          weightRole: "bold" as any,
        },
      },
      {
        id: `stat-${i}-label`,
        type: "text",
        content: stat.label,
        text: {
          fontSize: 18,
          align: "center",
          fontRole: "body" as any,
          colorRole: "textMuted" as any,
          weightRole: "regular" as any,
        },
      },
    ];

    if (stat.delta) {
      statChildren.push({
        id: `stat-${i}-delta`,
        type: "text",
        content: stat.delta,
        text: {
          fontSize: 14,
          align: "center",
          fontRole: "small" as any,
          colorRole: "success" as any,
          weightRole: "medium" as any,
        },
      });
    }

    return {
      id: `stat-${i}`,
      type: "container",
      children: statChildren,
      layout: {
        type: "flow",
        direction: "vertical",
        gap: 1,
      },
    };
  });

  children.push({
    id: "stats-grid",
    type: "container",
    children: statNodes,
    layout: {
      type: "grid",
      columns: 3,
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
      gap: 4,
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
