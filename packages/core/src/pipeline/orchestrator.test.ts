/**
 * Pipeline Orchestrator Integration Tests
 *
 * Tests the complete pipeline from prompt to PPTX
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Pipeline, type PipelineOptions } from "./orchestrator.js";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Pipeline Orchestrator", () => {
  let pipeline: Pipeline;
  let testOutputDir: string;

  beforeEach(() => {
    pipeline = new Pipeline();
    testOutputDir = path.join(process.cwd(), "test-output");

    // Create test output directory
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test output files
    if (fs.existsSync(testOutputDir)) {
      const files = fs.readdirSync(testOutputDir);
      for (const file of files) {
        const filePath = path.join(testOutputDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          fs.unlinkSync(filePath);
        }
      }
      // Don't remove the directory itself as it may contain subdirectories from other tests
    }
  });

  describe("Mock Mode (No API Key Required)", () => {
    it("should execute complete pipeline with mock mode", async () => {
      const outputPath = path.join(testOutputDir, "test-mock.pptx");
      const options: PipelineOptions = {
        outputPath,
        themeName: "executive",
        mockMode: true,
      };

      await pipeline.execute("Create a 3-slide presentation about AI in education", options);

      // Verify output file exists
      expect(fs.existsSync(outputPath)).toBe(true);

      // Verify file size is reasonable (> 10KB)
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(10000);
    });

    it("should handle different presentation types in mock mode", async () => {
      const testCases = [
        { prompt: "Create a pitch deck for a SaaS startup with 5 slides", type: "pitch" },
        { prompt: "Generate a report on Q4 sales performance", type: "report" },
        { prompt: "Build a training deck on cybersecurity best practices", type: "training" },
      ];

      for (const testCase of testCases) {
        const outputPath = path.join(testOutputDir, `test-${testCase.type}.pptx`);
        const options: PipelineOptions = {
          outputPath,
          mockMode: true,
        };

        await pipeline.execute(testCase.prompt, options);

        // Verify output file exists
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });

    it("should apply different themes", async () => {
      const themes = ["executive", "minimal", "modern"];

      for (const theme of themes) {
        const outputPath = path.join(testOutputDir, `test-${theme}.pptx`);
        const options: PipelineOptions = {
          outputPath,
          themeName: theme,
          mockMode: true,
        };

        await pipeline.execute("Create a 3-slide presentation about AI", options);

        // Verify output file exists
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid output path", async () => {
      const options: PipelineOptions = {
        outputPath: "/invalid/path/that/does/not/exist/test.pptx",
        mockMode: true,
      };

      await expect(pipeline.execute("Create a presentation", options)).rejects.toThrow();
    });

    it("should handle empty prompt", async () => {
      const outputPath = path.join(testOutputDir, "test-empty.pptx");
      const options: PipelineOptions = {
        outputPath,
        mockMode: true,
      };

      // Empty prompt should still generate a valid presentation
      await pipeline.execute("", options);

      // Verify output file exists
      expect(fs.existsSync(outputPath)).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should complete pipeline in under 30 seconds for 5-slide deck", async () => {
      const outputPath = path.join(testOutputDir, "test-performance.pptx");
      const options: PipelineOptions = {
        outputPath,
        mockMode: true,
      };

      const startTime = Date.now();
      await pipeline.execute("Create a 5-slide presentation about machine learning", options);
      const duration = Date.now() - startTime;

      // Verify completion time
      expect(duration).toBeLessThan(30000); // 30 seconds

      // Verify output file exists
      expect(fs.existsSync(outputPath)).toBe(true);
    }, 35000); // Set test timeout to 35 seconds
  });
});
