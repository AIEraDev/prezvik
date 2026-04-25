/**
 * Tests for ExportLayerFacade
 *
 * Validates: Requirements 3.10, 8.6
 */

import { describe, it, expect } from "vitest";
import { ExportLayerFacade } from "./facade.js";
import { PPTXRenderer } from "./pptx-renderer.js";
import { WebRenderer } from "./web-renderer.js";

describe("ExportLayerFacade", () => {
  describe("constructor", () => {
    it("should initialize with PPTX and HTML renderers", () => {
      const facade = new ExportLayerFacade();

      // Should not throw when getting supported formats
      expect(() => facade.getRenderer("pptx")).not.toThrow();
      expect(() => facade.getRenderer("html")).not.toThrow();
    });
  });

  describe("getRenderer", () => {
    it("should return PPTXRenderer for pptx format", () => {
      const facade = new ExportLayerFacade();

      const renderer = facade.getRenderer("pptx");

      expect(renderer).toBeInstanceOf(PPTXRenderer);
    });

    it("should return WebRenderer for html format", () => {
      const facade = new ExportLayerFacade();

      const renderer = facade.getRenderer("html");

      expect(renderer).toBeInstanceOf(WebRenderer);
    });

    it("should throw descriptive error for unsupported format", () => {
      const facade = new ExportLayerFacade();

      // @ts-expect-error - Testing invalid format
      expect(() => facade.getRenderer("pdf")).toThrow("No renderer available for format: pdf");
    });

    it("should include supported formats in error message", () => {
      const facade = new ExportLayerFacade();

      // @ts-expect-error - Testing invalid format
      expect(() => facade.getRenderer("invalid")).toThrow("Supported formats: pptx, html");
    });

    it("should return same renderer instance on multiple calls", () => {
      const facade = new ExportLayerFacade();

      const renderer1 = facade.getRenderer("pptx");
      const renderer2 = facade.getRenderer("pptx");

      expect(renderer1).toBe(renderer2);
    });
  });

  describe("renderer interface compliance", () => {
    it("should return renderers that implement Renderer interface", () => {
      const facade = new ExportLayerFacade();

      const pptxRenderer = facade.getRenderer("pptx");
      const htmlRenderer = facade.getRenderer("html");

      // Check that renderers have required methods
      expect(typeof pptxRenderer.render).toBe("function");
      expect(typeof pptxRenderer.validate).toBe("function");
      expect(typeof pptxRenderer.getSupportedFeatures).toBe("function");

      expect(typeof htmlRenderer.render).toBe("function");
      expect(typeof htmlRenderer.validate).toBe("function");
      expect(typeof htmlRenderer.getSupportedFeatures).toBe("function");
    });
  });
});
