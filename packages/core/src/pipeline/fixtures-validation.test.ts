/**
 * Test Fixtures Validation Tests
 *
 * Tests that validate the test fixtures themselves and demonstrate their usage
 */

import { describe, it, expect } from "vitest";
import { validateBlueprint } from "@prezvik/schema";
import { SAMPLE_PROMPTS, MINIMAL_BLUEPRINT, COMPLEX_BLUEPRINT, INVALID_BLUEPRINTS, EXPECTED_MINIMAL_LAYOUT, EXPECTED_LAYOUT_CHARACTERISTICS, EXPECTED_PPTX_CHARACTERISTICS, TEST_SCENARIOS, PERFORMANCE_BENCHMARKS, ERROR_TEST_CASES, createTestBlueprint, validateLayoutTreeStructure, validatePositionedLayoutTree, validateThemedLayoutTree } from "./test-fixtures.js";

describe("Test Fixtures Validation", () => {
  describe("Sample Prompts", () => {
    it("should have prompts for all presentation types", () => {
      expect(SAMPLE_PROMPTS.pitch).toBeDefined();
      expect(SAMPLE_PROMPTS.report).toBeDefined();
      expect(SAMPLE_PROMPTS.training).toBeDefined();
      expect(SAMPLE_PROMPTS.educational).toBeDefined();
      expect(SAMPLE_PROMPTS.generic).toBeDefined();
      expect(SAMPLE_PROMPTS.edgeCases).toBeDefined();

      // Verify each category has prompts
      expect(SAMPLE_PROMPTS.pitch.length).toBeGreaterThan(0);
      expect(SAMPLE_PROMPTS.report.length).toBeGreaterThan(0);
      expect(SAMPLE_PROMPTS.training.length).toBeGreaterThan(0);
      expect(SAMPLE_PROMPTS.educational.length).toBeGreaterThan(0);
      expect(SAMPLE_PROMPTS.generic.length).toBeGreaterThan(0);
      expect(SAMPLE_PROMPTS.edgeCases.length).toBeGreaterThan(0);
    });

    it("should have valid prompt strings", () => {
      const allPrompts = [...SAMPLE_PROMPTS.pitch, ...SAMPLE_PROMPTS.report, ...SAMPLE_PROMPTS.training, ...SAMPLE_PROMPTS.educational, ...SAMPLE_PROMPTS.generic];

      allPrompts.forEach((prompt) => {
        expect(typeof prompt).toBe("string");
        expect(prompt.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Sample Blueprints", () => {
    it("should have valid minimal Blueprint", () => {
      const result = validateBlueprint(MINIMAL_BLUEPRINT);

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(MINIMAL_BLUEPRINT.version).toBe("2.0");
      expect(MINIMAL_BLUEPRINT.slides).toHaveLength(1);
    });

    it("should have valid complex Blueprint", () => {
      const result = validateBlueprint(COMPLEX_BLUEPRINT);

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(COMPLEX_BLUEPRINT.version).toBe("2.0");
      expect(COMPLEX_BLUEPRINT.slides.length).toBeGreaterThan(1);
    });

    it("should have all content types in complex Blueprint", () => {
      const contentTypes = new Set<string>();

      COMPLEX_BLUEPRINT.slides.forEach((slide) => {
        slide.content.forEach((block) => {
          contentTypes.add(block.type);
        });
      });

      // Should have multiple content types
      expect(contentTypes.has("heading")).toBe(true);
      expect(contentTypes.has("text")).toBe(true);
      expect(contentTypes.has("bullets")).toBe(true);
      expect(contentTypes.has("quote")).toBe(true);
      expect(contentTypes.has("stat")).toBe(true);
      expect(contentTypes.has("code")).toBe(true);
    });

    it("should have all slide types in complex Blueprint", () => {
      const slideTypes = new Set(COMPLEX_BLUEPRINT.slides.map((s) => s.type));

      expect(slideTypes.has("hero")).toBe(true);
      expect(slideTypes.has("section")).toBe(true);
      expect(slideTypes.has("content")).toBe(true);
      expect(slideTypes.has("quote")).toBe(true);
      expect(slideTypes.has("data")).toBe(true);
      expect(slideTypes.has("closing")).toBe(true);
    });
  });

  describe("Invalid Blueprints", () => {
    it("should have invalid Blueprint for missing version", () => {
      const result = validateBlueprint(INVALID_BLUEPRINTS.missingVersion);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some((e) => e.path.includes("version"))).toBe(true);
    });

    it("should have invalid Blueprint for wrong version", () => {
      const result = validateBlueprint(INVALID_BLUEPRINTS.wrongVersion);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should have invalid Blueprint for missing meta", () => {
      const result = validateBlueprint(INVALID_BLUEPRINTS.missingMeta);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should have invalid Blueprint for missing slides", () => {
      const result = validateBlueprint(INVALID_BLUEPRINTS.missingSlides);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should have invalid Blueprint for invalid goal", () => {
      const result = validateBlueprint(INVALID_BLUEPRINTS.invalidGoal);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should have invalid Blueprint for invalid tone", () => {
      const result = validateBlueprint(INVALID_BLUEPRINTS.invalidTone);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should have invalid Blueprint for invalid slide type", () => {
      const result = validateBlueprint(INVALID_BLUEPRINTS.invalidSlideType);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should have invalid Blueprint for invalid layout type", () => {
      const result = validateBlueprint(INVALID_BLUEPRINTS.invalidLayoutType);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should have invalid Blueprint for invalid content block", () => {
      const result = validateBlueprint(INVALID_BLUEPRINTS.invalidContentBlock);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should have invalid Blueprint for missing required fields", () => {
      const result = validateBlueprint(INVALID_BLUEPRINTS.missingRequiredFields);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe("Expected Layout Characteristics", () => {
    it("should define required layout properties", () => {
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.required).toBeDefined();
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.required.hasRoot).toBe(true);
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.required.rootIsContainer).toBe(true);
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.required.rootHasId).toBe(true);
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.required.rootHasType).toBe(true);
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.required.rootHasLayout).toBe(true);
    });

    it("should define layout modes", () => {
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.layoutModes).toContain("flow");
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.layoutModes).toContain("grid");
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.layoutModes).toContain("absolute");
    });

    it("should define node types", () => {
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.nodeTypes).toContain("container");
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.nodeTypes).toContain("text");
    });

    it("should define layout properties for each mode", () => {
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.layoutProperties.flow).toContain("direction");
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.layoutProperties.flow).toContain("gap");
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.layoutProperties.grid).toContain("columns");
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.layoutProperties.grid).toContain("columnGap");
      expect(EXPECTED_LAYOUT_CHARACTERISTICS.layoutProperties.grid).toContain("rowGap");
    });
  });

  describe("Expected PPTX Characteristics", () => {
    it("should define file properties", () => {
      expect(EXPECTED_PPTX_CHARACTERISTICS.file.minSize).toBe(10000);
      expect(EXPECTED_PPTX_CHARACTERISTICS.file.extension).toBe(".pptx");
      expect(EXPECTED_PPTX_CHARACTERISTICS.file.zipSignature).toBe("504b0304");
    });

    it("should define slide properties", () => {
      expect(EXPECTED_PPTX_CHARACTERISTICS.slides.aspectRatio).toBe("16:10");
      expect(EXPECTED_PPTX_CHARACTERISTICS.slides.width).toBe(10);
    });

    it("should define coordinate system", () => {
      expect(EXPECTED_PPTX_CHARACTERISTICS.coordinates.unit).toBe("EMU");
      expect(EXPECTED_PPTX_CHARACTERISTICS.coordinates.emuPerInch).toBe(914400);
      expect(EXPECTED_PPTX_CHARACTERISTICS.coordinates.percentageRange).toEqual([0, 100]);
    });

    it("should define theme properties", () => {
      expect(EXPECTED_PPTX_CHARACTERISTICS.themes.executive).toBeDefined();
      expect(EXPECTED_PPTX_CHARACTERISTICS.themes.minimal).toBeDefined();
      expect(EXPECTED_PPTX_CHARACTERISTICS.themes.modern).toBeDefined();

      expect(EXPECTED_PPTX_CHARACTERISTICS.themes.executive.background).toBe("#FFFFFF");
      expect(EXPECTED_PPTX_CHARACTERISTICS.themes.executive.fontFamily).toBe("Calibri");
    });
  });

  describe("Test Scenarios", () => {
    it("should have multiple test scenarios", () => {
      expect(TEST_SCENARIOS.length).toBeGreaterThan(0);
    });

    it("should have valid scenario structure", () => {
      TEST_SCENARIOS.forEach((scenario) => {
        expect(scenario.name).toBeDefined();
        expect(scenario.prompt).toBeDefined();
        expect(scenario.expectedSlideCount).toBeGreaterThan(0);
        expect(scenario.expectedTheme).toBeDefined();
        expect(scenario.expectedDuration).toBeGreaterThan(0);
      });
    });

    it("should cover different presentation types", () => {
      const scenarioNames = TEST_SCENARIOS.map((s) => s.name.toLowerCase());

      expect(scenarioNames.some((name) => name.includes("pitch"))).toBe(true);
      expect(scenarioNames.some((name) => name.includes("report"))).toBe(true);
      expect(scenarioNames.some((name) => name.includes("training"))).toBe(true);
    });

    it("should cover edge cases", () => {
      const scenarioNames = TEST_SCENARIOS.map((s) => s.name.toLowerCase());

      expect(scenarioNames.some((name) => name.includes("single"))).toBe(true);
      expect(scenarioNames.some((name) => name.includes("large"))).toBe(true);
    });
  });

  describe("Performance Benchmarks", () => {
    it("should define stage benchmarks", () => {
      expect(PERFORMANCE_BENCHMARKS.stages.blueprintGeneration).toBeDefined();
      expect(PERFORMANCE_BENCHMARKS.stages.validation).toBeDefined();
      expect(PERFORMANCE_BENCHMARKS.stages.layoutGeneration).toBeDefined();
      expect(PERFORMANCE_BENCHMARKS.stages.positioning).toBeDefined();
      expect(PERFORMANCE_BENCHMARKS.stages.theming).toBeDefined();
      expect(PERFORMANCE_BENCHMARKS.stages.rendering).toBeDefined();
    });

    it("should define pipeline benchmarks", () => {
      expect(PERFORMANCE_BENCHMARKS.pipeline.mockMode).toBeDefined();
      expect(PERFORMANCE_BENCHMARKS.pipeline.aiMode).toBeDefined();

      expect(PERFORMANCE_BENCHMARKS.pipeline.mockMode.threeSlides).toBeLessThan(PERFORMANCE_BENCHMARKS.pipeline.aiMode.threeSlides);
    });

    it("should have reasonable benchmark values", () => {
      // Mock mode should be fast
      expect(PERFORMANCE_BENCHMARKS.stages.blueprintGeneration.mockMode).toBeLessThan(1000);
      expect(PERFORMANCE_BENCHMARKS.stages.validation).toBeLessThan(1000);

      // Total pipeline should complete in reasonable time
      expect(PERFORMANCE_BENCHMARKS.pipeline.mockMode.fiveSlides).toBeLessThan(15000);
      expect(PERFORMANCE_BENCHMARKS.pipeline.aiMode.fiveSlides).toBeLessThan(30000);
    });
  });

  describe("Error Test Cases", () => {
    it("should have error cases for all stages", () => {
      expect(ERROR_TEST_CASES.blueprintGeneration).toBeDefined();
      expect(ERROR_TEST_CASES.validation).toBeDefined();
      expect(ERROR_TEST_CASES.layout).toBeDefined();
      expect(ERROR_TEST_CASES.positioning).toBeDefined();
      expect(ERROR_TEST_CASES.theming).toBeDefined();
      expect(ERROR_TEST_CASES.rendering).toBeDefined();
    });

    it("should have valid error case structure", () => {
      ERROR_TEST_CASES.blueprintGeneration.forEach((testCase) => {
        expect(testCase.name).toBeDefined();
        expect(testCase.scenario).toBeDefined();
        expect(testCase.expectedError).toBeDefined();
        expect(testCase.expectedMessage).toBeDefined();
      });

      ERROR_TEST_CASES.validation.forEach((testCase) => {
        expect(testCase.name).toBeDefined();
        expect(testCase.blueprint).toBeDefined();
        expect(testCase.expectedError).toBeDefined();
        expect(testCase.expectedMessage).toBeDefined();
      });
    });
  });

  describe("Utility Functions", () => {
    describe("createTestBlueprint", () => {
      it("should create Blueprint with default options", () => {
        const blueprint = createTestBlueprint({});

        expect(blueprint.version).toBe("2.0");
        expect(blueprint.slides).toHaveLength(3);

        const result = validateBlueprint(blueprint);
        expect(result.success).toBe(true);
      });

      it("should create Blueprint with custom slide count", () => {
        const blueprint = createTestBlueprint({ slideCount: 5 });

        expect(blueprint.slides).toHaveLength(5);

        const result = validateBlueprint(blueprint);
        expect(result.success).toBe(true);
      });

      it("should create Blueprint with custom slide types", () => {
        const blueprint = createTestBlueprint({
          slideCount: 3,
          slideTypes: ["hero", "content", "closing"],
        });

        expect(blueprint.slides[0].type).toBe("hero");
        expect(blueprint.slides[1].type).toBe("content");
        expect(blueprint.slides[2].type).toBe("closing");

        const result = validateBlueprint(blueprint);
        expect(result.success).toBe(true);
      });

      it("should create Blueprint with custom theme", () => {
        const blueprint = createTestBlueprint({ theme: "minimal" });

        expect(blueprint.theme?.name).toBe("minimal");

        const result = validateBlueprint(blueprint);
        expect(result.success).toBe(true);
      });
    });

    describe("validateLayoutTreeStructure", () => {
      it("should validate valid layout tree", () => {
        const result = validateLayoutTreeStructure(EXPECTED_MINIMAL_LAYOUT);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should detect missing root", () => {
        const invalidTree = {} as any;

        const result = validateLayoutTreeStructure(invalidTree);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("root"))).toBe(true);
      });

      it("should detect non-container root", () => {
        const invalidTree = {
          root: {
            id: "root",
            type: "text",
            content: "Test",
          },
        } as any;

        const result = validateLayoutTreeStructure(invalidTree);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("container"))).toBe(true);
      });

      it("should detect missing ID", () => {
        const invalidTree = {
          root: {
            type: "container",
            layout: { type: "flow" },
            children: [],
          },
        } as any;

        const result = validateLayoutTreeStructure(invalidTree);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("ID"))).toBe(true);
      });
    });

    describe("validatePositionedLayoutTree", () => {
      it("should validate tree with _rect properties", () => {
        const positionedTree = {
          root: {
            id: "root",
            type: "container",
            layout: { type: "flow" },
            children: [],
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
        } as any;

        const result = validatePositionedLayoutTree(positionedTree);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should detect missing _rect", () => {
        const unpositionedTree = {
          root: {
            id: "root",
            type: "container",
            layout: { type: "flow" },
            children: [],
          },
        } as any;

        const result = validatePositionedLayoutTree(unpositionedTree);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("_rect"))).toBe(true);
      });

      it("should detect invalid coordinates", () => {
        const invalidTree = {
          root: {
            id: "root",
            type: "container",
            layout: { type: "flow" },
            children: [],
            _rect: { x: -10, y: 0, width: 100, height: 100 },
          },
        } as any;

        const result = validatePositionedLayoutTree(invalidTree);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("out of range"))).toBe(true);
      });
    });

    describe("validateThemedLayoutTree", () => {
      it("should validate tree with theme properties", () => {
        const themedTree = {
          root: {
            id: "root",
            type: "container",
            layout: { type: "flow" },
            children: [
              {
                id: "text1",
                type: "text",
                content: "Test",
                text: {
                  fontSize: 16,
                  fontFamily: "Calibri",
                  color: "#000000",
                },
                _rect: { x: 0, y: 0, width: 100, height: 10 },
              },
            ],
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          background: "#FFFFFF",
        } as any;

        const result = validateThemedLayoutTree(themedTree);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should detect missing background", () => {
        const unthemedTree = {
          root: {
            id: "root",
            type: "container",
            layout: { type: "flow" },
            children: [],
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
        } as any;

        const result = validateThemedLayoutTree(unthemedTree);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("background"))).toBe(true);
      });

      it("should detect missing font properties", () => {
        const unthemedTree = {
          root: {
            id: "root",
            type: "container",
            layout: { type: "flow" },
            children: [
              {
                id: "text1",
                type: "text",
                content: "Test",
                text: {
                  fontSize: 16,
                  // Missing fontFamily and color
                },
                _rect: { x: 0, y: 0, width: 100, height: 10 },
              },
            ],
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          background: "#FFFFFF",
        } as any;

        const result = validateThemedLayoutTree(unthemedTree);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("fontFamily"))).toBe(true);
        expect(result.errors.some((e) => e.includes("color"))).toBe(true);
      });
    });
  });
});
