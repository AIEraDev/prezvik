import { describe, it, expect } from "vitest";
import { WebRenderer } from "./web-renderer.js";
import type { VisualContext, SlideVisualContext, LinearGradient, RadialGradient } from "@prezvik/visual-layer";

/**
 * Helper to create a mock Visual Context
 */
function createMockVisualContext(): VisualContext {
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
    },
    decorations: [
      {
        id: "shape-1",
        kind: "shape",
        shapeType: "rectangle",
        zIndex: 1,
        opacity: 0.8,
        bounds: { x: 50, y: 50, width: 200, height: 100 },
        fill: {
          type: "solid",
          color: "#3182ce",
        },
        properties: {
          cornerRadius: 10,
        },
      },
      {
        id: "shape-2",
        kind: "shape",
        shapeType: "circle",
        zIndex: 1,
        opacity: 0.6,
        bounds: { x: 700, y: 400, width: 100, height: 100 },
        fill: {
          type: "solid",
          color: "#e53e3e",
        },
      },
    ],
    content: [
      {
        id: "text-1",
        kind: "text",
        zIndex: 10,
        opacity: 1,
        bounds: { x: 100, y: 200, width: 760, height: 100 },
        content: {
          text: "Welcome to Prezvik",
          font: "Arial",
          fontSize: 48,
          color: "#ffffff",
          align: "center",
          verticalAlign: "middle",
          bold: true,
        },
      },
    ],
  };

  return {
    version: "1.0",
    slides: [slide],
    colorPalette: {
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
        colorSpace: "oklch",
        generatedAt: "2024-01-01T00:00:00.000Z",
        themeSpecHash: "test-hash",
      },
    },
    theme: {
      tone: "executive",
      typography: {
        displayFont: "Montserrat",
        bodyFont: "Open Sans",
      },
    },
    metadata: {
      generatedAt: "2024-01-01T00:00:00.000Z",
      layoutTreeHash: "layout-hash",
      themeSpecHash: "theme-hash",
    },
  };
}

describe("WebRenderer", () => {
  describe("render", () => {
    it("should render Visual Context to HTML", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();

      const html = result.buffer!.toString("utf-8");
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain('<div class="reveal">');
      expect(html).toContain("Welcome to Prezvik");
    });

    it("should render to file when outputPath is provided", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();
      const outputPath = "/tmp/test-presentation.html";

      const result = await renderer.render(visualContext, { outputPath });

      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(outputPath);
    });

    it("should include Reveal.js CDN links", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext);

      const html = result.buffer!.toString("utf-8");
      expect(html).toContain("reveal.js");
      expect(html).toContain("Reveal.initialize");
    });

    it("should apply custom options", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext, {
        theme: "white",
        transition: "fade",
        controls: false,
        progress: false,
      });

      const html = result.buffer!.toString("utf-8");
      expect(html).toContain("theme/white.css");
      expect(html).toContain("transition: 'fade'");
      expect(html).toContain("controls: false");
      expect(html).toContain("progress: false");
    });
  });

  describe("validate", () => {
    it("should validate correct Visual Context", () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      const result = renderer.validate(visualContext);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject unsupported version", () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();
      visualContext.version = "2.0" as any;

      const result = renderer.validate(visualContext);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Unsupported Visual Context version: 2.0");
    });

    it("should reject empty slides", () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();
      visualContext.slides = [];

      const result = renderer.validate(visualContext);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Visual Context must contain at least one slide");
    });

    it("should reject invalid dimensions", () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();
      visualContext.slides[0].dimensions = { width: 0, height: 0 };

      const result = renderer.validate(visualContext);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should warn about missing background", () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();
      visualContext.slides[0].background = null as any;

      const result = renderer.validate(visualContext);

      expect(result.warnings).toContain("Slide slide-1 has no background");
    });
  });

  describe("getSupportedFeatures", () => {
    it("should report supported features", () => {
      const renderer = new WebRenderer();

      const features = renderer.getSupportedFeatures();

      expect(features.gradients).toBe(true);
      expect(features.patterns).toBe(true);
      expect(features.blendModes).toBe(true);
      expect(features.customShapes).toBe(true);
    });
  });

  describe("gradient conversion", () => {
    it("should convert linear gradient to CSS", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).toContain("linear-gradient");
      expect(html).toContain("45deg");
      expect(html).toContain("#1a365d");
      expect(html).toContain("#2c7a7b");
    });

    it("should convert radial gradient to CSS", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      // Change to radial gradient
      const radialGradient: RadialGradient = {
        type: "radial",
        center: { x: 0.5, y: 0.5 },
        radius: 0.5,
        stops: [
          { position: 0, color: "#ff0000" },
          { position: 1, color: "#0000ff" },
        ],
      };
      visualContext.slides[0].background.fill = {
        type: "gradient",
        gradient: radialGradient,
      };

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).toContain("radial-gradient");
      expect(html).toContain("circle");
      expect(html).toContain("50%");
      expect(html).toContain("#ff0000");
      expect(html).toContain("#0000ff");
    });
  });

  describe("shape conversion to SVG", () => {
    it("should convert rectangle to SVG", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).toContain("<rect");
      expect(html).toContain('x="50"');
      expect(html).toContain('y="50"');
      expect(html).toContain('width="200"');
      expect(html).toContain('height="100"');
      expect(html).toContain('rx="10"'); // corner radius
    });

    it("should convert circle to SVG", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).toContain("<circle");
      expect(html).toContain('cx="750"'); // x + width/2
      expect(html).toContain('cy="450"'); // y + height/2
      expect(html).toContain('r="50"'); // min(width, height)/2
    });

    it("should convert line to SVG", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      // Add a line shape
      visualContext.slides[0].decorations.push({
        id: "shape-3",
        kind: "shape",
        shapeType: "line",
        zIndex: 1,
        opacity: 1,
        bounds: { x: 100, y: 100, width: 300, height: 0 },
        stroke: {
          color: "#000000",
          width: 2,
        },
      });

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).toContain("<line");
      expect(html).toContain('x1="100"');
      expect(html).toContain('y1="100"');
      expect(html).toContain('x2="400"');
    });

    it("should convert polygon to SVG", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      // Add a polygon shape
      visualContext.slides[0].decorations.push({
        id: "shape-4",
        kind: "shape",
        shapeType: "polygon",
        zIndex: 1,
        opacity: 1,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
        fill: {
          type: "solid",
          color: "#00ff00",
        },
        properties: {
          points: [
            { x: 50, y: 0 },
            { x: 100, y: 50 },
            { x: 50, y: 100 },
            { x: 0, y: 50 },
          ],
        },
      });

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).toContain("<polygon");
      expect(html).toContain("points=");
      expect(html).toContain("50,0");
      expect(html).toContain("100,50");
    });

    it("should apply opacity to shapes", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).toContain('opacity="0.8"');
      expect(html).toContain('opacity="0.6"');
    });
  });

  describe("content rendering", () => {
    it("should render text content", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).toContain("Welcome to Prezvik");
      expect(html).toContain("font-family: Arial");
      expect(html).toContain("font-size: 48px");
      expect(html).toContain("color: #ffffff");
      expect(html).toContain("text-align: center");
      expect(html).toContain("font-weight: bold");
    });

    it("should render image content", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      // Add image content
      visualContext.slides[0].content.push({
        id: "image-1",
        kind: "image",
        zIndex: 10,
        opacity: 1,
        bounds: { x: 300, y: 300, width: 360, height: 200 },
        content: {
          src: "https://example.com/image.jpg",
          fit: "cover",
        },
      });

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).toContain('<img src="https://example.com/image.jpg"');
      expect(html).toContain("object-fit: cover");
    });

    it("should escape HTML in text content", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      visualContext.slides[0].content[0].content = {
        text: '<script>alert("XSS")</script>',
        font: "Arial",
        fontSize: 24,
        color: "#000000",
        align: "left",
        verticalAlign: "top",
      };

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).not.toContain('<script>alert("XSS")</script>');
      expect(html).toContain("&lt;script&gt;");
      expect(html).toContain("&lt;/script&gt;");
    });
  });

  describe("responsive design", () => {
    it("should include responsive CSS", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).toContain("@media (max-width: 768px)");
    });
  });

  describe("typography", () => {
    it("should apply theme typography", async () => {
      const renderer = new WebRenderer();
      const visualContext = createMockVisualContext();

      const result = await renderer.render(visualContext);
      const html = result.buffer!.toString("utf-8");

      expect(html).toContain("font-family: Open Sans");
      expect(html).toContain("font-family: Montserrat");
    });
  });
});
