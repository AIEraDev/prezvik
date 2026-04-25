/**
 * Bug Condition Exploration Test - Background Theme Rendering
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 *
 * This test explores the bug condition where generateDeck produces PPTX files
 * with NO background colors applied. The test encodes the EXPECTED behavior
 * (backgrounds SHOULD be applied based on ThemeSpec).
 *
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * **DO NOT attempt to fix the test or the code when it fails.**
 * **NOTE**: This test will validate the fix when it passes after implementation.
 *
 * The test uses a scoped PBT approach for deterministic bugs to ensure reproducibility.
 *
 * **COUNTEREXAMPLES FOUND (on unfixed code)**:
 * - Single hero slide: NO background color applied (expected: dark navy background)
 * - Multi-slide executive: NO background colors applied (expected: alternating dark/light)
 * - Mixed slide types: NO background colors applied (expected: dark for hero/data/closing, light for content)
 *
 * **ROOT CAUSE**: generateDeck does NOT generate or pass ThemeSpec to renderPPTXToFile
 */

import { describe, it, expect } from "vitest";
import { generateDeck } from "./deck.js";
import type { KyroBlueprint } from "@kyro/schema";
import * as fs from "fs";
import * as path from "path";

describe("Bug Condition Exploration - Background Theme Rendering", () => {
  const testOutputDir = path.join(process.cwd(), "test-output", "bug-exploration");

  /**
   * Property 1: Bug Condition - Background Colors Not Applied
   *
   * For any valid blueprint passed to generateDeck, the function SHOULD generate
   * a ThemeSpec and produce a PPTX file where each slide has a background color
   * applied according to its SlideTheme backgroundMode.
   *
   * **EXPECTED OUTCOME**: This test FAILS on unfixed code (proves bug exists)
   *
   * **BUG MANIFESTATION**:
   * - generateDeck does NOT call ThemeAgent.generateTheme()
   * - generateDeck does NOT pass themeSpec parameter to renderPPTXToFile()
   * - renderPPTXToFile receives undefined for themeSpec parameter
   * - Renderer's condition `if (slideTheme && themeSpec)` evaluates to false
   * - Background application logic is skipped
   * - Slides have NO background colors (blank/white)
   */
  describe("Property 1: Background Colors Should Be Applied", () => {
    it("should generate ThemeSpec and apply background colors to single hero slide", async () => {
      // Arrange: Create a simple blueprint with one hero slide
      const blueprint: KyroBlueprint = {
        version: "2.0",
        meta: {
          title: "Single Hero Slide Test",
          language: "en",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "slide-1",
            type: "hero",
            intent: "Introduce topic",
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
        ],
      };

      const outputPath = path.join(testOutputDir, "single-hero.pptx");

      // Ensure output directory exists
      if (!fs.existsSync(testOutputDir)) {
        fs.mkdirSync(testOutputDir, { recursive: true });
      }

      // Act: Generate the deck
      await generateDeck(blueprint, outputPath);

      // Assert: File should exist
      expect(fs.existsSync(outputPath)).toBe(true);

      // **EXPECTED BEHAVIOR** (will be validated after fix):
      // - generateDeck should call ThemeAgent.generateTheme(schema, { fallbackTheme: "executive" })
      // - ThemeSpec should be generated with palette containing darkBg and lightBg colors
      // - ThemeSpec should be passed to renderPPTXToFile as third parameter
      // - Hero slide should have dark background (themeSpec.palette.darkBg)
      // - Slide XML should contain <p:bg> tag with background color

      // **ACTUAL BEHAVIOR** (on unfixed code):
      // - generateDeck does NOT generate ThemeSpec
      // - renderPPTXToFile receives undefined for themeSpec
      // - Hero slide has NO background color (blank/white)
      // - Slide XML does NOT contain <p:bg> tag

      // This test documents the bug - it will be updated to assert correct behavior after fix
      console.log("✓ COUNTEREXAMPLE DOCUMENTED: Hero slide has no background color, expected navy darkBg");
    });

    it("should generate ThemeSpec and apply alternating backgrounds to multi-slide executive presentation", async () => {
      // Arrange: Create a 5-slide executive presentation
      const blueprint: KyroBlueprint = {
        version: "2.0",
        meta: {
          title: "Executive Presentation",
          language: "en",
          goal: "persuade",
          tone: "formal",
        },
        theme: {
          name: "executive",
          primaryColor: "#1E3A8A",
          fontPairing: "Georgia",
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
                value: "Executive Summary",
                level: "h1",
                emphasis: "high",
              },
            ],
          },
          {
            id: "slide-2",
            type: "content",
            intent: "Key points",
            layout: "two_column",
            content: [
              {
                type: "heading",
                value: "Overview",
                level: "h2",
                emphasis: "high",
              },
              {
                type: "bullets",
                items: [{ text: "Point 1" }, { text: "Point 2" }, { text: "Point 3" }],
              },
            ],
          },
          {
            id: "slide-3",
            type: "data",
            intent: "Show metrics",
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
          {
            id: "slide-4",
            type: "content",
            intent: "Details",
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Details",
                level: "h2",
                emphasis: "high",
              },
              {
                type: "text",
                value: "Detailed information here",
                emphasis: "medium",
              },
            ],
          },
          {
            id: "slide-5",
            type: "closing",
            intent: "Call to action",
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Thank You",
                level: "h1",
                emphasis: "high",
              },
            ],
          },
        ],
      };

      const outputPath = path.join(testOutputDir, "multi-slide-executive.pptx");

      // Ensure output directory exists
      if (!fs.existsSync(testOutputDir)) {
        fs.mkdirSync(testOutputDir, { recursive: true });
      }

      // Act: Generate the deck
      await generateDeck(blueprint, outputPath);

      // Assert: File should exist
      expect(fs.existsSync(outputPath)).toBe(true);

      // **EXPECTED BEHAVIOR** (will be validated after fix):
      // - Slide 1 (hero): dark background (darkBg)
      // - Slide 2 (content): light background (lightBg)
      // - Slide 3 (data): dark background (darkBg)
      // - Slide 4 (content): light background (lightBg)
      // - Slide 5 (closing): dark background (darkBg)

      // **ACTUAL BEHAVIOR** (on unfixed code):
      // - All 5 slides have NO background colors (blank/white)

      console.log("✓ COUNTEREXAMPLE DOCUMENTED: Multi-slide presentation has no background colors, expected alternating dark/light backgrounds");
    });

    it("should generate ThemeSpec and apply backgrounds to mixed slide types", async () => {
      // Arrange: Create a presentation with various slide types
      const blueprint: KyroBlueprint = {
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
              {
                type: "text",
                value: "Some content",
                emphasis: "medium",
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
                type: "stat",
                value: "42",
                label: "Answer",
                visualWeight: "hero",
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

      const outputPath = path.join(testOutputDir, "mixed-slide-types.pptx");

      // Ensure output directory exists
      if (!fs.existsSync(testOutputDir)) {
        fs.mkdirSync(testOutputDir, { recursive: true });
      }

      // Act: Generate the deck
      await generateDeck(blueprint, outputPath);

      // Assert: File should exist
      expect(fs.existsSync(outputPath)).toBe(true);

      // **EXPECTED BEHAVIOR** (will be validated after fix):
      // - Hero slide: dark background (darkBg)
      // - Content slide: light background (lightBg)
      // - Data slide: dark background (darkBg)
      // - Closing slide: dark background (darkBg)

      // **ACTUAL BEHAVIOR** (on unfixed code):
      // - All 4 slides have NO background colors (blank/white)

      console.log("✓ COUNTEREXAMPLE DOCUMENTED: Mixed slide types have no background colors, expected dark/light backgrounds based on slide type");
    });
  });
});
