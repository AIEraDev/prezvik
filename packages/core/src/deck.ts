/**
 * Core Deck Generation
 *
 * Orchestrates the full pipeline:
 * Schema → Validation → Layout → Theme → Polish → Rendering
 */

import { resolveLayout, layoutRegistry, polishLayout } from "@kyro/layout";
import { renderPPTXToFile } from "@kyro/renderer-pptx";
import { getTheme, applyThemeToTree } from "@kyro/design";

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
 */
export async function generateDeck(schema: any, outputPath: string = "output.pptx", themeName: string = "executive"): Promise<void> {
  // Get theme
  const theme = getTheme(themeName);

  // Generate layout trees for all slides
  const layouts = schema.slides.map((slide: any) => {
    const strategy = layoutRegistry.get(slide.type);
    if (!strategy) {
      throw new Error(`No layout strategy for slide type: ${slide.type}`);
    }

    // Get layout tree from strategy
    const tree = strategy(slide.content);

    // Apply theme (design tokens)
    const themed = applyThemeToTree(tree, theme);

    // Polish layout (visual quality)
    const polished = polishLayout(themed);

    // Resolve layout (compute _rect for all nodes)
    return resolveLayout(polished);
  });

  // Render to PPTX and save
  await renderPPTXToFile(layouts, outputPath);
}

/**
 * Generate layouts only (for testing/preview)
 */
export function generateLayouts(schema: any, themeName: string = "executive"): any[] {
  const theme = getTheme(themeName);

  return schema.slides.map((slide: any) => {
    const strategy = layoutRegistry.get(slide.type);
    if (!strategy) {
      throw new Error(`No layout strategy for slide type: ${slide.type}`);
    }

    const tree = strategy(slide.content);
    const themed = applyThemeToTree(tree, theme);
    const polished = polishLayout(themed);
    return resolveLayout(polished);
  });
}
