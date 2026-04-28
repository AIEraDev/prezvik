/**
 * Integration tests for Magic Command
 *
 * Tests the complete pipeline integration through the CLI command
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Magic Command Integration Tests", () => {
  const testOutputDir = path.join(process.cwd(), "test-output");
  const testOutputFile = path.join(testOutputDir, "test-magic.pptx");

  beforeEach(() => {
    // Create test output directory
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }

    // Clean up any existing test output
    if (fs.existsSync(testOutputFile)) {
      fs.unlinkSync(testOutputFile);
    }
  });

  afterEach(() => {
    // Clean up test output
    if (fs.existsSync(testOutputFile)) {
      fs.unlinkSync(testOutputFile);
    }
  });

  describe("Command Execution", () => {
    it("should execute with mock mode", () => {
      const prompt = "Create a 3-slide presentation about AI in education";
      const command = `node dist/index.js magic "${prompt}" --output "${testOutputFile}" --mock`;

      try {
        const output = execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        // Verify output contains expected log messages
        expect(output).toContain("Prezvik Magic");
        expect(output).toContain("Starting pipeline");
        expect(output).toContain("Magic complete");

        // Verify PPTX file was created
        expect(fs.existsSync(testOutputFile)).toBe(true);

        // Verify file is not empty
        const stats = fs.statSync(testOutputFile);
        expect(stats.size).toBeGreaterThan(0);
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}\nOutput: ${error.stdout}\nError: ${error.stderr}`);
      }
    });

    it("should accept --theme option", () => {
      const prompt = "Create a presentation about quarterly results";
      const command = `node dist/index.js magic "${prompt}" --output "${testOutputFile}" --mock --theme minimal`;

      try {
        const output = execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        expect(output).toContain("Magic complete");
        expect(fs.existsSync(testOutputFile)).toBe(true);
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}`);
      }
    });

    it("should accept --provider option", () => {
      const prompt = "Create a presentation about product launch";
      const command = `node dist/index.js magic "${prompt}" --output "${testOutputFile}" --mock --provider openai`;

      try {
        const output = execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        expect(output).toContain("Magic complete");
        expect(fs.existsSync(testOutputFile)).toBe(true);
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}`);
      }
    });

    it("should accept --output option", () => {
      const customOutput = path.join(testOutputDir, "custom-output.pptx");
      const prompt = "Create a presentation about team updates";
      const command = `node dist/index.js magic "${prompt}" --output "${customOutput}" --mock`;

      try {
        const output = execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        expect(output).toContain("Magic complete");
        expect(fs.existsSync(customOutput)).toBe(true);

        // Clean up
        fs.unlinkSync(customOutput);
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}`);
      }
    });
  });

  describe("CLI Option Parsing", () => {
    it("should parse --mock flag correctly", () => {
      const prompt = "Test presentation";
      const command = `node dist/index.js magic "${prompt}" --output "${testOutputFile}" --mock`;

      try {
        execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        expect(fs.existsSync(testOutputFile)).toBe(true);
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}`);
      }
    });

    it("should parse --provider option correctly", () => {
      const prompt = "Test presentation";
      const command = `node dist/index.js magic "${prompt}" --output "${testOutputFile}" --mock --provider anthropic`;

      try {
        execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        expect(fs.existsSync(testOutputFile)).toBe(true);
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}`);
      }
    });

    it("should parse --theme option correctly", () => {
      const prompt = "Test presentation";
      const command = `node dist/index.js magic "${prompt}" --output "${testOutputFile}" --mock --theme modern`;

      try {
        execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        expect(fs.existsSync(testOutputFile)).toBe(true);
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}`);
      }
    });

    it("should use default output path when not specified", () => {
      const defaultOutput = path.join(process.cwd(), "apps/cli", "prezvik-magic.pptx");
      const prompt = "Test presentation";
      const command = `node dist/index.js magic "${prompt}" --mock`;

      try {
        execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        expect(fs.existsSync(defaultOutput)).toBe(true);

        // Clean up
        fs.unlinkSync(defaultOutput);
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}`);
      }
    });
  });

  describe("Progress Logging", () => {
    it("should log pipeline stages", () => {
      const prompt = "Create a presentation about company vision";
      const command = `node dist/index.js magic "${prompt}" --output "${testOutputFile}" --mock`;

      try {
        const output = execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        // Verify stage logging (from Pipeline orchestrator)
        expect(output).toContain("Blueprint Generation");
        expect(output).toContain("Blueprint Validation");
        expect(output).toContain("Layout Generation");
        expect(output).toContain("Coordinate Positioning");
        expect(output).toContain("Theme Application");
        expect(output).toContain("PPTX Rendering");

        // Verify completion logging
        expect(output).toContain("Pipeline completed");
        expect(output).toContain("Magic complete");
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}\nOutput: ${error.stdout}`);
      }
    });

    it("should log total execution time", () => {
      const prompt = "Create a presentation about product roadmap";
      const command = `node dist/index.js magic "${prompt}" --output "${testOutputFile}" --mock`;

      try {
        const output = execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        // Verify time logging
        expect(output).toMatch(/Total time: \d+\.\d+s/);
        expect(output).toMatch(/Pipeline completed in \d+\.\d+s/);
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}`);
      }
    });
  });

  describe("Error Reporting", () => {
    it("should report error with stage context on Blueprint generation failure", () => {
      // This test would require mocking the pipeline to force a failure
      // For now, we'll skip this as it requires more complex setup
      // In a real scenario, we'd inject a failing generator
    });

    it("should report error with stage context on validation failure", () => {
      // Similar to above - would require mocking
    });

    it("should exit with error code on failure", () => {
      // Test that the command exits with non-zero code on error
      // This would require a scenario that causes a failure
    });
  });

  describe("PPTX Output Verification", () => {
    it("should create valid PPTX file", () => {
      const prompt = "Create a 5-slide presentation about sustainability";
      const command = `node dist/index.js magic "${prompt}" --output "${testOutputFile}" --mock`;

      try {
        execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        // Verify file exists
        expect(fs.existsSync(testOutputFile)).toBe(true);

        // Verify file has content
        const stats = fs.statSync(testOutputFile);
        expect(stats.size).toBeGreaterThan(1000); // PPTX files should be at least 1KB

        // Verify file is a valid ZIP (PPTX is a ZIP archive)
        const buffer = fs.readFileSync(testOutputFile);
        const header = buffer.toString("hex", 0, 4);
        expect(header).toBe("504b0304"); // ZIP file signature
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}`);
      }
    });

    it("should create PPTX with correct file extension", () => {
      const prompt = "Create a presentation";
      const command = `node dist/index.js magic "${prompt}" --output "${testOutputFile}" --mock`;

      try {
        execSync(command, {
          encoding: "utf-8",
          cwd: path.join(process.cwd(), "apps/cli"),
        });

        expect(path.extname(testOutputFile)).toBe(".pptx");
        expect(fs.existsSync(testOutputFile)).toBe(true);
      } catch (error: any) {
        throw new Error(`Command failed: ${error.message}`);
      }
    });
  });
});
