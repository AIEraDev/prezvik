/**
 * Positioning Engine Tests
 *
 * Tests for coordinate positioning logic
 */

import { describe, it, expect } from "vitest";
import { PositioningEngine } from "./positioning-engine.js";
import type { LayoutTree, ContainerNode, Spacing } from "../types.js";

describe("PositioningEngine", () => {
  describe("Flow Layout - Vertical", () => {
    it("should position children vertically with gap spacing", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 10,
          },
          children: [
            {
              id: "child1",
              type: "text",
              content: "First",
              text: { fontSize: 16 },
            },
            {
              id: "child2",
              type: "text",
              content: "Second",
              text: { fontSize: 16 },
            },
            {
              id: "child3",
              type: "text",
              content: "Third",
              text: { fontSize: 16 },
            },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;

      // Root should have full bounds
      expect(container._rect).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });

      // Children should be stacked vertically
      const child1 = container.children[0];
      const child2 = container.children[1];
      const child3 = container.children[2];

      expect(child1._rect?.x).toBe(0);
      expect(child1._rect?.y).toBe(0);
      expect(child1._rect?.width).toBe(100);

      // Child2 should start after child1 + gap
      expect(child2._rect?.x).toBe(0);
      expect(child2._rect?.y).toBeGreaterThan(child1._rect!.y);
      expect(child2._rect?.width).toBe(100);

      // Child3 should start after child2 + gap
      expect(child3._rect?.x).toBe(0);
      expect(child3._rect?.y).toBeGreaterThan(child2._rect!.y);
      expect(child3._rect?.width).toBe(100);
    });

    it("should handle empty containers", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 10,
          },
          children: [],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;

      expect(container._rect).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      expect(container.children).toHaveLength(0);
    });

    it("should handle single child", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 10,
          },
          children: [
            {
              id: "child1",
              type: "text",
              content: "Only child",
              text: { fontSize: 16 },
            },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;
      const child = container.children[0];

      expect(child._rect?.x).toBe(0);
      expect(child._rect?.y).toBe(0);
      expect(child._rect?.width).toBe(100);
    });
  });

  describe("Flow Layout - Horizontal", () => {
    it("should position children horizontally", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "flow",
            direction: "horizontal",
            gap: 5,
          },
          children: [
            {
              id: "child1",
              type: "text",
              content: "First",
              text: { fontSize: 16 },
            },
            {
              id: "child2",
              type: "text",
              content: "Second",
              text: { fontSize: 16 },
            },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;

      const child1 = container.children[0];
      const child2 = container.children[1];

      // Children should be side by side
      expect(child1._rect?.x).toBe(0);
      expect(child1._rect?.y).toBe(0);
      expect(child1._rect?.height).toBe(100);

      expect(child2._rect?.x).toBeGreaterThan(child1._rect!.x);
      expect(child2._rect?.y).toBe(0);
      expect(child2._rect?.height).toBe(100);
    });
  });

  describe("Grid Layout", () => {
    it("should position children in 2-column grid", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "grid",
            columns: 2,
            columnGap: 10,
            rowGap: 10,
          },
          children: [
            {
              id: "child1",
              type: "text",
              content: "1",
              text: { fontSize: 16 },
            },
            {
              id: "child2",
              type: "text",
              content: "2",
              text: { fontSize: 16 },
            },
            {
              id: "child3",
              type: "text",
              content: "3",
              text: { fontSize: 16 },
            },
            {
              id: "child4",
              type: "text",
              content: "4",
              text: { fontSize: 16 },
            },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;

      const [child1, child2, child3, child4] = container.children;

      // First row
      expect(child1._rect?.x).toBe(0);
      expect(child1._rect?.y).toBe(0);

      expect(child2._rect?.x).toBeGreaterThan(child1._rect!.x);
      expect(child2._rect?.y).toBe(0);

      // Second row
      expect(child3._rect?.x).toBe(0);
      expect(child3._rect?.y).toBeGreaterThan(child1._rect!.y);

      expect(child4._rect?.x).toBeGreaterThan(child3._rect!.x);
      expect(child4._rect?.y).toBe(child3._rect?.y);
    });

    it("should position children in 3-column grid", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "grid",
            columns: 3,
            columnGap: 5,
            rowGap: 5,
          },
          children: [
            { id: "1", type: "text", content: "1", text: { fontSize: 16 } },
            { id: "2", type: "text", content: "2", text: { fontSize: 16 } },
            { id: "3", type: "text", content: "3", text: { fontSize: 16 } },
            { id: "4", type: "text", content: "4", text: { fontSize: 16 } },
            { id: "5", type: "text", content: "5", text: { fontSize: 16 } },
            { id: "6", type: "text", content: "6", text: { fontSize: 16 } },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;

      // First row (0, 1, 2)
      expect(container.children[0]._rect?.y).toBe(0);
      expect(container.children[1]._rect?.y).toBe(0);
      expect(container.children[2]._rect?.y).toBe(0);

      // Second row (3, 4, 5)
      const secondRowY = container.children[3]._rect?.y;
      expect(secondRowY).toBeGreaterThan(0);
      expect(container.children[4]._rect?.y).toBe(secondRowY);
      expect(container.children[5]._rect?.y).toBe(secondRowY);
    });

    it("should position children in 4-column grid", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "grid",
            columns: 4,
            columnGap: 5,
            rowGap: 5,
          },
          children: Array.from({ length: 8 }, (_, i) => ({
            id: `child${i}`,
            type: "text" as const,
            content: `${i}`,
            text: { fontSize: 16 },
          })),
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;

      // First row (0-3)
      for (let i = 0; i < 4; i++) {
        expect(container.children[i]._rect?.y).toBe(0);
      }

      // Second row (4-7)
      const secondRowY = container.children[4]._rect?.y;
      for (let i = 4; i < 8; i++) {
        expect(container.children[i]._rect?.y).toBe(secondRowY);
      }
    });
  });

  describe("Absolute Layout", () => {
    it("should use explicit coordinates when provided", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "absolute",
          },
          children: [
            {
              id: "child1",
              type: "text",
              content: "Positioned",
              text: { fontSize: 16 },
              _rect: { x: 10, y: 20, width: 30, height: 40 },
            },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;
      const child = container.children[0];

      expect(child._rect).toEqual({
        x: 10,
        y: 20,
        width: 30,
        height: 40,
      });
    });

    it("should fall back to parent bounds if coordinates missing", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "absolute",
          },
          children: [
            {
              id: "child1",
              type: "text",
              content: "No coords",
              text: { fontSize: 16 },
            },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;
      const child = container.children[0];

      // Should use parent bounds
      expect(child._rect).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    });
  });

  describe("Padding Support", () => {
    it("should apply padding to container bounds", () => {
      const engine = new PositioningEngine();

      const padding: Spacing = {
        top: 10,
        right: 15,
        bottom: 10,
        left: 15,
      };

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          padding,
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 0,
          },
          children: [
            {
              id: "child1",
              type: "text",
              content: "Padded",
              text: { fontSize: 16 },
            },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;
      const child = container.children[0];

      // Child should be positioned within padded bounds
      expect(child._rect?.x).toBe(padding.left);
      expect(child._rect?.y).toBe(padding.top);
      expect(child._rect?.width).toBe(100 - padding.left - padding.right);
    });
  });

  describe("Margin Support", () => {
    it("should respect margin values in node boundaries", () => {
      const engine = new PositioningEngine();

      const margin: Spacing = {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      };

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          margin,
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 0,
          },
          children: [
            {
              id: "child1",
              type: "text",
              content: "With margin",
              text: { fontSize: 16 },
            },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;

      // Root should still have full bounds (margin is external)
      expect(container._rect).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    });
  });

  describe("Height Estimation", () => {
    it("should estimate height for text nodes based on content length", () => {
      const engine = new PositioningEngine();

      const shortText = "Short";
      const longText = "This is a much longer text that should result in a taller estimated height because it will wrap to multiple lines";

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 10,
          },
          children: [
            {
              id: "short",
              type: "text",
              content: shortText,
              text: { fontSize: 16 },
            },
            {
              id: "long",
              type: "text",
              content: longText,
              text: { fontSize: 16 },
            },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;

      const shortNode = container.children[0];
      const longNode = container.children[1];

      // Long text should have greater height
      expect(longNode._rect!.height).toBeGreaterThan(shortNode._rect!.height);
    });

    it("should estimate height for different font sizes", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 10,
          },
          children: [
            {
              id: "small",
              type: "text",
              content: "Small text",
              text: { fontSize: 12 },
            },
            {
              id: "large",
              type: "text",
              content: "Large text",
              text: { fontSize: 48 },
            },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;

      const smallNode = container.children[0];
      const largeNode = container.children[1];

      // Larger font should have greater height
      expect(largeNode._rect!.height).toBeGreaterThan(smallNode._rect!.height);
    });

    it("should handle container height as sum of children", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 10,
          },
          children: [
            {
              id: "nested",
              type: "container",
              layout: {
                type: "flow",
                direction: "vertical",
                gap: 5,
              },
              children: [
                {
                  id: "nested-child1",
                  type: "text",
                  content: "Nested 1",
                  text: { fontSize: 16 },
                },
                {
                  id: "nested-child2",
                  type: "text",
                  content: "Nested 2",
                  text: { fontSize: 16 },
                },
              ],
            } as ContainerNode,
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;
      const nestedContainer = container.children[0] as ContainerNode;

      // Nested container should have height
      expect(nestedContainer._rect!.height).toBeGreaterThan(0);
    });
  });

  describe("Percentage Coordinate Calculations", () => {
    it("should use 0-100 range for coordinates", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 0,
          },
          children: [
            {
              id: "child1",
              type: "text",
              content: "Test",
              text: { fontSize: 16 },
            },
          ],
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;

      // Root should be 0-100
      expect(container._rect?.x).toBe(0);
      expect(container._rect?.y).toBe(0);
      expect(container._rect?.width).toBe(100);
      expect(container._rect?.height).toBe(100);

      // Child coordinates should be within 0-100
      const child = container.children[0];
      expect(child._rect?.x).toBeGreaterThanOrEqual(0);
      expect(child._rect?.x).toBeLessThanOrEqual(100);
      expect(child._rect?.y).toBeGreaterThanOrEqual(0);
      expect(child._rect?.y).toBeLessThanOrEqual(100);
    });
  });

  describe("Edge Cases", () => {
    it("should handle many children", () => {
      const engine = new PositioningEngine();

      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          layout: {
            type: "flow",
            direction: "vertical",
            gap: 2,
          },
          children: Array.from({ length: 20 }, (_, i) => ({
            id: `child${i}`,
            type: "text" as const,
            content: `Child ${i}`,
            text: { fontSize: 16 },
          })),
        } as ContainerNode,
      };

      const positioned = engine.position([tree])[0];
      const container = positioned.root as ContainerNode;

      // All children should have _rect
      container.children.forEach((child) => {
        expect(child._rect).toBeDefined();
        expect(child._rect?.x).toBeGreaterThanOrEqual(0);
        expect(child._rect?.y).toBeGreaterThanOrEqual(0);
      });

      // Children should be in order
      for (let i = 1; i < container.children.length; i++) {
        const prev = container.children[i - 1];
        const curr = container.children[i];
        expect(curr._rect!.y).toBeGreaterThanOrEqual(prev._rect!.y);
      }
    });

    it("should handle multiple trees", () => {
      const engine = new PositioningEngine();

      const trees: LayoutTree[] = [
        {
          root: {
            id: "tree1",
            type: "container",
            layout: { type: "flow", direction: "vertical", gap: 0 },
            children: [],
          } as ContainerNode,
        },
        {
          root: {
            id: "tree2",
            type: "container",
            layout: { type: "flow", direction: "vertical", gap: 0 },
            children: [],
          } as ContainerNode,
        },
      ];

      const positioned = engine.position(trees);

      expect(positioned).toHaveLength(2);
      positioned.forEach((tree) => {
        expect(tree.root._rect).toBeDefined();
      });
    });
  });
});
