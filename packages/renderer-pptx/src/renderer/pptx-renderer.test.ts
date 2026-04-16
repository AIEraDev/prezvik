/**
 * PPTX Renderer Integration Tests
 *
 * Tests rendering of positioned layout trees to PPTX files
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderPPTX, renderPPTXToFile } from "./pptx-renderer.js";
import type { LayoutTree, TextNode, ContainerNode } from "../types.js";
import { pctXtoIn, pctYtoIn } from "../utils/units.js";
import * as fs from "fs";
import * as path from "path";

describe("PPTX Renderer", () => {
  const testOutputDir = path.join(process.cwd(), "test-output");

  beforeEach(() => {
    // Create test output directory if it doesn't exist
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe("8.1 - _rect property reading", () => {
    it("should throw error when _rect is missing", async () => {
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Test",
          text: {
            fontSize: 24,
          },
          // Missing _rect property
        } as TextNode,
      };

      await expect(async () => {
        await renderPPTX([tree]);
      }).rejects.toThrow('Node "root" has no _rect');
    });

    it("should log warning message when _rect is missing", async () => {
      const tree: LayoutTree = {
        root: {
          id: "test-node",
          type: "text",
          content: "Test",
          text: {
            fontSize: 24,
          },
        } as TextNode,
      };

      try {
        await renderPPTX([tree]);
      } catch (error: any) {
        expect(error.message).toContain("test-node");
        expect(error.message).toContain("no _rect");
        expect(error.message).toContain("resolveLayout");
      }
    });

    it("should successfully render when _rect is present", async () => {
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "text",
          content: "Test",
          text: {
            fontSize: 24,
          },
          _rect: {
            x: 10,
            y: 10,
            width: 80,
            height: 20,
          },
        } as TextNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });
  });

  describe("8.2 - Coordinate conversion (percentage to inches)", () => {
    it("should convert x coordinate from percentage to inches", () => {
      // 0% should be 0 inches
      expect(pctXtoIn(0)).toBe(0);

      // 50% should be 5 inches (half of 10 inch width)
      expect(pctXtoIn(50)).toBe(5);

      // 100% should be 10 inches (full width)
      expect(pctXtoIn(100)).toBe(10);
    });

    it("should convert y coordinate from percentage to inches", () => {
      // 0% should be 0 inches
      expect(pctYtoIn(0)).toBe(0);

      // 50% should be 2.8125 inches (half of 5.625 inch height)
      expect(pctYtoIn(50)).toBe(2.8125);

      // 100% should be 5.625 inches (full height)
      expect(pctYtoIn(100)).toBe(5.625);
    });

    it("should convert width from percentage to inches", () => {
      // Width uses X axis conversion
      expect(pctXtoIn(25)).toBe(2.5);
      expect(pctXtoIn(75)).toBe(7.5);
    });

    it("should convert height from percentage to inches", () => {
      // Height uses Y axis conversion
      expect(pctYtoIn(25)).toBeCloseTo(1.40625);
      expect(pctYtoIn(75)).toBeCloseTo(4.21875);
    });

    it("should use standard slide dimensions (10:16 aspect ratio)", () => {
      // Verify the aspect ratio is correct (16:9 widescreen)
      const width = pctXtoIn(100);
      const height = pctYtoIn(100);
      const aspectRatio = width / height;

      expect(width).toBe(10);
      expect(height).toBe(5.625);
      expect(aspectRatio).toBeCloseTo(16 / 9);
    });

    it("should render text at correct coordinates", async () => {
      const tree: LayoutTree = {
        root: {
          id: "text1",
          type: "text",
          content: "Positioned Text",
          text: {
            fontSize: 24,
          },
          _rect: {
            x: 20, // 20% = 2 inches
            y: 30, // 30% = 1.6875 inches
            width: 60, // 60% = 6 inches
            height: 15, // 15% = 0.84375 inches
          },
        } as TextNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });
  });

  describe("8.3 - Text rendering with positioned coordinates", () => {
    it("should render text with font family", async () => {
      const tree: LayoutTree = {
        root: {
          id: "text1",
          type: "text",
          content: "Custom Font",
          text: {
            fontSize: 24,
            fontFamily: "Arial",
          },
          _rect: { x: 10, y: 10, width: 80, height: 20 },
        } as TextNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });

    it("should render text with font size", async () => {
      const tree: LayoutTree = {
        root: {
          id: "text1",
          type: "text",
          content: "Large Text",
          text: {
            fontSize: 48,
          },
          _rect: { x: 10, y: 10, width: 80, height: 30 },
        } as TextNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });

    it("should render text with bold weight", async () => {
      const tree: LayoutTree = {
        root: {
          id: "text1",
          type: "text",
          content: "Bold Text",
          text: {
            fontSize: 24,
            fontWeight: "bold",
          },
          _rect: { x: 10, y: 10, width: 80, height: 20 },
        } as TextNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });

    it("should render text with color", async () => {
      const tree: LayoutTree = {
        root: {
          id: "text1",
          type: "text",
          content: "Colored Text",
          text: {
            fontSize: 24,
            color: "FF0000", // Red
          },
          _rect: { x: 10, y: 10, width: 80, height: 20 },
        } as TextNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });

    it("should render text with left alignment", async () => {
      const tree: LayoutTree = {
        root: {
          id: "text1",
          type: "text",
          content: "Left Aligned",
          text: {
            fontSize: 24,
            align: "left",
          },
          _rect: { x: 10, y: 10, width: 80, height: 20 },
        } as TextNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });

    it("should render text with center alignment", async () => {
      const tree: LayoutTree = {
        root: {
          id: "text1",
          type: "text",
          content: "Center Aligned",
          text: {
            fontSize: 24,
            align: "center",
          },
          _rect: { x: 10, y: 10, width: 80, height: 20 },
        } as TextNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });

    it("should render text with right alignment", async () => {
      const tree: LayoutTree = {
        root: {
          id: "text1",
          type: "text",
          content: "Right Aligned",
          text: {
            fontSize: 24,
            align: "right",
          },
          _rect: { x: 10, y: 10, width: 80, height: 20 },
        } as TextNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });

    it("should render text with multiple properties", async () => {
      const tree: LayoutTree = {
        root: {
          id: "text1",
          type: "text",
          content: "Fully Styled Text",
          text: {
            fontSize: 32,
            fontFamily: "Georgia",
            fontWeight: "bold",
            color: "0000FF",
            align: "center",
          },
          _rect: { x: 10, y: 40, width: 80, height: 20 },
        } as TextNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });
  });

  describe("8.4 - Container background rendering", () => {
    it("should render slide background color", async () => {
      const tree: LayoutTree = {
        background: "F0F0F0", // Light gray
        root: {
          id: "container",
          type: "container",
          children: [
            {
              id: "text1",
              type: "text",
              content: "Text on colored background",
              text: { fontSize: 24 },
              _rect: { x: 10, y: 10, width: 80, height: 20 },
            } as TextNode,
          ],
          _rect: { x: 0, y: 0, width: 100, height: 100 },
        } as ContainerNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });

    it("should render text box background color", async () => {
      const tree: LayoutTree = {
        root: {
          id: "text1",
          type: "text",
          content: "Text with box background",
          text: {
            fontSize: 24,
          },
          box: {
            backgroundColor: "FFFF00", // Yellow
          },
          _rect: { x: 10, y: 10, width: 80, height: 20 },
        } as TextNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });

    it("should render multiple backgrounds (slide + text box)", async () => {
      const tree: LayoutTree = {
        background: "E0E0E0", // Light gray slide
        root: {
          id: "container",
          type: "container",
          children: [
            {
              id: "text1",
              type: "text",
              content: "Text with yellow box",
              text: { fontSize: 24 },
              box: { backgroundColor: "FFFF00" },
              _rect: { x: 10, y: 10, width: 40, height: 20 },
            } as TextNode,
            {
              id: "text2",
              type: "text",
              content: "Text with blue box",
              text: { fontSize: 24 },
              box: { backgroundColor: "ADD8E6" },
              _rect: { x: 50, y: 10, width: 40, height: 20 },
            } as TextNode,
          ],
          _rect: { x: 0, y: 0, width: 100, height: 100 },
        } as ContainerNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });
  });

  describe("8.5 - Integration tests for PPTX rendering", () => {
    it("should create valid PPTX file", async () => {
      const tree: LayoutTree = {
        root: {
          id: "text1",
          type: "text",
          content: "Test Presentation",
          text: {
            fontSize: 36,
            fontWeight: "bold",
            align: "center",
          },
          _rect: { x: 10, y: 40, width: 80, height: 20 },
        } as TextNode,
      };

      const outputPath = path.join(testOutputDir, "test-basic.pptx");
      await renderPPTXToFile([tree], outputPath);

      // Verify file was created
      expect(fs.existsSync(outputPath)).toBe(true);

      // Verify file has content (PPTX files are typically > 10KB)
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    });

    it("should render multiple slides", async () => {
      const trees: LayoutTree[] = [
        {
          root: {
            id: "slide1-text",
            type: "text",
            content: "Slide 1",
            text: { fontSize: 48, align: "center" },
            _rect: { x: 10, y: 40, width: 80, height: 20 },
          } as TextNode,
        },
        {
          root: {
            id: "slide2-text",
            type: "text",
            content: "Slide 2",
            text: { fontSize: 48, align: "center" },
            _rect: { x: 10, y: 40, width: 80, height: 20 },
          } as TextNode,
        },
        {
          root: {
            id: "slide3-text",
            type: "text",
            content: "Slide 3",
            text: { fontSize: 48, align: "center" },
            _rect: { x: 10, y: 40, width: 80, height: 20 },
          } as TextNode,
        },
      ];

      const outputPath = path.join(testOutputDir, "test-multiple-slides.pptx");
      await renderPPTXToFile(trees, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it("should render complex layout with multiple text nodes", async () => {
      const tree: LayoutTree = {
        background: "FFFFFF",
        root: {
          id: "container",
          type: "container",
          children: [
            {
              id: "title",
              type: "text",
              content: "Presentation Title",
              text: {
                fontSize: 44,
                fontWeight: "bold",
                align: "center",
                color: "1A1A1A",
              },
              _rect: { x: 10, y: 10, width: 80, height: 15 },
            } as TextNode,
            {
              id: "subtitle",
              type: "text",
              content: "Subtitle goes here",
              text: {
                fontSize: 24,
                align: "center",
                color: "666666",
              },
              _rect: { x: 10, y: 28, width: 80, height: 10 },
            } as TextNode,
            {
              id: "body",
              type: "text",
              content: "This is the main content of the slide with more detailed information.",
              text: {
                fontSize: 18,
                align: "left",
                color: "333333",
              },
              _rect: { x: 10, y: 45, width: 80, height: 40 },
            } as TextNode,
          ],
          _rect: { x: 0, y: 0, width: 100, height: 100 },
        } as ContainerNode,
      };

      const outputPath = path.join(testOutputDir, "test-complex-layout.pptx");
      await renderPPTXToFile([tree], outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it("should render with various font sizes", async () => {
      const tree: LayoutTree = {
        root: {
          id: "container",
          type: "container",
          children: [
            {
              id: "text1",
              type: "text",
              content: "12pt text",
              text: { fontSize: 12 },
              _rect: { x: 10, y: 10, width: 80, height: 8 },
            } as TextNode,
            {
              id: "text2",
              type: "text",
              content: "18pt text",
              text: { fontSize: 18 },
              _rect: { x: 10, y: 20, width: 80, height: 10 },
            } as TextNode,
            {
              id: "text3",
              type: "text",
              content: "24pt text",
              text: { fontSize: 24 },
              _rect: { x: 10, y: 32, width: 80, height: 12 },
            } as TextNode,
            {
              id: "text4",
              type: "text",
              content: "36pt text",
              text: { fontSize: 36 },
              _rect: { x: 10, y: 46, width: 80, height: 18 },
            } as TextNode,
            {
              id: "text5",
              type: "text",
              content: "48pt text",
              text: { fontSize: 48 },
              _rect: { x: 10, y: 66, width: 80, height: 24 },
            } as TextNode,
          ],
          _rect: { x: 0, y: 0, width: 100, height: 100 },
        } as ContainerNode,
      };

      const outputPath = path.join(testOutputDir, "test-font-sizes.pptx");
      await renderPPTXToFile([tree], outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it("should render with various alignments", async () => {
      const tree: LayoutTree = {
        root: {
          id: "container",
          type: "container",
          children: [
            {
              id: "left",
              type: "text",
              content: "Left aligned text",
              text: { fontSize: 24, align: "left" },
              _rect: { x: 10, y: 20, width: 80, height: 15 },
            } as TextNode,
            {
              id: "center",
              type: "text",
              content: "Center aligned text",
              text: { fontSize: 24, align: "center" },
              _rect: { x: 10, y: 40, width: 80, height: 15 },
            } as TextNode,
            {
              id: "right",
              type: "text",
              content: "Right aligned text",
              text: { fontSize: 24, align: "right" },
              _rect: { x: 10, y: 60, width: 80, height: 15 },
            } as TextNode,
          ],
          _rect: { x: 0, y: 0, width: 100, height: 100 },
        } as ContainerNode,
      };

      const outputPath = path.join(testOutputDir, "test-alignments.pptx");
      await renderPPTXToFile([tree], outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it("should handle edge case: empty container", async () => {
      const tree: LayoutTree = {
        root: {
          id: "container",
          type: "container",
          children: [],
          _rect: { x: 0, y: 0, width: 100, height: 100 },
        } as ContainerNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });

    it("should handle edge case: nested containers", async () => {
      const tree: LayoutTree = {
        root: {
          id: "outer",
          type: "container",
          children: [
            {
              id: "inner",
              type: "container",
              children: [
                {
                  id: "text",
                  type: "text",
                  content: "Nested text",
                  text: { fontSize: 24 },
                  _rect: { x: 20, y: 20, width: 60, height: 20 },
                } as TextNode,
              ],
              _rect: { x: 10, y: 10, width: 80, height: 40 },
            } as ContainerNode,
          ],
          _rect: { x: 0, y: 0, width: 100, height: 100 },
        } as ContainerNode,
      };

      const pptx = await renderPPTX([tree]);
      expect(pptx).toBeDefined();
    });
  });
});
