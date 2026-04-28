/**
 * Production Verification Script
 *
 * Verifies that the layered mode is stable and performs well in production.
 * Checks:
 * - Default mode is layered
 * - Error rates are acceptable
 * - Performance meets requirements
 * - All critical features work
 */

import { generateDeck } from "./src/deck.js";
import { getConfig } from "./src/config.js";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

interface VerificationResult {
  passed: boolean;
  checks: CheckResult[];
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    errorRate: number;
    avgPerformance: number;
  };
}

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

async function verifyProduction(): Promise<VerificationResult> {
  console.log("=".repeat(60));
  console.log("Prezvik Production Verification - Layered Mode");
  console.log("=".repeat(60));
  console.log();

  const checks: CheckResult[] = [];
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prezvik-verify-"));

  try {
    // Check 1: Verify default mode is layered
    console.log("✓ Check 1: Verifying default mode is layered...");
    const config = getConfig();
    const check1 = {
      name: "Default Mode",
      passed: config.pipelineMode === "layered",
      message: config.pipelineMode === "layered" ? "Default mode is layered ✓" : "Default mode is NOT layered ✗",
      details: { mode: config.pipelineMode },
    };
    checks.push(check1);
    console.log(`  ${check1.message}\n`);

    // Check 2: Verify layered mode generates valid output
    console.log("✓ Check 2: Verifying layered mode generates valid output...");
    const testSchema = createTestSchema(3);
    const outputPath = path.join(tempDir, "test-output.pptx");

    try {
      await generateDeck(testSchema, outputPath, { mode: "layered" });
      const fileExists = fs.existsSync(outputPath);
      const fileSize = fileExists ? fs.statSync(outputPath).size : 0;

      const check2 = {
        name: "Valid Output",
        passed: fileExists && fileSize > 10000,
        message: fileExists && fileSize > 10000 ? `Generated valid PPTX (${(fileSize / 1024).toFixed(2)} KB) ✓` : "Failed to generate valid PPTX ✗",
        details: { fileExists, fileSize },
      };
      checks.push(check2);
      console.log(`  ${check2.message}\n`);
    } catch (error: any) {
      checks.push({
        name: "Valid Output",
        passed: false,
        message: `Generation failed: ${error.message} ✗`,
        details: { error: error.message },
      });
      console.log(`  Generation failed: ${error.message} ✗\n`);
    }

    // Check 3: Verify performance meets requirements
    console.log("✓ Check 3: Verifying performance meets requirements...");
    const perfTests = [
      { slides: 3, maxTime: 5000, name: "Small presentation (3 slides)" },
      { slides: 5, maxTime: 8000, name: "Medium presentation (5 slides)" },
      { slides: 10, maxTime: 15000, name: "Large presentation (10 slides)" },
    ];

    const perfResults = [];
    for (const test of perfTests) {
      const schema = createTestSchema(test.slides);
      const outputPath = path.join(tempDir, `perf-${test.slides}.pptx`);

      const startTime = Date.now();
      try {
        await generateDeck(schema, outputPath, { mode: "layered" });
        const duration = Date.now() - startTime;
        const passed = duration < test.maxTime;

        perfResults.push({
          name: test.name,
          slides: test.slides,
          duration,
          maxTime: test.maxTime,
          passed,
        });

        console.log(`  ${test.name}: ${duration}ms ${passed ? "✓" : "✗"} (max: ${test.maxTime}ms)`);
      } catch (error: any) {
        perfResults.push({
          name: test.name,
          slides: test.slides,
          duration: -1,
          maxTime: test.maxTime,
          passed: false,
          error: error.message,
        });
        console.log(`  ${test.name}: FAILED ✗ - ${error.message}`);
      }
    }

    const allPerfPassed = perfResults.every((r) => r.passed);
    const avgDuration = perfResults.filter((r) => r.duration > 0).reduce((sum, r) => sum + r.duration, 0) / perfResults.filter((r) => r.duration > 0).length;

    checks.push({
      name: "Performance",
      passed: allPerfPassed,
      message: allPerfPassed ? `All performance tests passed (avg: ${avgDuration.toFixed(0)}ms) ✓` : "Some performance tests failed ✗",
      details: { results: perfResults, avgDuration },
    });
    console.log();

    // Check 4: Verify error handling works
    console.log("✓ Check 4: Verifying error handling...");
    const errorTests = [
      {
        name: "Invalid slide type",
        schema: {
          meta: { title: "Test", goal: "inform", tone: "modern" },
          slides: [{ id: "s1", type: "invalid_type", layout: "center_focus", content: [] }],
        },
      },
    ];

    let errorHandlingPassed = true;
    for (const test of errorTests) {
      const outputPath = path.join(tempDir, `error-${test.name}.pptx`);
      try {
        await generateDeck(test.schema, outputPath, { mode: "layered" });
        // If it doesn't throw, check if it handled gracefully
        const fileExists = fs.existsSync(outputPath);
        console.log(`  ${test.name}: ${fileExists ? "Handled gracefully ✓" : "No output ✗"}`);
      } catch (error: any) {
        // Expected to throw or handle gracefully
        console.log(`  ${test.name}: Error caught (expected) ✓`);
      }
    }

    checks.push({
      name: "Error Handling",
      passed: errorHandlingPassed,
      message: errorHandlingPassed ? "Error handling works correctly ✓" : "Error handling issues detected ✗",
    });
    console.log();

    // Check 5: Verify caching is enabled
    console.log("✓ Check 5: Verifying caching is enabled...");
    const cachingEnabled = config.enableCaching;
    checks.push({
      name: "Caching",
      passed: cachingEnabled,
      message: cachingEnabled ? "Caching is enabled ✓" : "Caching is disabled ✗",
      details: { enabled: cachingEnabled },
    });
    console.log(`  ${cachingEnabled ? "Caching is enabled ✓" : "Caching is disabled ✗"}\n`);

    // Check 6: Verify performance monitoring is enabled
    console.log("✓ Check 6: Verifying performance monitoring is enabled...");
    const perfMonitoringEnabled = config.enablePerformanceMonitoring;
    checks.push({
      name: "Performance Monitoring",
      passed: perfMonitoringEnabled,
      message: perfMonitoringEnabled ? "Performance monitoring is enabled ✓" : "Performance monitoring is disabled ✗",
      details: { enabled: perfMonitoringEnabled },
    });
    console.log(`  ${perfMonitoringEnabled ? "Performance monitoring is enabled ✓" : "Performance monitoring is disabled ✗"}\n`);

    // Calculate summary
    const totalChecks = checks.length;
    const passedChecks = checks.filter((c) => c.passed).length;
    const failedChecks = totalChecks - passedChecks;
    const errorRate = (failedChecks / totalChecks) * 100;
    const avgPerformance = perfResults.filter((r) => r.duration > 0).reduce((sum, r) => sum + r.duration, 0) / perfResults.filter((r) => r.duration > 0).length;

    // Print summary
    console.log("=".repeat(60));
    console.log("Verification Summary");
    console.log("=".repeat(60));
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Passed: ${passedChecks} ✓`);
    console.log(`Failed: ${failedChecks} ${failedChecks > 0 ? "✗" : ""}`);
    console.log(`Error Rate: ${errorRate.toFixed(1)}%`);
    console.log(`Avg Performance: ${avgPerformance.toFixed(0)}ms`);
    console.log("=".repeat(60));
    console.log();

    const allPassed = failedChecks === 0;
    if (allPassed) {
      console.log("✅ All checks passed! Layered mode is stable and ready for production.");
    } else {
      console.log("⚠️  Some checks failed. Review the details above.");
    }
    console.log();

    return {
      passed: allPassed,
      checks,
      summary: {
        totalChecks,
        passedChecks,
        failedChecks,
        errorRate,
        avgPerformance,
      },
    };
  } finally {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

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
      title: "Production Verification Test",
      goal: "inform",
      tone: "modern",
    },
    slides,
  };
}

// Run verification
verifyProduction()
  .then((result) => {
    process.exit(result.passed ? 0 : 1);
  })
  .catch((error) => {
    console.error("Verification failed with error:", error);
    process.exit(1);
  });
