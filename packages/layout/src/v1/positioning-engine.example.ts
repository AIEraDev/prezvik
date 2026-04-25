/**
 * Positioning Engine Example
 *
 * Demonstrates how to use the positioning engine
 */

import { PositioningEngine } from "./positioning-engine.js";
import type { LayoutTree, ContainerNode } from "../types.js";

// Example 1: Simple vertical flow layout
const simpleTree: LayoutTree = {
  root: {
    id: "slide-1",
    type: "container",
    layout: {
      type: "flow",
      direction: "vertical",
      gap: 10,
    },
    padding: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
    children: [
      {
        id: "title",
        type: "text",
        content: "Welcome to Kyro",
        text: {
          fontSize: 48,
          fontWeight: "bold",
          align: "center",
        },
      },
      {
        id: "subtitle",
        type: "text",
        content: "Beautiful presentations, automatically positioned",
        text: {
          fontSize: 24,
          align: "center",
        },
      },
    ],
  } as ContainerNode,
};

// Example 2: Grid layout
const gridTree: LayoutTree = {
  root: {
    id: "slide-2",
    type: "container",
    layout: {
      type: "grid",
      columns: 2,
      columnGap: 15,
      rowGap: 15,
    },
    padding: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    },
    children: [
      {
        id: "stat-1",
        type: "text",
        content: "85%",
        text: { fontSize: 64, fontWeight: "bold", align: "center" },
      },
      {
        id: "stat-2",
        type: "text",
        content: "2.5x",
        text: { fontSize: 64, fontWeight: "bold", align: "center" },
      },
      {
        id: "stat-3",
        type: "text",
        content: "10k+",
        text: { fontSize: 64, fontWeight: "bold", align: "center" },
      },
      {
        id: "stat-4",
        type: "text",
        content: "99.9%",
        text: { fontSize: 64, fontWeight: "bold", align: "center" },
      },
    ],
  } as ContainerNode,
};

// Position the trees
const engine = new PositioningEngine();
const positioned = engine.position([simpleTree, gridTree]);

// Inspect results
console.log("Simple Tree Root:", positioned[0].root._rect);
console.log(
  "Simple Tree Children:",
  (positioned[0].root as ContainerNode).children.map((c) => ({
    id: c.id,
    rect: c._rect,
  })),
);

console.log("\nGrid Tree Root:", positioned[1].root._rect);
console.log(
  "Grid Tree Children:",
  (positioned[1].root as ContainerNode).children.map((c) => ({
    id: c.id,
    rect: c._rect,
  })),
);
