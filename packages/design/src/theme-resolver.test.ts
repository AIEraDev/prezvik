/**
 * Theme Resolver Tests
 *
 * Tests for theme application logic
 */

import { describe, it, expect } from "vitest";
import { ThemeResolver } from "./theme-resolver.js";
import type { LayoutTree, ContainerNode, TextNode } from "@kyro/layout";

describe("ThemeResolver", () => {
  describe("Theme Loading", () => {
    it("should load executive theme by name", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Test",
          text: { fontSize: 16 },
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      expect(themed).toBeDefined();
      expect(themed.length).toBe(1);
    });

    it("should load minimal theme by name", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Test",
          text: { fontSize: 16 },
        } as TextNode,
      };

      const themed = resolver.apply([tree], "minimal");
      expect(themed).toBeDefined();
      expect(themed.length).toBe(1);
    });

    it("should load modern theme by name", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Test",
          text: { fontSize: 16 },
        } as TextNode,
      };

      const themed = resolver.apply([tree], "modern");
      expect(themed).toBeDefined();
      expect(themed.length).toBe(1);
    });

    it("should apply default theme when no theme specified", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Test",
          text: { fontSize: 16 },
        } as TextNode,
      };

      const themed = resolver.apply([tree]);
      const textNode = themed[0].root as TextNode;

      // Should apply default theme (executive)
      expect(textNode.text.fontFamily).toBe("Calibri");
      expect(textNode.text.color).toBeDefined();
    });

    it("should fallback to default theme for missing theme", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Test",
          text: { fontSize: 16 },
        } as TextNode,
      };

      const themed = resolver.apply([tree], "nonexistent");
      const textNode = themed[0].root as TextNode;

      // Should fallback to executive theme
      expect(textNode.text.fontFamily).toBe("Calibri");
    });
  });

  describe("Font Role Resolution", () => {
    it("should resolve title font role to font family and size", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Title",
          text: {
            fontSize: 0, // Will be overridden by role
            fontRole: "title",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      expect(textNode.text.fontFamily).toBe("Calibri");
      expect(textNode.text.fontSize).toBe(48); // title size from executive theme
    });

    it("should resolve body font role", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Body text",
          text: {
            fontSize: 0,
            fontRole: "body",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      expect(textNode.text.fontSize).toBe(18); // body size
    });

    it("should resolve display font role", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Display",
          text: {
            fontSize: 0,
            fontRole: "hero",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      expect(textNode.text.fontSize).toBe(72); // hero size
    });

    it("should resolve code font role", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "code",
          text: {
            fontSize: 0,
            fontRole: "caption",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      expect(textNode.text.fontSize).toBe(12); // caption size
    });

    it("should preserve explicit font overrides from Blueprint", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Custom",
          text: {
            fontSize: 24, // Explicit override
            fontFamily: "Arial", // Explicit override
            fontRole: "title",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      // Should preserve explicit overrides
      expect(textNode.text.fontSize).toBe(24);
      expect(textNode.text.fontFamily).toBe("Arial");
    });

    it("should apply font weights from theme configuration", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Bold text",
          text: {
            fontSize: 16,
            weightRole: "bold",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      expect(textNode.text.fontWeight).toBe("bold");
    });

    it("should apply normal weight for regular role", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Regular text",
          text: {
            fontSize: 16,
            weightRole: "regular",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      expect(textNode.text.fontWeight).toBe("normal");
    });
  });

  describe("Color Role Resolution", () => {
    it("should resolve primary color role", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Primary",
          text: {
            fontSize: 16,
            colorRole: "primary",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      expect(textNode.text.color).toBe("#1E40AF"); // executive primary
    });

    it("should resolve secondary color role", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Secondary",
          text: {
            fontSize: 16,
            colorRole: "textMuted",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      expect(textNode.text.color).toBeDefined();
    });

    it("should resolve accent color role", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Accent",
          text: {
            fontSize: 16,
            colorRole: "accent",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      expect(textNode.text.color).toBe("#DC2626"); // executive accent
    });

    it("should apply default text color when not specified", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Default",
          text: {
            fontSize: 16,
          },
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      expect(textNode.text.color).toBe("#1F2937"); // executive text color
    });

    it("should preserve explicit color overrides from Blueprint", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Custom",
          text: {
            fontSize: 16,
            color: "#FF0000", // Explicit override
            colorRole: "primary",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      // Should preserve explicit override
      expect(textNode.text.color).toBe("#FF0000");
    });
  });

  describe("Background Color Application", () => {
    it("should apply background colors to slide root containers", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          children: [],
        } as ContainerNode,
      };

      const themed = resolver.apply([tree], "executive");

      expect(themed[0].background).toBe("#FFFFFF"); // executive background
    });

    it("should apply minimal theme background", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          children: [],
        } as ContainerNode,
      };

      const themed = resolver.apply([tree], "minimal");

      expect(themed[0].background).toBe("#FAFAFA"); // minimal background
    });

    it("should apply modern theme background", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          children: [],
        } as ContainerNode,
      };

      const themed = resolver.apply([tree], "modern");

      expect(themed[0].background).toBe("#FFFFFF"); // modern background
    });
  });

  describe("Theme Override Behavior", () => {
    it("should preserve all explicit styles from Blueprint", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Custom",
          text: {
            fontSize: 32,
            fontFamily: "Georgia",
            fontWeight: "bold",
            color: "#123456",
            fontRole: "title",
            colorRole: "primary",
          } as any,
        } as TextNode,
      };

      const themed = resolver.apply([tree], "executive");
      const textNode = themed[0].root as TextNode;

      // All explicit values should be preserved
      expect(textNode.text.fontSize).toBe(32);
      expect(textNode.text.fontFamily).toBe("Georgia");
      expect(textNode.text.fontWeight).toBe("bold");
      expect(textNode.text.color).toBe("#123456");
    });
  });

  describe("Nested Container Theming", () => {
    it("should apply theme recursively to nested containers", () => {
      const resolver = new ThemeResolver();
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          children: [
            {
              id: "child1",
              type: "text",
              content: "Text 1",
              text: { fontSize: 16, colorRole: "primary" } as any,
            } as TextNode,
            {
              id: "child2",
              type: "container",
              children: [
                {
                  id: "nested",
                  type: "text",
                  content: "Nested",
                  text: { fontSize: 14, colorRole: "accent" } as any,
                } as TextNode,
              ],
            } as ContainerNode,
          ],
        } as ContainerNode,
      };

      const themed = resolver.apply([tree], "executive");
      const container = themed[0].root as ContainerNode;
      const child1 = container.children[0] as TextNode;
      const child2 = container.children[1] as ContainerNode;
      const nested = child2.children[0] as TextNode;

      // All text nodes should have colors applied
      expect(child1.text.color).toBe("#1E40AF"); // primary
      expect(nested.text.color).toBe("#DC2626"); // accent
    });
  });

  describe("Multiple Trees", () => {
    it("should apply theme to multiple layout trees", () => {
      const resolver = new ThemeResolver();
      const trees: LayoutTree[] = [
        {
          root: {
            id: "root1",
            type: "text",
            content: "Tree 1",
            text: { fontSize: 16 },
          } as TextNode,
        },
        {
          root: {
            id: "root2",
            type: "text",
            content: "Tree 2",
            text: { fontSize: 16 },
          } as TextNode,
        },
        {
          root: {
            id: "root3",
            type: "text",
            content: "Tree 3",
            text: { fontSize: 16 },
          } as TextNode,
        },
      ];

      const themed = resolver.apply(trees, "executive");

      expect(themed.length).toBe(3);
      themed.forEach((tree) => {
        const textNode = tree.root as TextNode;
        expect(textNode.text.fontFamily).toBe("Calibri");
        expect(textNode.text.color).toBe("#1F2937");
      });
    });
  });

  describe("Custom Default Theme", () => {
    it("should use custom default theme from options", () => {
      const resolver = new ThemeResolver({ defaultTheme: "minimal" });
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Test",
          text: { fontSize: 16 },
        } as TextNode,
      };

      const themed = resolver.apply([tree]);
      const textNode = themed[0].root as TextNode;

      // Should use minimal theme as default
      expect(textNode.text.fontFamily).toBe("Inter");
    });
  });
});
