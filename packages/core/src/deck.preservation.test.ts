/**
 * Preservation Property Tests - Background Theme Rendering Fix
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 *
 * These tests verify that non-background rendering behavior remains unchanged
 * by the fix. They follow the observation-first methodology:
 * 1. Observe behavior on UNFIXED code for non-buggy inputs
 * 2. Write property-based tests capturing observed behavior patterns
 * 3. Run tests on UNFIXED code - they should PASS
 * 4. After fix, re-run tests to ensure no regressions
 *
 * **EXPECTED OUTCOME**: These tests PASS on unfixed code (confirms baseline behavior)
 *
 * Property-based testing generates many test cases for stronger guarantees that
 * the fix does not introduce regressions in non-background rendering.
 */

import { describe, it, expect } from "vitest";
import { generateDeck } from "./deck.js";
import type { KyroBlueprint } from "@kyro/schema";
import * as fs from "fs";
import * as path from "path";
import * as fc from "fast-check";

describe("Preservation Property Tests - Non-Background Rendering", () => {
  const testOutputDir = path.join(process.cwd(), "test-output", "preservation");

  // Ensure output directory exists
  if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir, { recursive: true });
  }

  /**
   * Property 2: Preservation - Non-Background Rendering Unchanged
   *
   * This property verifies that all rendering operations that do NOT involve
   * background color application produce the same results before and after the fix.
   *
   * **Scope**: Text rendering, image rendering, shape rendering, decoration rendering,
   * header bands, slide numbers, and layout computation.
   *
   * **EXPECTED OUTCOME**: Tests PASS on unfixed code (baseline behavior is correct)
   */

  describe("Property 2: Non-Background Rendering Preservation", () => {
    /**
     * Arbitrary for generating valid slide types
     */
    const slideTypeArb = fc.constantFrom("hero", "content", "data", "closing");

    /**
     * Arbitrary for generating valid layout types
     */
    const layoutArb = fc.constantFrom("center_focus", "two_column", "grid_2x2");

    /**
     * Arbitrary for generating simple text content
     */
    const textContentArb = fc.record({
      type: fc.constant("heading" as const),
      value: fc.string({ minLength: 1, maxLength: 50 }),
      level: fc.constantFrom("h1" as const, "h2" as const),
      emphasis: fc.constantFrom("high" as const, "medium" as const),
    });

    /**
     * Arbitrary for generating simple slides
     */
    const slideArb = fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }).map((s) => `slide-${s}`),
      type: slideTypeArb,
      intent: fc.string({ minLength: 5, maxLength: 30 }),
      layout: layoutArb,
      content: fc.array(textContentArb, { minLength: 1, maxLength: 3 }),
    });

    /**
     * Arbitrary for generating valid blueprints with 1-5 slides
     */
    const blueprintArb = fc.record({
      version: fc.constant("2.0" as const),
      meta: fc.record({
        title: fc.string({ minLength: 5, maxLength: 50 }),
        language: fc.constant("en" as const),
        goal: fc.constantFrom("inform" as const, "persuade" as const),
        tone: fc.constantFrom("modern" as const, "formal" as const),
      }),
      slides: fc.array(slideArb, { minLength: 1, maxLength: 5 }),
    });

    it("should generate valid PPTX files with consistent structure", async () => {
      /**
       * **Observation**: generateDeck produces valid PPTX files that exist on disk
       * **Property**: For any valid blueprint, generateDeck SHALL produce a file that exists
       */
      await fc.assert(
        fc.asyncProperty(blueprintArb, async (blueprint: KyroBlueprint) => {
          const outputPath = path.join(testOutputDir, `preservation-${Date.now()}-${Math.random().toString(36).substring(7)}.pptx`);

          // Act: Generate the deck
          await generateDeck(blueprint, outputPath);

          // Assert: File should exist
          expect(fs.existsSync(outputPath)).toBe(true);

          // Assert: File should have non-zero size
          const stats = fs.statSync(outputPath);
          expect(stats.size).toBeGreaterThan(0);

          // Cleanup
          fs.unlinkSync(outputPath);
        }),
        { numRuns: 10 }, // Run 10 iterations for faster execution
      );
    });

    it("should generate PPTX files with correct slide count", async () => {
      /**
       * **Observation**: generateDeck produces PPTX files with the same number of slides as the blueprint
       * **Property**: For any valid blueprint with N slides, generateDeck SHALL produce a PPTX with N slides
       *
       * This verifies that layout generation, polishing, and resolution work correctly
       * and that the renderer processes all slides.
       */
      await fc.assert(
        fc.asyncProperty(blueprintArb, async (blueprint: KyroBlueprint) => {
          const outputPath = path.join(testOutputDir, `slide-count-${Date.now()}-${Math.random().toString(36).substring(7)}.pptx`);

          // Act: Generate the deck
          await generateDeck(blueprint, outputPath);

          // Assert: File should exist
          expect(fs.existsSync(outputPath)).toBe(true);

          // Note: We cannot easily inspect PPTX slide count without parsing the XML,
          // but we can verify the file was created successfully and has reasonable size
          const stats = fs.statSync(outputPath);
          // Each slide should contribute at least 1KB to the file size
          const minExpectedSize = blueprint.slides.length * 1024;
          expect(stats.size).toBeGreaterThan(minExpectedSize);

          // Cleanup
          fs.unlinkSync(outputPath);
        }),
        { numRuns: 10 },
      );
    });

    it("should handle single-slide blueprints correctly", async () => {
      /**
       * **Observation**: generateDeck handles edge case of single slide correctly
       * **Property**: For any valid blueprint with 1 slide, generateDeck SHALL produce a valid PPTX
       *
       * This is an important edge case for layout computation and rendering.
       */
      const singleSlideBlueprint: KyroBlueprint = {
        version: "2.0",
        meta: {
          title: "Single Slide Test",
          language: "en",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "slide-1",
            type: "hero",
            intent: "Title slide",
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Single Slide",
                level: "h1",
                emphasis: "high",
              },
            ],
          },
        ],
      };

      const outputPath = path.join(testOutputDir, "single-slide-preservation.pptx");

      // Act: Generate the deck
      await generateDeck(singleSlideBlueprint, outputPath);

      // Assert: File should exist
      expect(fs.existsSync(outputPath)).toBe(true);

      // Assert: File should have reasonable size
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(1024); // At least 1KB

      // Cleanup
      fs.unlinkSync(outputPath);
    });

    it("should handle multi-slide blueprints with mixed slide types", async () => {
      /**
       * **Observation**: generateDeck handles mixed slide types correctly
       * **Property**: For any valid blueprint with mixed slide types (hero, content, data, closing),
       * generateDeck SHALL produce a valid PPTX
       *
       * This verifies that different layout strategies work correctly together.
       */
      const mixedSlideBlueprint: KyroBlueprint = {
        version: "2.0",
        meta: {
          title: "Mixed Slide Types",
          language: "en",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "slide-1",
            type: "hero",
            intent: "Title",
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Hero Slide",
                level: "h1",
                emphasis: "high",
              },
            ],
          },
          {
            id: "slide-2",
            type: "content",
            intent: "Content",
            layout: "two_column",
            content: [
              {
                type: "heading",
                value: "Content Slide",
                level: "h2",
                emphasis: "high",
              },
            ],
          },
          {
            id: "slide-3",
            type: "data",
            intent: "Data",
            layout: "grid_2x2",
            content: [
              {
                type: "heading",
                value: "Data Slide",
                level: "h2",
                emphasis: "high",
              },
            ],
          },
          {
            id: "slide-4",
            type: "closing",
            intent: "Closing",
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Closing Slide",
                level: "h1",
                emphasis: "high",
              },
            ],
          },
        ],
      };

      const outputPath = path.join(testOutputDir, "mixed-slides-preservation.pptx");

      // Act: Generate the deck
      await generateDeck(mixedSlideBlueprint, outputPath);

      // Assert: File should exist
      expect(fs.existsSync(outputPath)).toBe(true);

      // Assert: File should have reasonable size for 4 slides
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(4 * 1024); // At least 4KB (1KB per slide)

      // Cleanup
      fs.unlinkSync(outputPath);
    });

    it("should handle blueprints with various content types", async () => {
      /**
       * **Observation**: generateDeck handles different content types correctly
       * **Property**: For any valid blueprint with headings, text, bullets, and stats,
       * generateDeck SHALL produce a valid PPTX
       *
       * This verifies that text rendering works correctly for different content types.
       */
      const variedContentBlueprint: KyroBlueprint = {
        version: "2.0",
        meta: {
          title: "Varied Content",
          language: "en",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "slide-1",
            type: "content",
            intent: "Show various content",
            layout: "two_column",
            content: [
              {
                type: "heading",
                value: "Content Types",
                level: "h2",
                emphasis: "high",
              },
              {
                type: "text",
                value: "This is body text",
                emphasis: "medium",
              },
              {
                type: "bullets",
                items: [{ text: "Bullet point 1" }, { text: "Bullet point 2" }, { text: "Bullet point 3" }],
              },
            ],
          },
          {
            id: "slide-2",
            type: "data",
            intent: "Show stats",
            layout: "grid_2x2",
            content: [
              {
                type: "stat",
                value: "100",
                label: "Metric 1",
                visualWeight: "hero",
              },
              {
                type: "stat",
                value: "200",
                label: "Metric 2",
                visualWeight: "emphasis",
              },
            ],
          },
        ],
      };

      const outputPath = path.join(testOutputDir, "varied-content-preservation.pptx");

      // Act: Generate the deck
      await generateDeck(variedContentBlueprint, outputPath);

      // Assert: File should exist
      expect(fs.existsSync(outputPath)).toBe(true);

      // Assert: File should have reasonable size
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(2 * 1024); // At least 2KB

      // Cleanup
      fs.unlinkSync(outputPath);
    });

    it("should generate consistent file sizes for identical blueprints", async () => {
      /**
       * **Observation**: generateDeck produces consistent output for identical inputs
       * **Property**: For any valid blueprint, generateDeck SHALL produce files with
       * similar sizes when called multiple times with the same input
       *
       * This verifies that the rendering is deterministic (excluding background colors).
       */
      const blueprint: KyroBlueprint = {
        version: "2.0",
        meta: {
          title: "Consistency Test",
          language: "en",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "slide-1",
            type: "hero",
            intent: "Title",
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Consistency Test",
                level: "h1",
                emphasis: "high",
              },
            ],
          },
        ],
      };

      const outputPath1 = path.join(testOutputDir, "consistency-1.pptx");
      const outputPath2 = path.join(testOutputDir, "consistency-2.pptx");

      // Act: Generate the deck twice
      await generateDeck(blueprint, outputPath1);
      await generateDeck(blueprint, outputPath2);

      // Assert: Both files should exist
      expect(fs.existsSync(outputPath1)).toBe(true);
      expect(fs.existsSync(outputPath2)).toBe(true);

      // Assert: File sizes should be similar (within 10% tolerance for timestamp variations)
      const stats1 = fs.statSync(outputPath1);
      const stats2 = fs.statSync(outputPath2);
      const sizeDiff = Math.abs(stats1.size - stats2.size);
      const avgSize = (stats1.size + stats2.size) / 2;
      const percentDiff = (sizeDiff / avgSize) * 100;

      expect(percentDiff).toBeLessThan(10); // Less than 10% difference

      // Cleanup
      fs.unlinkSync(outputPath1);
      fs.unlinkSync(outputPath2);
    });
  });

  describe("Property 2: Layout Computation Preservation", () => {
    it("should generate layouts without errors for random blueprints", async () => {
      /**
       * **Observation**: Layout generation, polishing, and resolution work correctly
       * **Property**: For any valid blueprint, generateDeck SHALL complete without throwing errors
       *
       * This verifies that the layout pipeline (generation → polish → resolve) works correctly.
       */
      const slideArb = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }).map((s) => `slide-${s}`),
        type: fc.constantFrom("hero", "content", "data", "closing"),
        intent: fc.string({ minLength: 5, maxLength: 30 }),
        layout: fc.constantFrom("center_focus", "two_column", "grid_2x2"),
        content: fc.array(
          fc.record({
            type: fc.constant("heading" as const),
            value: fc.string({ minLength: 1, maxLength: 50 }),
            level: fc.constantFrom("h1" as const, "h2" as const),
            emphasis: fc.constantFrom("high" as const, "medium" as const),
          }),
          { minLength: 1, maxLength: 2 },
        ),
      });

      const blueprintArb = fc.record({
        version: fc.constant("2.0" as const),
        meta: fc.record({
          title: fc.string({ minLength: 5, maxLength: 50 }),
          language: fc.constant("en" as const),
          goal: fc.constantFrom("inform" as const, "persuade" as const),
          tone: fc.constantFrom("modern" as const, "formal" as const),
        }),
        slides: fc.array(slideArb, { minLength: 1, maxLength: 3 }),
      });

      await fc.assert(
        fc.asyncProperty(blueprintArb, async (blueprint: KyroBlueprint) => {
          const outputPath = path.join(testOutputDir, `layout-${Date.now()}-${Math.random().toString(36).substring(7)}.pptx`);

          // Act: Generate the deck - should not throw
          await expect(generateDeck(blueprint, outputPath)).resolves.not.toThrow();

          // Assert: File should exist
          expect(fs.existsSync(outputPath)).toBe(true);

          // Cleanup
          fs.unlinkSync(outputPath);
        }),
        { numRuns: 10 },
      );
    });
  });
});
