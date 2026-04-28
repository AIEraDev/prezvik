import { describe, it, expect } from "vitest";
import { VisualContextBuilder } from "./visual-context-builder.js";
import type { LayoutTree } from "./visual-context-builder.js";
import type { LayoutNode } from "./theme-engine.js";
import type { ColorPalette } from "@prezvik/theme-layer";
import type { VisualElement, BackgroundElement, ShapeElement } from "./models/visual-element.js";
import type { ThemeTone, ThemeTypography } from "./models/visual-context.js";

describe("VisualContextBuilder", () => {
  const builder = new VisualContextBuilder();

  const mockColorPalette: ColorPalette = {
    version: "1.0",
    primary: "#0066cc",
    secondary: "#6c757d",
    accent: "#ff6b6b",
    lightBg: "#ffffff",
    darkBg: "#1a1a1a",
    textOnDark: "#ffffff",
    textOnLight: "#000000",
    mutedOnDark: "#cccccc",
    mutedOnLight: "#666666",
    metadata: {
      colorSpace: "oklch",
      generatedAt: "2024-01-01T00:00:00.000Z",
      themeSpecHash: "abc123",
    },
  };

  const mockTypography: ThemeTypography = {
    displayFont: "Inter",
    bodyFont: "Inter",
  };

  const createMockLayoutNode = (overrides?: Partial<LayoutNode>): LayoutNode => ({
    type: "container",
    _rect: { x: 0, y: 0, width: 960, height: 540 },
    children: [],
    ...overrides,
  });

  const createMockLayoutTree = (slideId: string, slideType: string, root?: LayoutNode): LayoutTree => ({
    root: root || createMockLayoutNode(),
    metadata: {
      slideId,
      slideType,
    },
  });

  const createMockBackground = (): BackgroundElement => ({
    id: "bg-1",
    kind: "background",
    zIndex: 0,
    opacity: 1,
    fill: {
      type: "solid",
      color: "#ffffff",
    },
    dimensions: {
      width: 960,
      height: 540,
    },
  });

  const createMockShape = (): ShapeElement => ({
    id: "shape-1",
    kind: "shape",
    shapeType: "rectangle",
    zIndex: 5,
    opacity: 0.8,
    bounds: { x: 100, y: 100, width: 200, height: 200 },
    fill: {
      type: "solid",
      color: "#0066cc",
    },
  });

  describe("build", () => {
    it("should build valid VisualContext from layout trees and visual elements", () => {
      const layoutTrees = [createMockLayoutTree("slide-1", "hero")];
      const visualElements = [[createMockBackground(), createMockShape()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash-123");

      expect(result.version).toBe("1.0");
      expect(result.slides).toHaveLength(1);
      expect(result.colorPalette).toBe(mockColorPalette);
      expect(result.theme.tone).toBe("modern");
      expect(result.theme.typography).toBe(mockTypography);
      expect(result.metadata.generatedAt).toBeDefined();
      expect(result.metadata.layoutTreeHash).toBeDefined();
      expect(result.metadata.themeSpecHash).toBe("theme-hash-123");
    });

    it("should throw error if layoutTrees and visualElements have different lengths", () => {
      const layoutTrees = [createMockLayoutTree("slide-1", "hero")];
      const visualElements = [[createMockBackground()], [createMockBackground()]]; // Mismatched length

      expect(() => {
        builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");
      }).toThrow("Layout trees count (1) does not match visual elements count (2)");
    });

    it("should throw error if slide is missing background element", () => {
      const layoutTrees = [createMockLayoutTree("slide-1", "hero")];
      const visualElements = [[createMockShape()]]; // No background

      expect(() => {
        builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");
      }).toThrow("Slide slide-1 is missing background element");
    });

    it("should handle multiple slides", () => {
      const layoutTrees = [createMockLayoutTree("slide-1", "hero"), createMockLayoutTree("slide-2", "content")];
      const visualElements = [[createMockBackground(), createMockShape()], [createMockBackground()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "minimal", mockTypography, "theme-hash");

      expect(result.slides).toHaveLength(2);
      expect(result.slides[0].slideId).toBe("slide-1");
      expect(result.slides[1].slideId).toBe("slide-2");
    });
  });

  describe("layoutToContent conversion", () => {
    it("should extract text content from layout nodes", () => {
      const layoutNode = createMockLayoutNode({
        text: "Hello World",
        _rect: { x: 100, y: 100, width: 300, height: 50 },
        style: {
          fontSize: 24,
          fontFamily: "Inter",
          textColor: "#000000",
        },
      });

      const layoutTrees = [createMockLayoutTree("slide-1", "content", layoutNode)];
      const visualElements = [[createMockBackground()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      expect(result.slides[0].content).toHaveLength(1);
      const textElement = result.slides[0].content[0];
      expect(textElement.kind).toBe("text");
      expect(textElement.bounds).toEqual({ x: 100, y: 100, width: 300, height: 50 });
      expect((textElement.content as any).text).toBe("Hello World");
      expect((textElement.content as any).fontSize).toBe(24);
      expect((textElement.content as any).font).toBe("Inter");
      expect((textElement.content as any).color).toBe("#000000");
    });

    it("should extract image content from layout nodes", () => {
      const layoutNode = createMockLayoutNode({
        image: "https://example.com/image.jpg",
        _rect: { x: 200, y: 200, width: 400, height: 300 },
      });

      const layoutTrees = [createMockLayoutTree("slide-1", "content", layoutNode)];
      const visualElements = [[createMockBackground()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      expect(result.slides[0].content).toHaveLength(1);
      const imageElement = result.slides[0].content[0];
      expect(imageElement.kind).toBe("image");
      expect(imageElement.bounds).toEqual({ x: 200, y: 200, width: 400, height: 300 });
      expect((imageElement.content as any).src).toBe("https://example.com/image.jpg");
      expect((imageElement.content as any).fit).toBe("cover");
    });

    it("should recursively process children nodes", () => {
      const layoutNode = createMockLayoutNode({
        children: [
          createMockLayoutNode({
            text: "Title",
            _rect: { x: 50, y: 50, width: 200, height: 40 },
          }),
          createMockLayoutNode({
            text: "Subtitle",
            _rect: { x: 50, y: 100, width: 200, height: 30 },
          }),
          createMockLayoutNode({
            image: "https://example.com/logo.png",
            _rect: { x: 300, y: 50, width: 100, height: 100 },
          }),
        ],
      });

      const layoutTrees = [createMockLayoutTree("slide-1", "content", layoutNode)];
      const visualElements = [[createMockBackground()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      expect(result.slides[0].content).toHaveLength(3);
      expect(result.slides[0].content[0].kind).toBe("text");
      expect(result.slides[0].content[1].kind).toBe("text");
      expect(result.slides[0].content[2].kind).toBe("image");
    });

    it("should handle nodes without text or image content", () => {
      const layoutNode = createMockLayoutNode({
        children: [
          createMockLayoutNode({
            // Container with no content
            children: [
              createMockLayoutNode({
                text: "Nested text",
                _rect: { x: 100, y: 100, width: 200, height: 50 },
              }),
            ],
          }),
        ],
      });

      const layoutTrees = [createMockLayoutTree("slide-1", "content", layoutNode)];
      const visualElements = [[createMockBackground()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      // Should only extract the nested text, not the container
      expect(result.slides[0].content).toHaveLength(1);
      expect((result.slides[0].content[0].content as any).text).toBe("Nested text");
    });

    it("should apply default styles when style is missing", () => {
      const layoutNode = createMockLayoutNode({
        text: "Default styled text",
        _rect: { x: 0, y: 0, width: 100, height: 50 },
        // No style property
      });

      const layoutTrees = [createMockLayoutTree("slide-1", "content", layoutNode)];
      const visualElements = [[createMockBackground()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      const textElement = result.slides[0].content[0];
      expect((textElement.content as any).font).toBe("Arial"); // Default font
      expect((textElement.content as any).fontSize).toBe(16); // Default size
      expect((textElement.content as any).color).toBe("#000000"); // Default color
    });
  });

  describe("slide context building", () => {
    it("should separate background and decorations correctly", () => {
      const layoutTrees = [createMockLayoutTree("slide-1", "hero")];
      const shape1 = createMockShape();
      const shape2 = { ...createMockShape(), id: "shape-2" };
      const visualElements = [[createMockBackground(), shape1, shape2]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      expect(result.slides[0].background).toBeDefined();
      expect(result.slides[0].background.kind).toBe("background");
      expect(result.slides[0].decorations).toHaveLength(2);
      expect(result.slides[0].decorations[0].kind).toBe("shape");
      expect(result.slides[0].decorations[1].kind).toBe("shape");
    });

    it("should extract dimensions from layout node", () => {
      const layoutNode = createMockLayoutNode({
        _rect: { x: 0, y: 0, width: 1920, height: 1080 },
      });

      const layoutTrees = [createMockLayoutTree("slide-1", "hero", layoutNode)];
      const visualElements = [[createMockBackground()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      expect(result.slides[0].dimensions).toEqual({ width: 1920, height: 1080 });
    });

    it("should use default dimensions if layout node has invalid dimensions", () => {
      const layoutNode = createMockLayoutNode({
        _rect: { x: 0, y: 0, width: 0, height: 0 }, // Invalid
      });

      const layoutTrees = [createMockLayoutTree("slide-1", "hero", layoutNode)];
      const visualElements = [[createMockBackground()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      expect(result.slides[0].dimensions).toEqual({ width: 960, height: 540 }); // Default 16:9
    });
  });

  describe("validation", () => {
    it("should use default dimensions when layout node has invalid dimensions", () => {
      const layoutNode = createMockLayoutNode({
        _rect: { x: 0, y: 0, width: -100, height: 540 }, // Negative width
      });

      const layoutTrees = [createMockLayoutTree("slide-1", "hero", layoutNode)];
      const visualElements = [[createMockBackground()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      // Should fall back to default dimensions
      expect(result.slides[0].dimensions).toEqual({ width: 960, height: 540 });
    });
  });

  describe("metadata generation", () => {
    it("should generate layout tree hash", () => {
      const layoutTrees = [createMockLayoutTree("slide-1", "hero"), createMockLayoutTree("slide-2", "content")];
      const visualElements = [[createMockBackground()], [createMockBackground()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      expect(result.metadata.layoutTreeHash).toBeDefined();
      expect(result.metadata.layoutTreeHash).toHaveLength(16); // Truncated hash
    });

    it("should generate different hashes for different layout trees", () => {
      const layoutTrees1 = [createMockLayoutTree("slide-1", "hero")];
      const layoutTrees2 = [createMockLayoutTree("slide-2", "content")];
      const visualElements = [[createMockBackground()]];

      const result1 = builder.build(layoutTrees1, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");
      const result2 = builder.build(layoutTrees2, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      expect(result1.metadata.layoutTreeHash).not.toBe(result2.metadata.layoutTreeHash);
    });

    it("should include ISO timestamp in metadata", () => {
      const layoutTrees = [createMockLayoutTree("slide-1", "hero")];
      const visualElements = [[createMockBackground()]];

      const result = builder.build(layoutTrees, visualElements, mockColorPalette, "modern", mockTypography, "theme-hash");

      expect(result.metadata.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});
