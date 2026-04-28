/**
 * Checkpoint Verification Tests for Visual Layer
 *
 * This test suite verifies:
 * 1. Visual Layer generates complete VisualContext
 * 2. Backgrounds vary appropriately by slide type
 * 3. Decorations don't overlap with content
 * 4. Visual Context can be serialized to JSON
 */

import { describe, it, expect } from "vitest";
import { VisualLayerFacade } from "./facade.js";
import { ThemeEngine } from "./theme-engine.js";
import { VisualContextBuilder } from "./visual-context-builder.js";
import { serializeVisualContext, parseVisualContext } from "./serialization.js";
import type { ColorPalette } from "@prezvik/theme-layer";
import type { SlideTheme, ThemeTone, VisualContext } from "./models/visual-context.js";

// Mock layout tree for testing
const createMockLayoutTree = (slideId: string, slideType: string) => ({
  root: {
    type: "slide",
    _rect: { x: 0, y: 0, width: 1920, height: 1080 },
    children: [
      {
        type: "title",
        _rect: { x: 100, y: 100, width: 1720, height: 200 },
        text: "Sample Title",
      },
      {
        type: "content",
        _rect: { x: 100, y: 350, width: 1720, height: 600 },
        text: "Sample content area",
      },
    ],
  },
  metadata: {
    slideId,
    slideType,
  },
});

// Mock color palette
const mockColorPalette: ColorPalette = {
  version: "1.0",
  primary: "#0066cc",
  secondary: "#00cc66",
  accent: "#ff6600",
  lightBg: "#ffffff",
  darkBg: "#1a1a1a",
  textOnDark: "#ffffff",
  textOnLight: "#000000",
  mutedOnDark: "#cccccc",
  mutedOnLight: "#666666",
  metadata: {
    colorSpace: "oklch",
    generatedAt: new Date().toISOString(),
    themeSpecHash: "test-hash-123",
  },
};

// Mock slide themes
const createMockSlideTheme = (slideId: string, slideType: string): SlideTheme => ({
  slideId,
  backgroundMode: slideType === "hero" ? "dark" : "light",
  accentColor: mockColorPalette.accent,
  headerStyle: slideType === "hero" ? "band" : "none",
  decorations: [],
});

// Helper function to check if two rectangles overlap
function rectsOverlap(rect1: any, rect2: any): boolean {
  return !(rect1.x + rect1.width < rect2.x || rect2.x + rect2.width < rect1.x || rect1.y + rect1.height < rect2.y || rect2.y + rect2.height < rect1.y);
}

describe("Checkpoint: Visual Layer Verification", () => {
  const themeEngine = new ThemeEngine();
  const visualContextBuilder = new VisualContextBuilder();
  const visualLayerFacade = new VisualLayerFacade(themeEngine, visualContextBuilder);

  describe("CHECK 1: Visual Layer generates complete VisualContext", () => {
    it("should generate a complete SlideVisualContext with all required fields", async () => {
      const layoutTree = createMockLayoutTree("slide-1", "hero");
      const slideTheme = createMockSlideTheme("slide-1", "hero");
      const themeTone: ThemeTone = "modern";

      const slideVisualContext = await visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone);

      // Verify completeness
      expect(slideVisualContext.slideId).toBeDefined();
      expect(slideVisualContext.type).toBeDefined();
      expect(slideVisualContext.dimensions).toBeDefined();
      expect(slideVisualContext.background).toBeDefined();
      expect(Array.isArray(slideVisualContext.decorations)).toBe(true);
      expect(Array.isArray(slideVisualContext.content)).toBe(true);
    });

    it("should generate background with correct structure", async () => {
      const layoutTree = createMockLayoutTree("slide-1", "hero");
      const slideTheme = createMockSlideTheme("slide-1", "hero");
      const themeTone: ThemeTone = "modern";

      const slideVisualContext = await visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone);

      expect(slideVisualContext.background.id).toBeDefined();
      expect(slideVisualContext.background.kind).toBe("background");
      expect(slideVisualContext.background.zIndex).toBeDefined();
      expect(slideVisualContext.background.opacity).toBeDefined();
    });

    it("should extract content elements from layout tree", async () => {
      const layoutTree = createMockLayoutTree("slide-1", "hero");
      const slideTheme = createMockSlideTheme("slide-1", "hero");
      const themeTone: ThemeTone = "modern";

      const slideVisualContext = await visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone);

      expect(slideVisualContext.content.length).toBeGreaterThan(0);
      slideVisualContext.content.forEach((element) => {
        expect(element.id).toBeDefined();
        expect(element.kind).toBeDefined();
        expect(element.bounds).toBeDefined();
      });
    });
  });

  describe("CHECK 2: Backgrounds vary appropriately by slide type", () => {
    it("should generate different backgrounds for different slide types", async () => {
      const slideTypes = ["hero", "section", "content", "closing"];
      const backgrounds: any[] = [];

      for (const slideType of slideTypes) {
        const layoutTree = createMockLayoutTree(`slide-${slideType}`, slideType);
        const slideTheme = createMockSlideTheme(`slide-${slideType}`, slideType);
        const themeTone: ThemeTone = "modern";

        const slideVisualContext = await visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone);

        backgrounds.push({
          slideType,
          background: slideVisualContext.background,
        });
      }

      // Verify backgrounds are different
      const backgroundIds = backgrounds.map((b) => b.background.id);
      const uniqueBackgrounds = new Set(backgroundIds);

      expect(uniqueBackgrounds.size).toBe(backgrounds.length);
    });

    it("should generate backgrounds for all slide types without errors", async () => {
      const slideTypes = ["hero", "section", "content", "closing"];

      for (const slideType of slideTypes) {
        const layoutTree = createMockLayoutTree(`slide-${slideType}`, slideType);
        const slideTheme = createMockSlideTheme(`slide-${slideType}`, slideType);
        const themeTone: ThemeTone = "modern";

        await expect(visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone)).resolves.toBeDefined();
      }
    });
  });

  describe("CHECK 3: Decorations don't overlap with content", () => {
    it("should generate decorations that do not overlap with content areas", async () => {
      const layoutTree = createMockLayoutTree("slide-overlap-test", "hero");
      const slideTheme = createMockSlideTheme("slide-overlap-test", "hero");
      const themeTone: ThemeTone = "modern";

      const slideVisualContext = await visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone);

      // Extract content bounds
      const contentBounds = slideVisualContext.content.map((c) => c.bounds);

      // Check each decoration against content bounds
      let overlapsFound = 0;

      for (const decoration of slideVisualContext.decorations) {
        if (!decoration.bounds) continue;

        for (const contentRect of contentBounds) {
          if (rectsOverlap(decoration.bounds, contentRect)) {
            overlapsFound++;
          }
        }
      }

      expect(overlapsFound).toBe(0);
    });

    it("should generate decorations with valid bounds", async () => {
      const layoutTree = createMockLayoutTree("slide-bounds-test", "hero");
      const slideTheme = createMockSlideTheme("slide-bounds-test", "hero");
      const themeTone: ThemeTone = "modern";

      const slideVisualContext = await visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone);

      slideVisualContext.decorations.forEach((decoration) => {
        if (decoration.bounds) {
          expect(decoration.bounds.width).toBeGreaterThan(0);
          expect(decoration.bounds.height).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("CHECK 4: Visual Context can be serialized to JSON", () => {
    it("should serialize and parse VisualContext successfully", async () => {
      const layoutTrees = [createMockLayoutTree("slide-1", "hero"), createMockLayoutTree("slide-2", "content")];

      const slideVisualContexts = [];
      for (const layoutTree of layoutTrees) {
        const slideTheme = createMockSlideTheme(layoutTree.metadata.slideId, layoutTree.metadata.slideType);
        const themeTone: ThemeTone = "modern";

        const slideVisualContext = await visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone);
        slideVisualContexts.push(slideVisualContext);
      }

      const visualContext: VisualContext = {
        version: "1.0",
        slides: slideVisualContexts,
        colorPalette: mockColorPalette,
        theme: {
          tone: "modern",
          typography: {
            displayFont: "Arial",
            bodyFont: "Helvetica",
          },
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          layoutTreeHash: "test-layout-hash",
          themeSpecHash: "test-theme-hash",
        },
      };

      // Test serialization
      const serialized = serializeVisualContext(visualContext);
      expect(serialized).toBeDefined();
      expect(typeof serialized).toBe("string");

      // Test parsing
      const parsed = parseVisualContext(serialized);
      expect(parsed).toBeDefined();
    });

    it("should maintain consistency in round-trip serialization", async () => {
      const layoutTree = createMockLayoutTree("slide-1", "hero");
      const slideTheme = createMockSlideTheme("slide-1", "hero");
      const themeTone: ThemeTone = "modern";

      const slideVisualContext = await visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone);

      const visualContext: VisualContext = {
        version: "1.0",
        slides: [slideVisualContext],
        colorPalette: mockColorPalette,
        theme: {
          tone: "modern",
          typography: {
            displayFont: "Arial",
            bodyFont: "Helvetica",
          },
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          layoutTreeHash: "test-layout-hash",
          themeSpecHash: "test-theme-hash",
        },
      };

      const serialized1 = serializeVisualContext(visualContext);
      const parsed = parseVisualContext(serialized1);
      const serialized2 = serializeVisualContext(parsed);

      expect(serialized2).toBe(serialized1);
    });

    it("should preserve all VisualContext structure after serialization", async () => {
      const layoutTree = createMockLayoutTree("slide-1", "hero");
      const slideTheme = createMockSlideTheme("slide-1", "hero");
      const themeTone: ThemeTone = "modern";

      const slideVisualContext = await visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone);

      const visualContext: VisualContext = {
        version: "1.0",
        slides: [slideVisualContext],
        colorPalette: mockColorPalette,
        theme: {
          tone: "modern",
          typography: {
            displayFont: "Arial",
            bodyFont: "Helvetica",
          },
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          layoutTreeHash: "test-layout-hash",
          themeSpecHash: "test-theme-hash",
        },
      };

      const serialized = serializeVisualContext(visualContext);
      const parsed = parseVisualContext(serialized);

      expect(parsed.version).toBe("1.0");
      expect(parsed.slides.length).toBe(1);
      expect(parsed.colorPalette).toBeDefined();
      expect(parsed.theme).toBeDefined();
      expect(parsed.metadata).toBeDefined();
    });
  });
});
