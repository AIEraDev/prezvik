import { describe, it, expect, beforeEach } from "vitest";
import { PPTXRenderer } from "./pptx-renderer.js";
import type { VisualContext, SlideVisualContext } from "@kyro/visual-layer";
import type { ColorPalette } from "@kyro/theme-layer";
import fs from "fs";
import path from "path";

/**
 * Integration tests for PPTX Renderer
 * Tests rendering Visual Context to PPTX format
 */

describe("PPTXRenderer", () => {
  let renderer: PPTXRenderer;

  beforeEach(() => {
    renderer = new PPTXRenderer();
  });

  describe("getSupportedFeatures", () => {
    it("should return correct feature support", () => {
      const features = renderer.getSupportedFeatures();

      expect(features.gradients).toBe(true);
      expect(features.patterns).toBe(false);
      expect(features.blendModes).toBe(false);
      expect(features.customShapes).toBe(true);
    });
  });

  describe("validate", () => {
    it("should validate a valid Visual Context", () => {
      const visualContext = createMockVisualContext();

      const result = renderer.validate(visualContext);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject Visual Context with wrong version", () => {
      const visualContext = createMockVisualContext();
      visualContext.version = "2.0" as any;

      const result = renderer.validate(visualContext);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Unsupported Visual Context version: 2.0");
    });

    it("should reject Visual Context with no slides", () => {
      const visualContext = createMockVisualContext();
      visualContext.slides = [];

      const result = renderer.validate(visualContext);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Visual Context must contain at least one slide");
    });

    it("should reject Visual Context with invalid dimensions", () => {
      const visualContext = createMockVisualContext();
      visualContext.slides[0].dimensions = { width: 0, height: 0 };

      const result = renderer.validate(visualContext);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should warn about missing background", () => {
      const visualContext = createMockVisualContext();
      visualContext.slides[0].background = null as any;

      const result = renderer.validate(visualContext);

      expect(result.warnings).toContain(`Slide ${visualContext.slides[0].slideId} has no background`);
    });
  });

  describe("render", () => {
    it("should render Visual Context to PPTX buffer", async () => {
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it("should render Visual Context to PPTX file", async () => {
      const visualContext = createMockVisualContext();
      const outputPath = path.join(process.cwd(), "test-output", "test-render.pptx");

      // Ensure test-output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const result = await renderer.render(visualContext, { outputPath });

      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Clean up
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });

    it("should render slides with gradient backgrounds", async () => {
      const visualContext = createMockVisualContext();
      visualContext.slides[0].background = {
        id: "bg-1",
        kind: "background",
        zIndex: 0,
        opacity: 1,
        fill: {
          type: "gradient",
          gradient: {
            type: "linear",
            angle: 45,
            stops: [
              { position: 0, color: "#1a365d" },
              { position: 1, color: "#2c7a7b" },
            ],
          },
        },
        dimensions: { width: 960, height: 540 },
      };

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
    });

    it("should render slides with shapes", async () => {
      const visualContext = createMockVisualContext();
      visualContext.slides[0].decorations = [
        {
          id: "shape-1",
          kind: "shape",
          shapeType: "rectangle",
          zIndex: 1,
          opacity: 0.8,
          bounds: { x: 100, y: 100, width: 200, height: 100 },
          fill: {
            type: "solid",
            color: "#3182ce",
          },
          properties: {
            cornerRadius: 8,
          },
        },
        {
          id: "shape-2",
          kind: "shape",
          shapeType: "circle",
          zIndex: 1,
          opacity: 0.6,
          bounds: { x: 400, y: 200, width: 100, height: 100 },
          fill: {
            type: "solid",
            color: "#e53e3e",
          },
        },
      ];

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
    });

    it("should render slides with text content", async () => {
      const visualContext = createMockVisualContext();
      visualContext.slides[0].content = [
        {
          id: "text-1",
          kind: "text",
          zIndex: 10,
          opacity: 1,
          bounds: { x: 100, y: 100, width: 400, height: 100 },
          content: {
            text: "Hello, World!",
            font: "Calibri",
            fontSize: 24,
            color: "#1a202c",
            align: "center",
            verticalAlign: "middle",
            bold: true,
          },
        },
      ];

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
    });

    it("should handle rendering errors gracefully", async () => {
      const visualContext = createMockVisualContext();
      // Create invalid Visual Context
      visualContext.slides[0].dimensions = { width: -1, height: -1 };

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it("should render multiple slides", async () => {
      const visualContext = createMockVisualContext();

      // Add a second slide
      visualContext.slides.push({
        slideId: "slide-2",
        type: "content",
        dimensions: { width: 960, height: 540 },
        background: {
          id: "bg-2",
          kind: "background",
          zIndex: 0,
          opacity: 1,
          fill: {
            type: "solid",
            color: "#f7fafc",
          },
          dimensions: { width: 960, height: 540 },
        },
        decorations: [],
        content: [],
      });

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
    });

    it("should apply presentation metadata", async () => {
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext, {
        author: "Test Author",
        title: "Test Presentation",
        subject: "Test Subject",
      });

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
    });
  });

  describe("gradient conversion", () => {
    it("should convert linear gradients correctly", async () => {
      const visualContext = createMockVisualContext();
      visualContext.slides[0].background = {
        id: "bg-1",
        kind: "background",
        zIndex: 0,
        opacity: 1,
        fill: {
          type: "gradient",
          gradient: {
            type: "linear",
            angle: 90,
            stops: [
              { position: 0, color: "#ff0000" },
              { position: 0.5, color: "#00ff00" },
              { position: 1, color: "#0000ff" },
            ],
          },
        },
        dimensions: { width: 960, height: 540 },
      };

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
    });

    it("should convert radial gradients to linear (fallback)", async () => {
      const visualContext = createMockVisualContext();
      visualContext.slides[0].background = {
        id: "bg-1",
        kind: "background",
        zIndex: 0,
        opacity: 1,
        fill: {
          type: "gradient",
          gradient: {
            type: "radial",
            center: { x: 0.5, y: 0.5 },
            radius: 0.5,
            stops: [
              { position: 0, color: "#ffffff" },
              { position: 1, color: "#000000" },
            ],
          },
        },
        dimensions: { width: 960, height: 540 },
      };

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
    });
  });

  describe("shape conversion", () => {
    it("should convert rectangles with corner radius", async () => {
      const visualContext = createMockVisualContext();
      visualContext.slides[0].decorations = [
        {
          id: "shape-1",
          kind: "shape",
          shapeType: "rectangle",
          zIndex: 1,
          opacity: 1,
          bounds: { x: 100, y: 100, width: 200, height: 100 },
          fill: {
            type: "solid",
            color: "#3182ce",
          },
          properties: {
            cornerRadius: 16,
          },
        },
      ];

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
    });

    it("should convert circles", async () => {
      const visualContext = createMockVisualContext();
      visualContext.slides[0].decorations = [
        {
          id: "shape-1",
          kind: "shape",
          shapeType: "circle",
          zIndex: 1,
          opacity: 1,
          bounds: { x: 100, y: 100, width: 100, height: 100 },
          fill: {
            type: "solid",
            color: "#e53e3e",
          },
        },
      ];

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
    });

    it("should convert lines", async () => {
      const visualContext = createMockVisualContext();
      visualContext.slides[0].decorations = [
        {
          id: "shape-1",
          kind: "shape",
          shapeType: "line",
          zIndex: 1,
          opacity: 1,
          bounds: { x: 100, y: 100, width: 200, height: 0 },
          stroke: {
            color: "#2d3748",
            width: 2,
          },
        },
      ];

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
    });

    it("should apply strokes to shapes", async () => {
      const visualContext = createMockVisualContext();
      visualContext.slides[0].decorations = [
        {
          id: "shape-1",
          kind: "shape",
          shapeType: "rectangle",
          zIndex: 1,
          opacity: 1,
          bounds: { x: 100, y: 100, width: 200, height: 100 },
          fill: {
            type: "solid",
            color: "#ffffff",
          },
          stroke: {
            color: "#2d3748",
            width: 3,
            dashArray: [5, 5],
          },
        },
      ];

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
    });
  });
});

/**
 * Helper function to create a mock Visual Context for testing
 */
function createMockVisualContext(): VisualContext {
  const colorPalette: ColorPalette = {
    version: "1.0",
    primary: "#1a365d",
    secondary: "#2c7a7b",
    accent: "#3182ce",
    lightBg: "#f7fafc",
    darkBg: "#1a365d",
    textOnDark: "#ffffff",
    textOnLight: "#1a202c",
    mutedOnDark: "#cbd5e0",
    mutedOnLight: "#718096",
    metadata: {
      colorSpace: "rgb",
      generatedAt: new Date().toISOString(),
      themeSpecHash: "test-hash",
    },
  };

  const slide: SlideVisualContext = {
    slideId: "slide-1",
    type: "hero",
    dimensions: { width: 960, height: 540 },
    background: {
      id: "bg-1",
      kind: "background",
      zIndex: 0,
      opacity: 1,
      fill: {
        type: "solid",
        color: "#1a365d",
      },
      dimensions: { width: 960, height: 540 },
    },
    decorations: [],
    content: [],
  };

  return {
    version: "1.0",
    slides: [slide],
    colorPalette,
    theme: {
      tone: "executive",
      typography: {
        displayFont: "Montserrat",
        bodyFont: "Open Sans",
      },
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      layoutTreeHash: "test-layout-hash",
      themeSpecHash: "test-theme-hash",
    },
  };
}
