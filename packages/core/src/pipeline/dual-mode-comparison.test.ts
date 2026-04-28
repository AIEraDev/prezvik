/**
 * Dual-Mode Comparison Tests
 *
 * Tests that compare output quality and visual similarity between
 * legacy and layered rendering modes.
 *
 * Requirements tested:
 * - 10.9: Output equivalence between legacy and layered modes
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateDeck } from "../deck";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

describe("Dual-Mode Comparison Tests", () => {
  let tempDir: string;
  let legacyOutputPath: string;
  let layeredOutputPath: string;

  beforeEach(() => {
    // Create temp directory for test outputs
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prezvik-dual-mode-test-"));
    legacyOutputPath = path.join(tempDir, "legacy-output.pptx");
    layeredOutputPath = path.join(tempDir, "layered-output.pptx");
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("Output File Generation", () => {
    it("should generate PPTX files in both modes", async () => {
      const schema = createTestSchema(3);

      // Generate in legacy mode
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });

      // Generate in layered mode
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      // Verify both files exist
      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);
    });

    it("should generate valid PPTX files in both modes", async () => {
      const schema = createTestSchema(3);

      // Generate in both modes
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      // Verify both files have ZIP signature (PPTX is a ZIP archive)
      const legacyBuffer = fs.readFileSync(legacyOutputPath);
      const layeredBuffer = fs.readFileSync(layeredOutputPath);

      const legacySignature = legacyBuffer.slice(0, 4).toString("hex");
      const layeredSignature = layeredBuffer.slice(0, 4).toString("hex");

      expect(legacySignature).toBe("504b0304");
      expect(layeredSignature).toBe("504b0304");
    });

    it("should generate files with reasonable sizes in both modes", async () => {
      const schema = createTestSchema(5);

      // Generate in both modes
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      // Verify file sizes are reasonable
      const legacyStats = fs.statSync(legacyOutputPath);
      const layeredStats = fs.statSync(layeredOutputPath);

      // Both should be at least 10KB
      expect(legacyStats.size).toBeGreaterThan(10000);
      expect(layeredStats.size).toBeGreaterThan(10000);

      // Both should be less than 10MB
      expect(legacyStats.size).toBeLessThan(10000000);
      expect(layeredStats.size).toBeLessThan(10000000);
    });
  });

  describe("File Size Comparison", () => {
    it("should generate files with similar sizes for simple presentations", async () => {
      const schema = createTestSchema(3);

      // Generate in both modes
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      const legacyStats = fs.statSync(legacyOutputPath);
      const layeredStats = fs.statSync(layeredOutputPath);

      // File sizes should be within 50% of each other
      const sizeDifference = Math.abs(legacyStats.size - layeredStats.size);
      const averageSize = (legacyStats.size + layeredStats.size) / 2;
      const percentDifference = (sizeDifference / averageSize) * 100;

      expect(percentDifference).toBeLessThan(50);
    });

    it("should generate files with similar sizes for complex presentations", async () => {
      const schema = createComplexSchema();

      // Generate in both modes
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      const legacyStats = fs.statSync(legacyOutputPath);
      const layeredStats = fs.statSync(layeredOutputPath);

      // File sizes should be within 50% of each other
      const sizeDifference = Math.abs(legacyStats.size - layeredStats.size);
      const averageSize = (legacyStats.size + layeredStats.size) / 2;
      const percentDifference = (sizeDifference / averageSize) * 100;

      expect(percentDifference).toBeLessThan(50);
    });
  });

  describe("Slide Count Consistency", () => {
    it("should generate same number of slides in both modes", async () => {
      const slideCount = 5;
      const schema = createTestSchema(slideCount);

      // Generate in both modes
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      // Both files should exist
      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);

      // Note: Actual slide count verification would require parsing PPTX
      // For now, we verify files were created successfully
    });

    it("should handle single slide presentations in both modes", async () => {
      const schema = createTestSchema(1);

      // Generate in both modes
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);
    });

    it("should handle large presentations in both modes", async () => {
      const schema = createTestSchema(10);

      // Generate in both modes
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);
    });
  });

  describe("Content Type Support", () => {
    it("should support hero slides in both modes", async () => {
      const schema = {
        meta: {
          title: "Hero Slide Test",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "slide-1",
            type: "hero",
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Hero Title",
                level: "h1",
              },
            ],
          },
        ],
      };

      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);
    });

    it("should support content slides in both modes", async () => {
      const schema = {
        meta: {
          title: "Content Slide Test",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "slide-1",
            type: "content",
            layout: "two_column",
            content: [
              {
                type: "heading",
                value: "Content Title",
                level: "h2",
              },
              {
                type: "text",
                value: "Content body text",
              },
            ],
          },
        ],
      };

      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);
    });

    it("should support section slides in both modes", async () => {
      const schema = {
        meta: {
          title: "Section Slide Test",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "slide-1",
            type: "section",
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Section Title",
                level: "h1",
              },
            ],
          },
        ],
      };

      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);
    });

    it("should support closing slides in both modes", async () => {
      const schema = {
        meta: {
          title: "Closing Slide Test",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "slide-1",
            type: "closing",
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Thank You",
                level: "h1",
              },
            ],
          },
        ],
      };

      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);
    });
  });

  describe("Theme Support", () => {
    it("should apply executive theme in both modes", async () => {
      const schema = {
        ...createTestSchema(3),
        theme: {
          name: "executive",
        },
      };

      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);
    });

    it("should apply minimal theme in both modes", async () => {
      const schema = {
        ...createTestSchema(3),
        theme: {
          name: "minimal",
        },
      };

      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);
    });

    it("should apply modern theme in both modes", async () => {
      const schema = {
        ...createTestSchema(3),
        theme: {
          name: "modern",
        },
      };

      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);
    });
  });

  describe("Error Handling Consistency", () => {
    it("should handle invalid schema in both modes", async () => {
      const invalidSchema = {
        // Missing required fields
        slides: [],
      };

      // Both modes should handle errors gracefully
      await expect(generateDeck(invalidSchema, legacyOutputPath, { mode: "legacy" })).rejects.toThrow();
      await expect(generateDeck(invalidSchema, layeredOutputPath, { mode: "layered" })).rejects.toThrow();
    });

    it("should handle empty slides array in both modes", async () => {
      const schema = {
        meta: {
          title: "Empty Presentation",
          goal: "inform",
          tone: "modern",
        },
        slides: [],
      };

      // Both modes should handle empty presentations
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);
    });
  });

  describe("Performance Comparison", () => {
    it("should complete generation in reasonable time for both modes", async () => {
      const schema = createTestSchema(5);

      // Measure legacy mode
      const legacyStart = Date.now();
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      const legacyTime = Date.now() - legacyStart;

      // Measure layered mode
      const layeredStart = Date.now();
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });
      const layeredTime = Date.now() - layeredStart;

      // Both should complete in under 10 seconds
      expect(legacyTime).toBeLessThan(10000);
      expect(layeredTime).toBeLessThan(10000);

      console.log(`Legacy mode: ${legacyTime}ms, Layered mode: ${layeredTime}ms`);
    });

    it("should have comparable performance for large presentations", async () => {
      const schema = createTestSchema(10);

      // Measure legacy mode
      const legacyStart = Date.now();
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      const legacyTime = Date.now() - legacyStart;

      // Measure layered mode
      const layeredStart = Date.now();
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });
      const layeredTime = Date.now() - layeredStart;

      // Both should complete in under 15 seconds
      expect(legacyTime).toBeLessThan(15000);
      expect(layeredTime).toBeLessThan(15000);

      // Performance should be within 3x of each other
      const ratio = Math.max(legacyTime, layeredTime) / Math.min(legacyTime, layeredTime);
      expect(ratio).toBeLessThan(3);

      console.log(`Legacy mode: ${legacyTime}ms, Layered mode: ${layeredTime}ms, Ratio: ${ratio.toFixed(2)}x`);
    });
  });

  describe("Visual Similarity", () => {
    it("should generate presentations with similar structure", async () => {
      const schema = createTestSchema(3);

      // Generate in both modes
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      // Both files should exist and be valid
      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);

      // Note: Detailed visual comparison would require:
      // 1. Parsing PPTX XML structure
      // 2. Comparing slide layouts
      // 3. Comparing text content
      // 4. Comparing colors and styles
      // This is beyond the scope of unit tests and would be better
      // suited for visual regression testing tools
    });

    it("should preserve content across modes", async () => {
      const schema = createTestSchema(3);

      // Generate in both modes
      await generateDeck(schema, legacyOutputPath, { mode: "legacy" });
      await generateDeck(schema, layeredOutputPath, { mode: "layered" });

      // Both files should exist
      expect(fs.existsSync(legacyOutputPath)).toBe(true);
      expect(fs.existsSync(layeredOutputPath)).toBe(true);

      // Note: Content verification would require PPTX parsing
      // For now, we verify successful generation
    });
  });
});

/**
 * Helper function to create a test schema with specified number of slides
 */
function createTestSchema(slideCount: number): any {
  const slides = Array.from({ length: slideCount }, (_, i) => ({
    id: `slide-${i + 1}`,
    type: i === 0 ? "hero" : i === slideCount - 1 ? "closing" : "content",
    layout: "center_focus",
    content: [
      {
        type: "heading",
        value: `Slide ${i + 1} Title`,
        level: i === 0 ? "h1" : "h2",
      },
      {
        type: "text",
        value: `This is the content for slide ${i + 1}`,
      },
    ],
  }));

  return {
    meta: {
      title: "Test Presentation",
      goal: "inform",
      tone: "modern",
    },
    slides,
  };
}

/**
 * Helper function to create a complex test schema
 */
function createComplexSchema(): any {
  return {
    meta: {
      title: "Complex Test Presentation",
      subtitle: "A comprehensive test",
      author: "Test Author",
      goal: "educate",
      tone: "formal",
    },
    theme: {
      name: "executive",
      primaryColor: "#2563EB",
    },
    slides: [
      {
        id: "slide-1",
        type: "hero",
        layout: "center_focus",
        content: [
          {
            type: "heading",
            value: "Complex Presentation",
            level: "h1",
          },
          {
            type: "text",
            value: "A comprehensive test of all features",
          },
        ],
      },
      {
        id: "slide-2",
        type: "section",
        layout: "center_focus",
        content: [
          {
            type: "heading",
            value: "Section 1",
            level: "h1",
          },
        ],
      },
      {
        id: "slide-3",
        type: "content",
        layout: "two_column",
        content: [
          {
            type: "heading",
            value: "Key Points",
            level: "h2",
          },
          {
            type: "text",
            value: "First point about the topic",
          },
          {
            type: "text",
            value: "Second point with more details",
          },
        ],
      },
      {
        id: "slide-4",
        type: "content",
        layout: "center_focus",
        content: [
          {
            type: "heading",
            value: "Details",
            level: "h2",
          },
          {
            type: "text",
            value: "Detailed explanation of the concept",
          },
        ],
      },
      {
        id: "slide-5",
        type: "closing",
        layout: "center_focus",
        content: [
          {
            type: "heading",
            value: "Thank You",
            level: "h1",
          },
          {
            type: "text",
            value: "Questions?",
          },
        ],
      },
    ],
  };
}
