#!/usr/bin/env node
/**
 * Mode Comparison Tool
 *
 * Generates presentations in both legacy and layered modes,
 * compares outputs, and generates a visual diff report.
 *
 * Usage:
 *   npm run compare-modes -- --schema path/to/schema.json --output report-dir
 *   node scripts/compare-modes.ts --schema path/to/schema.json --output report-dir
 */

import { generateDeck } from "@kyro/core";
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "fs";
import { join, basename, dirname } from "path";
import { execSync } from "child_process";

/**
 * Command line arguments
 */
interface Args {
  schema: string;
  output: string;
  help?: boolean;
}

/**
 * Comparison result
 */
interface ComparisonResult {
  schema: string;
  timestamp: string;
  legacy: {
    outputPath: string;
    fileSize: number;
    generationTime: number;
    success: boolean;
    error?: string;
  };
  layered: {
    outputPath: string;
    fileSize: number;
    generationTime: number;
    success: boolean;
    error?: string;
    performance?: any;
  };
  comparison: {
    fileSizeDiff: number;
    fileSizeDiffPercent: number;
    generationTimeDiff: number;
    generationTimeDiffPercent: number;
  };
}

/**
 * Parse command line arguments
 */
function parseArgs(): Args {
  const args: Partial<Args> = {};

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--schema" || arg === "-s") {
      args.schema = process.argv[++i];
    } else if (arg === "--output" || arg === "-o") {
      args.output = process.argv[++i];
    }
  }

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.schema || !args.output) {
    console.error("Error: --schema and --output are required");
    printHelp();
    process.exit(1);
  }

  return args as Args;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Mode Comparison Tool

Generates presentations in both legacy and layered modes and compares outputs.

Usage:
  npm run compare-modes -- --schema <path> --output <dir>
  node scripts/compare-modes.ts --schema <path> --output <dir>

Options:
  --schema, -s <path>   Path to schema JSON file (required)
  --output, -o <dir>    Output directory for comparison report (required)
  --help, -h            Show this help message

Examples:
  npm run compare-modes -- --schema examples/demo.json --output comparison-report
  node scripts/compare-modes.ts -s schema.json -o report

Output:
  The tool generates:
  - output-legacy.pptx: Presentation generated with legacy mode
  - output-layered.pptx: Presentation generated with layered mode
  - comparison-report.json: Detailed comparison metrics
  - comparison-report.md: Human-readable comparison report
`);
}

/**
 * Load schema from file
 */
function loadSchema(schemaPath: string): any {
  if (!existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const content = readFileSync(schemaPath, "utf-8");
  return JSON.parse(content);
}

/**
 * Generate presentation with specified mode
 */
async function generateWithMode(schema: any, outputPath: string, mode: "legacy" | "layered"): Promise<{ success: boolean; time: number; error?: string; performance?: any }> {
  const startTime = Date.now();

  try {
    await generateDeck(schema, outputPath, { mode });
    const endTime = Date.now();

    return {
      success: true,
      time: endTime - startTime,
    };
  } catch (error: any) {
    const endTime = Date.now();

    return {
      success: false,
      time: endTime - startTime,
      error: error.message,
    };
  }
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath: string): number {
  if (!existsSync(filePath)) {
    return 0;
  }

  const stats = statSync(filePath);
  return stats.size;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format milliseconds to human-readable string
 */
function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Generate comparison report
 */
function generateReport(result: ComparisonResult, outputDir: string): void {
  // JSON report
  const jsonPath = join(outputDir, "comparison-report.json");
  writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  console.log(`\n✓ JSON report saved to: ${jsonPath}`);

  // Markdown report
  const mdPath = join(outputDir, "comparison-report.md");
  const mdContent = generateMarkdownReport(result);
  writeFileSync(mdPath, mdContent);
  console.log(`✓ Markdown report saved to: ${mdPath}`);
}

/**
 * Generate markdown report content
 */
function generateMarkdownReport(result: ComparisonResult): string {
  const { legacy, layered, comparison } = result;

  let md = `# Mode Comparison Report\n\n`;
  md += `**Generated:** ${result.timestamp}\n\n`;
  md += `**Schema:** ${result.schema}\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Legacy Mode | Layered Mode | Difference |\n`;
  md += `|--------|-------------|--------------|------------|\n`;
  md += `| Status | ${legacy.success ? "✓ Success" : "✗ Failed"} | ${layered.success ? "✓ Success" : "✗ Failed"} | - |\n`;
  md += `| Generation Time | ${formatTime(legacy.generationTime)} | ${formatTime(layered.generationTime)} | ${comparison.generationTimeDiff > 0 ? "+" : ""}${formatTime(comparison.generationTimeDiff)} (${comparison.generationTimeDiffPercent > 0 ? "+" : ""}${comparison.generationTimeDiffPercent.toFixed(1)}%) |\n`;
  md += `| File Size | ${formatBytes(legacy.fileSize)} | ${formatBytes(layered.fileSize)} | ${comparison.fileSizeDiff > 0 ? "+" : ""}${formatBytes(comparison.fileSizeDiff)} (${comparison.fileSizeDiffPercent > 0 ? "+" : ""}${comparison.fileSizeDiffPercent.toFixed(1)}%) |\n\n`;

  md += `## Legacy Mode\n\n`;
  md += `- **Output:** ${legacy.outputPath}\n`;
  md += `- **Status:** ${legacy.success ? "Success" : "Failed"}\n`;
  md += `- **Generation Time:** ${formatTime(legacy.generationTime)}\n`;
  md += `- **File Size:** ${formatBytes(legacy.fileSize)}\n`;
  if (legacy.error) {
    md += `- **Error:** ${legacy.error}\n`;
  }
  md += `\n`;

  md += `## Layered Mode\n\n`;
  md += `- **Output:** ${layered.outputPath}\n`;
  md += `- **Status:** ${layered.success ? "Success" : "Failed"}\n`;
  md += `- **Generation Time:** ${formatTime(layered.generationTime)}\n`;
  md += `- **File Size:** ${formatBytes(layered.fileSize)}\n`;
  if (layered.error) {
    md += `- **Error:** ${layered.error}\n`;
  }
  if (layered.performance) {
    md += `\n### Performance Breakdown\n\n`;
    md += `| Phase | Time |\n`;
    md += `|-------|------|\n`;
    for (const [phase, metrics] of Object.entries(layered.performance.phases || {})) {
      const m = metrics as any;
      md += `| ${phase} | ${formatTime(m.totalTime)} |\n`;
    }
  }
  md += `\n`;

  md += `## Analysis\n\n`;

  if (comparison.generationTimeDiff < 0) {
    md += `✓ **Layered mode is faster** by ${formatTime(Math.abs(comparison.generationTimeDiff))} (${Math.abs(comparison.generationTimeDiffPercent).toFixed(1)}%)\n\n`;
  } else if (comparison.generationTimeDiff > 0) {
    md += `⚠ **Layered mode is slower** by ${formatTime(comparison.generationTimeDiff)} (${comparison.generationTimeDiffPercent.toFixed(1)}%)\n\n`;
  } else {
    md += `✓ **Generation times are equal**\n\n`;
  }

  if (comparison.fileSizeDiff < 0) {
    md += `✓ **Layered mode produces smaller files** by ${formatBytes(Math.abs(comparison.fileSizeDiff))} (${Math.abs(comparison.fileSizeDiffPercent).toFixed(1)}%)\n\n`;
  } else if (comparison.fileSizeDiff > 0) {
    md += `⚠ **Layered mode produces larger files** by ${formatBytes(comparison.fileSizeDiff)} (${comparison.fileSizeDiffPercent.toFixed(1)}%)\n\n`;
  } else {
    md += `✓ **File sizes are equal**\n\n`;
  }

  md += `## Recommendations\n\n`;

  if (legacy.success && layered.success) {
    if (comparison.generationTimeDiff <= 0 && comparison.fileSizeDiff <= 0) {
      md += `✓ **Layered mode is ready for production**\n\n`;
      md += `Layered mode performs as well or better than legacy mode in both generation time and file size.\n\n`;
    } else if (comparison.generationTimeDiff > 0 && comparison.generationTimeDiffPercent > 20) {
      md += `⚠ **Performance optimization needed**\n\n`;
      md += `Layered mode is significantly slower. Consider:\n`;
      md += `- Enabling caching (KYRO_ENABLE_CACHING=true)\n`;
      md += `- Profiling the pipeline to identify bottlenecks\n`;
      md += `- Optimizing visual generation algorithms\n\n`;
    } else {
      md += `✓ **Layered mode is acceptable for testing**\n\n`;
      md += `Performance differences are within acceptable range. Continue testing with real-world schemas.\n\n`;
    }
  } else if (!layered.success) {
    md += `✗ **Layered mode failed**\n\n`;
    md += `Fix the error before proceeding with testing:\n`;
    md += `\`\`\`\n${layered.error}\n\`\`\`\n\n`;
  } else if (!legacy.success) {
    md += `✗ **Legacy mode failed**\n\n`;
    md += `This is unexpected. Check the schema and legacy renderer.\n\n`;
  }

  md += `## Next Steps\n\n`;
  md += `1. Review the generated PPTX files manually\n`;
  md += `2. Compare visual quality and layout accuracy\n`;
  md += `3. Test with additional schemas\n`;
  md += `4. Monitor error rates in production\n`;

  return md;
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log("Mode Comparison Tool\n");

  // Parse arguments
  const args = parseArgs();

  // Create output directory
  if (!existsSync(args.output)) {
    mkdirSync(args.output, { recursive: true });
  }

  // Load schema
  console.log(`Loading schema: ${args.schema}`);
  const schema = loadSchema(args.schema);
  console.log(`✓ Schema loaded: ${schema.meta?.title || "Untitled"}, ${schema.slides?.length || 0} slides\n`);

  // Generate with legacy mode
  console.log("Generating with legacy mode...");
  const legacyOutputPath = join(args.output, "output-legacy.pptx");
  const legacyResult = await generateWithMode(schema, legacyOutputPath, "legacy");
  console.log(`✓ Legacy mode: ${legacyResult.success ? "Success" : "Failed"} (${formatTime(legacyResult.time)})`);

  // Generate with layered mode
  console.log("\nGenerating with layered mode...");
  const layeredOutputPath = join(args.output, "output-layered.pptx");
  const layeredResult = await generateWithMode(schema, layeredOutputPath, "layered");
  console.log(`✓ Layered mode: ${layeredResult.success ? "Success" : "Failed"} (${formatTime(layeredResult.time)})`);

  // Get file sizes
  const legacyFileSize = getFileSize(legacyOutputPath);
  const layeredFileSize = getFileSize(layeredOutputPath);

  // Calculate differences
  const fileSizeDiff = layeredFileSize - legacyFileSize;
  const fileSizeDiffPercent = legacyFileSize > 0 ? (fileSizeDiff / legacyFileSize) * 100 : 0;

  const generationTimeDiff = layeredResult.time - legacyResult.time;
  const generationTimeDiffPercent = legacyResult.time > 0 ? (generationTimeDiff / legacyResult.time) * 100 : 0;

  // Build comparison result
  const result: ComparisonResult = {
    schema: args.schema,
    timestamp: new Date().toISOString(),
    legacy: {
      outputPath: legacyOutputPath,
      fileSize: legacyFileSize,
      generationTime: legacyResult.time,
      success: legacyResult.success,
      error: legacyResult.error,
    },
    layered: {
      outputPath: layeredOutputPath,
      fileSize: layeredFileSize,
      generationTime: layeredResult.time,
      success: layeredResult.success,
      error: layeredResult.error,
      performance: layeredResult.performance,
    },
    comparison: {
      fileSizeDiff,
      fileSizeDiffPercent,
      generationTimeDiff,
      generationTimeDiffPercent,
    },
  };

  // Generate reports
  generateReport(result, args.output);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("COMPARISON SUMMARY");
  console.log("=".repeat(60));
  console.log(`Generation Time: ${formatTime(legacyResult.time)} (legacy) vs ${formatTime(layeredResult.time)} (layered)`);
  console.log(`  Difference: ${generationTimeDiff > 0 ? "+" : ""}${formatTime(generationTimeDiff)} (${generationTimeDiff > 0 ? "+" : ""}${generationTimeDiffPercent.toFixed(1)}%)`);
  console.log(`File Size: ${formatBytes(legacyFileSize)} (legacy) vs ${formatBytes(layeredFileSize)} (layered)`);
  console.log(`  Difference: ${fileSizeDiff > 0 ? "+" : ""}${formatBytes(fileSizeDiff)} (${fileSizeDiff > 0 ? "+" : ""}${fileSizeDiffPercent.toFixed(1)}%)`);
  console.log("=".repeat(60) + "\n");

  console.log("✓ Comparison complete!");
  console.log(`\nReview the reports in: ${args.output}`);
}

// Run main function
main().catch((error) => {
  console.error("\n✗ Error:", error.message);
  process.exit(1);
});
