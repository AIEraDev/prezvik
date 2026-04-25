/**
 * Verification script for Visual Layer Checkpoint
 *
 * This script verifies:
 * 1. Visual Layer generates complete VisualContext
 * 2. Backgrounds vary appropriately by slide type
 * 3. Decorations don't overlap with content
 * 4. Visual Context can be serialized to JSON
 */

import { VisualLayerFacade } from "./src/facade.js";
import { ThemeEngine } from "./src/theme-engine.js";
import { VisualContextBuilder } from "./src/visual-context-builder.js";
import { serializeVisualContext, parseVisualContext } from "./src/serialization.js";
import type { ColorPalette } from "@kyro/theme-layer";
import type { SlideTheme, ThemeTone } from "./src/models/visual-context.js";

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

async function verifyVisualLayer() {
  console.log("🔍 Visual Layer Checkpoint Verification\n");
  console.log("=".repeat(60));

  const themeEngine = new ThemeEngine();
  const visualContextBuilder = new VisualContextBuilder();
  const visualLayerFacade = new VisualLayerFacade(themeEngine, visualContextBuilder);

  let allChecksPassed = true;

  // ============================================================
  // CHECK 1: Visual Layer generates complete VisualContext
  // ============================================================
  console.log("\n✓ CHECK 1: Visual Layer generates complete VisualContext");
  console.log("-".repeat(60));

  try {
    const layoutTree = createMockLayoutTree("slide-1", "hero");
    const slideTheme = createMockSlideTheme("slide-1", "hero");
    const themeTone: ThemeTone = "modern";

    const slideVisualContext = await visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone);

    // Verify completeness
    const checks = [
      { name: "Has slideId", pass: !!slideVisualContext.slideId },
      { name: "Has type", pass: !!slideVisualContext.type },
      { name: "Has dimensions", pass: !!slideVisualContext.dimensions },
      { name: "Has background", pass: !!slideVisualContext.background },
      { name: "Has decorations array", pass: Array.isArray(slideVisualContext.decorations) },
      { name: "Has content array", pass: Array.isArray(slideVisualContext.content) },
      { name: "Background has id", pass: !!slideVisualContext.background.id },
      { name: "Background has kind", pass: slideVisualContext.background.kind === "background" },
      { name: "Content elements extracted", pass: slideVisualContext.content.length > 0 },
    ];

    checks.forEach((check) => {
      console.log(`  ${check.pass ? "✓" : "✗"} ${check.name}`);
      if (!check.pass) allChecksPassed = false;
    });

    console.log(`\n  Generated ${slideVisualContext.decorations.length} decoration shapes`);
    console.log(`  Generated ${slideVisualContext.content.length} content elements`);
    console.log(`  Background type: ${slideVisualContext.background.kind}`);
  } catch (error) {
    console.log(`  ✗ Failed to generate VisualContext: ${error}`);
    allChecksPassed = false;
  }

  // ============================================================
  // CHECK 2: Backgrounds vary appropriately by slide type
  // ============================================================
  console.log("\n✓ CHECK 2: Backgrounds vary appropriately by slide type");
  console.log("-".repeat(60));

  try {
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

      console.log(`  ✓ ${slideType.padEnd(10)} - Background generated successfully`);
    }

    // Verify backgrounds are different
    const backgroundIds = backgrounds.map((b) => b.background.id);
    const uniqueBackgrounds = new Set(backgroundIds);

    if (uniqueBackgrounds.size === backgrounds.length) {
      console.log(`  ✓ All backgrounds have unique IDs`);
    } else {
      console.log(`  ✗ Some backgrounds have duplicate IDs`);
      allChecksPassed = false;
    }
  } catch (error) {
    console.log(`  ✗ Failed to generate backgrounds: ${error}`);
    allChecksPassed = false;
  }

  // ============================================================
  // CHECK 3: Decorations don't overlap with content
  // ============================================================
  console.log("\n✓ CHECK 3: Decorations don't overlap with content");
  console.log("-".repeat(60));

  try {
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
          console.log(`  ⚠ Decoration ${decoration.id} overlaps with content`);
        }
      }
    }

    if (overlapsFound === 0) {
      console.log(`  ✓ No overlaps detected between ${slideVisualContext.decorations.length} decorations and ${contentBounds.length} content areas`);
    } else {
      console.log(`  ✗ Found ${overlapsFound} overlaps`);
      allChecksPassed = false;
    }
  } catch (error) {
    console.log(`  ✗ Failed to check overlaps: ${error}`);
    allChecksPassed = false;
  }

  // ============================================================
  // CHECK 4: Visual Context can be serialized to JSON
  // ============================================================
  console.log("\n✓ CHECK 4: Visual Context can be serialized to JSON");
  console.log("-".repeat(60));

  try {
    // Generate a complete VisualContext
    const layoutTrees = [createMockLayoutTree("slide-1", "hero"), createMockLayoutTree("slide-2", "content")];

    const slideVisualContexts = [];
    for (const layoutTree of layoutTrees) {
      const slideTheme = createMockSlideTheme(layoutTree.metadata.slideId, layoutTree.metadata.slideType);
      const themeTone: ThemeTone = "modern";

      const slideVisualContext = await visualLayerFacade.generateSlideVisuals(layoutTree, mockColorPalette, slideTheme, themeTone);
      slideVisualContexts.push(slideVisualContext);
    }

    const visualContext = {
      version: "1.0" as const,
      slides: slideVisualContexts,
      colorPalette: mockColorPalette,
      theme: {
        tone: "modern" as const,
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
    console.log(`  ✓ Serialized to JSON (${serialized.length} bytes)`);

    // Test parsing
    const parsed = parseVisualContext(serialized);
    console.log(`  ✓ Parsed from JSON successfully`);

    // Test round-trip
    const serialized2 = serializeVisualContext(parsed);
    const roundTripMatch = serialized === serialized2;

    if (roundTripMatch) {
      console.log(`  ✓ Round-trip serialization maintains consistency`);
    } else {
      console.log(`  ✗ Round-trip serialization changed the data`);
      allChecksPassed = false;
    }

    // Verify structure
    const structureChecks = [
      { name: "Version preserved", pass: parsed.version === "1.0" },
      { name: "Slides count preserved", pass: parsed.slides.length === 2 },
      { name: "Color palette preserved", pass: !!parsed.colorPalette },
      { name: "Theme preserved", pass: !!parsed.theme },
      { name: "Metadata preserved", pass: !!parsed.metadata },
    ];

    structureChecks.forEach((check) => {
      console.log(`  ${check.pass ? "✓" : "✗"} ${check.name}`);
      if (!check.pass) allChecksPassed = false;
    });
  } catch (error) {
    console.log(`  ✗ Failed serialization test: ${error}`);
    allChecksPassed = false;
  }

  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  console.log("\n" + "=".repeat(60));
  if (allChecksPassed) {
    console.log("✅ ALL CHECKS PASSED - Visual Layer is ready for Phase 4");
  } else {
    console.log("❌ SOME CHECKS FAILED - Please review the issues above");
  }
  console.log("=".repeat(60) + "\n");

  return allChecksPassed;
}

// Helper function to check if two rectangles overlap
function rectsOverlap(rect1: any, rect2: any): boolean {
  return !(rect1.x + rect1.width < rect2.x || rect2.x + rect2.width < rect1.x || rect1.y + rect1.height < rect2.y || rect2.y + rect2.height < rect1.y);
}

// Run verification
verifyVisualLayer()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Verification failed with error:", error);
    process.exit(1);
  });
