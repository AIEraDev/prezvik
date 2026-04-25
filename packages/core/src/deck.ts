/**
 * Core Deck Generation
 *
 * Orchestrates the full pipeline:
 * Schema → Validation → Layout → Theme → Polish → Rendering
 */

import { resolveLayout, layoutRegistry, polishLayout } from "@kyro/layout";
import { renderPPTXToFile } from "@kyro/renderer-pptx";
import { ThemeAgent } from "@kyro/design";
import { PipelineController, CacheManager, PerformanceMonitor, type PipelineMode, type LayoutTree } from "@kyro/pipeline";
import { ThemeLayerFacadeImpl, ColorPaletteGenerator, GradientGenerator, BlendModeEngine } from "@kyro/theme-layer";
import { VisualLayerFacade } from "@kyro/visual-layer";
import { ExportLayerFacade } from "@kyro/export-layer";
import { getPipelineMode } from "./config.js";

/**
 * Generate a PowerPoint deck from schema
 *
 * Full pipeline:
 * 1. Validate schema (TODO: integrate schema validation)
 * 2. Generate layouts for each slide
 * 3. Apply theme (design tokens)
 * 4. Polish layout (hierarchy, rhythm, balance, whitespace)
 * 5. Resolve layout (compute _rect for all nodes)
 * 6. Render to PPTX
 * 7. Save to file
 *
 * @param schema - Presentation schema
 * @param outputPath - Output file path
 * @param options - Generation options including rendering mode
 */
export async function generateDeck(schema: any, outputPath: string = "output.pptx", options: GenerateDeckOptions = {}): Promise<void> {
  const mode = getPipelineMode(options.mode);
  console.log(`\n  [generateDeck] ========== START (${mode} mode) ==========`);
  console.log(`  [generateDeck] Schema: ${schema.meta?.title || "Untitled"}, Slides: ${schema.slides?.length || 0}`);

  if (mode === "layered") {
    await generateDeckLayered(schema, outputPath);
  } else {
    await generateDeckLegacy(schema, outputPath);
  }

  console.log("  [generateDeck] ========== END ==========\n");
}

/**
 * Options for generateDeck function
 */
export interface GenerateDeckOptions {
  /**
   * Rendering mode
   * - 'legacy': Use current monolithic rendering (DEPRECATED - will be removed in v2.0)
   * - 'layered': Use new three-layer architecture (Theme → Visual → Export) (default)
   */
  mode?: PipelineMode;
}

/**
 * Generate deck using legacy rendering mode
 * (Current monolithic approach)
 *
 * @deprecated Legacy mode is deprecated and will be removed in v2.0.
 * Please migrate to layered mode for improved performance and features.
 * See migration guide: https://github.com/kyro/kyro/docs/migration-guide.md
 */
async function generateDeckLegacy(schema: any, outputPath: string): Promise<void> {
  console.warn("\n⚠️  WARNING: Legacy rendering mode is DEPRECATED and will be removed in v2.0");
  console.warn("⚠️  Please migrate to layered mode by setting mode: 'layered' or KYRO_PIPELINE_MODE=layered");
  console.warn("⚠️  Migration guide: https://github.com/kyro/kyro/docs/migration-guide.md\n");

  console.log("  [generateDeck] Using legacy rendering mode");

  // Instantiate ThemeAgent
  const themeAgent = new ThemeAgent();

  // Generate ThemeSpec
  console.log(`  [generateDeck] Generating theme...`);
  const themeSpec = await themeAgent.generateTheme(schema, { fallbackTheme: "executive" });
  console.log(`  [generateDeck] Theme generated: ${themeSpec.palette.primary}`);

  // Generate layout trees for all slides
  console.log(`  [generateDeck] Generating layouts for ${schema.slides.length} slides...`);
  const layouts = schema.slides.map((slide: any, index: number) => {
    console.log(`    [Slide ${index + 1}] type: ${slide.type}, layout: ${slide.layout}`);

    const strategy = layoutRegistry.get(slide.type);
    if (!strategy) {
      console.error(`    [Slide ${index + 1}] ERROR: No layout strategy for type: ${slide.type}`);
      throw new Error(`No layout strategy for slide type: ${slide.type}`);
    }
    console.log(`    [Slide ${index + 1}] Using strategy: ${slide.type}`);

    // Get layout tree from strategy
    console.log(`    [Slide ${index + 1}] Building layout tree...`);
    const tree = strategy(slide);
    console.log(`    [Slide ${index + 1}] Tree built: ${tree.root?.type || "unknown root"}`);

    // Apply theme (design tokens)

    // Polish layout (visual quality)
    console.log(`    [Slide ${index + 1}] Polishing layout...`);
    const polished = polishLayout(tree);
    console.log(`    [Slide ${index + 1}] Layout polished`);

    // Resolve layout (compute _rect for all nodes)
    console.log(`    [Slide ${index + 1}] Resolving layout (computing rects)...`);
    const resolved = resolveLayout(polished);
    console.log(`    [Slide ${index + 1}] Layout resolved, root rect:`, resolved.root?._rect);

    return resolved;
  });
  console.log(`  [generateDeck] All ${layouts.length} layouts generated successfully`);

  // Render to PPTX and save
  console.log(`  [generateDeck] Rendering to PPTX at: ${outputPath}`);
  try {
    await renderPPTXToFile(layouts, outputPath, themeSpec);
    console.log(`  [generateDeck] PPTX saved successfully`);
  } catch (renderError) {
    console.error(`  [generateDeck] RENDER ERROR:`, renderError);
    throw renderError;
  }
}

/**
 * Generate deck using layered rendering mode
 * (New three-layer architecture: Theme → Visual → Export)
 */
async function generateDeckLayered(schema: any, outputPath: string): Promise<void> {
  console.log("  [generateDeck] Using layered rendering mode");

  // Instantiate ThemeAgent
  const themeAgent = new ThemeAgent();

  // Generate ThemeSpec
  console.log(`  [generateDeck] Generating theme...`);
  const themeSpec = await themeAgent.generateTheme(schema, { fallbackTheme: "executive" });
  console.log(`  [generateDeck] Theme generated: ${themeSpec.palette.primary}`);

  // Generate layout trees for all slides
  console.log(`  [generateDeck] Generating layouts for ${schema.slides.length} slides...`);
  const layoutTrees: LayoutTree[] = schema.slides.map((slide: any, index: number) => {
    console.log(`    [Slide ${index + 1}] type: ${slide.type}, layout: ${slide.layout}`);

    const strategy = layoutRegistry.get(slide.type);
    if (!strategy) {
      console.error(`    [Slide ${index + 1}] ERROR: No layout strategy for type: ${slide.type}`);
      throw new Error(`No layout strategy for slide type: ${slide.type}`);
    }
    console.log(`    [Slide ${index + 1}] Using strategy: ${slide.type}`);

    // Get layout tree from strategy
    console.log(`    [Slide ${index + 1}] Building layout tree...`);
    const tree = strategy(slide);
    console.log(`    [Slide ${index + 1}] Tree built: ${tree.root?.type || "unknown root"}`);

    // Polish layout (visual quality)
    console.log(`    [Slide ${index + 1}] Polishing layout...`);
    const polished = polishLayout(tree);
    console.log(`    [Slide ${index + 1}] Layout polished`);

    // Resolve layout (compute _rect for all nodes)
    console.log(`    [Slide ${index + 1}] Resolving layout (computing rects)...`);
    const resolved = resolveLayout(polished);
    console.log(`    [Slide ${index + 1}] Layout resolved, root rect:`, resolved.root?._rect);

    // Convert to LayoutTree format expected by pipeline
    return {
      root: resolved.root,
      metadata: {
        slideId: slide.id || `slide-${index + 1}`,
        slideType: slide.type,
      },
    };
  });
  console.log(`  [generateDeck] All ${layoutTrees.length} layouts generated successfully`);

  // Convert ThemeSpec from @kyro/design to pipeline format
  // Add default tone if not present
  const pipelineThemeSpec = {
    ...themeSpec,
    tone: "executive" as const, // Default tone for now
  };

  // Instantiate layer facades
  console.log(`  [generateDeck] Initializing layered pipeline...`);

  // Create Theme Layer components
  const colorPaletteGenerator = new ColorPaletteGenerator();
  const gradientGenerator = new GradientGenerator();
  const blendModeEngine = new BlendModeEngine();
  const themeLayerFacade = new ThemeLayerFacadeImpl(colorPaletteGenerator, gradientGenerator, blendModeEngine);

  // Create Visual Layer facade
  const visualLayerFacade = new VisualLayerFacade();

  // Create Export Layer facade
  const exportLayerFacade = new ExportLayerFacade();

  // Create pipeline utilities
  const cacheManager = new CacheManager();
  const performanceMonitor = new PerformanceMonitor();

  // Create pipeline controller
  const pipeline = new PipelineController(themeLayerFacade, visualLayerFacade, exportLayerFacade, cacheManager, performanceMonitor);

  // Execute pipeline
  console.log(`  [generateDeck] Executing layered pipeline...`);
  try {
    const result = await pipeline.execute(layoutTrees, pipelineThemeSpec, "pptx", {
      renderOptions: { outputPath },
    });

    if (!result.success) {
      throw new Error(`Pipeline execution failed: ${result.error?.message}`);
    }

    console.log(`  [generateDeck] Pipeline completed successfully`);
    console.log(`  [generateDeck] Performance report:`, JSON.stringify(result.performance, null, 2));
    console.log(`  [generateDeck] Total time: ${result.totalTime}ms`);
    console.log(`  [generateDeck] Output saved to: ${result.outputPath}`);
  } catch (pipelineError) {
    console.error(`  [generateDeck] PIPELINE ERROR:`, pipelineError);
    throw pipelineError;
  }
}

/**
 * Generate layouts only (for testing/preview)
 */
export function generateLayouts(schema: any): any[] {
  return schema.slides.map((slide: any) => {
    const strategy = layoutRegistry.get(slide.type);
    if (!strategy) {
      throw new Error(`No layout strategy for slide type: ${slide.type}`);
    }

    const tree = strategy(slide.content);
    const polished = polishLayout(tree);
    return resolveLayout(polished);
  });
}
