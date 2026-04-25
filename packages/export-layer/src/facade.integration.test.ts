/**
 * Integration tests for ExportLayerFacade
 *
 * Tests the facade working with actual renderer implementations
 *
 * Validates: Requirements 3.10, 8.6
 */

import { describe, it, expect } from "vitest";
import { ExportLayerFacade } from "./facade.js";
import type { VisualContext } from "@kyro/visual-layer";

describe("ExportLayerFacade Integration", () => {
  // Create a minimal valid Visual Context for testing
  const createMinimalVisualContext = (): VisualContext => ({
    version: "1.0",
    slides: [
      {
        slideId: "slide-1",
        type: "content",
        dimensions: { width: 960, height: 540 },
        background: {
          id: "bg-1",
          kind: "background",
          zIndex: 0,
          opacity: 1,
          fill: {
            type: "solid",
            color: "#ffffff",
          },
          dimensions: { width: 960, height: 540 },
        },
        decorations: [],
        content: [],
      },
    ],
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
        colorSpace: "rgb",
        generatedAt: new Date().toISOString(),
        themeSpecHash: "test-hash",
      },
    },
    theme: {
      tone: "modern",
      typography: {
        displayFont: "Arial",
        bodyFont: "Calibri",
      },
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      layoutTreeHash: "test-layout-hash",
      themeSpecHash: "test-theme-hash",
    },
  });

  describe("PPTX renderer integration", () => {
    it("should validate Visual Context using PPTX renderer", () => {
      const facade = new ExportLayerFacade();
      const renderer = facade.getRenderer("pptx");
      const visualContext = createMinimalVisualContext();

      const validation = renderer.validate(visualContext);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should get supported features from PPTX renderer", () => {
      const facade = new ExportLayerFacade();
      const renderer = facade.getRenderer("pptx");

      const features = renderer.getSupportedFeatures();

      expect(features.gradients).toBe(true);
      expect(features.customShapes).toBe(true);
    });

    it("should render Visual Context to buffer", async () => {
      const facade = new ExportLayerFacade();
      const renderer = facade.getRenderer("pptx");
      const visualContext = createMinimalVisualContext();

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe("HTML renderer integration", () => {
    it("should validate Visual Context using HTML renderer", () => {
      const facade = new ExportLayerFacade();
      const renderer = facade.getRenderer("html");
      const visualContext = createMinimalVisualContext();

      const validation = renderer.validate(visualContext);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should get supported features from HTML renderer", () => {
      const facade = new ExportLayerFacade();
      const renderer = facade.getRenderer("html");

      const features = renderer.getSupportedFeatures();

      expect(features.gradients).toBe(true);
      expect(features.blendModes).toBe(true);
      expect(features.customShapes).toBe(true);
    });

    it("should render Visual Context to buffer", async () => {
      const facade = new ExportLayerFacade();
      const renderer = facade.getRenderer("html");
      const visualContext = createMinimalVisualContext();

      const result = await renderer.render(visualContext);

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe("format switching", () => {
    it("should allow switching between renderers for same Visual Context", async () => {
      const facade = new ExportLayerFacade();
      const visualContext = createMinimalVisualContext();

      // Render to PPTX
      const pptxRenderer = facade.getRenderer("pptx");
      const pptxResult = await pptxRenderer.render(visualContext);

      // Render to HTML
      const htmlRenderer = facade.getRenderer("html");
      const htmlResult = await htmlRenderer.render(visualContext);

      expect(pptxResult.success).toBe(true);
      expect(htmlResult.success).toBe(true);
      expect(pptxResult.buffer).toBeDefined();
      expect(htmlResult.buffer).toBeDefined();
    });
  });
});
