/**
 * Template Generator
 *
 * Generates template variations from primitive combinations.
 *
 * CORE PRINCIPLE:
 * Combinatorial generation: 7 layouts × 5 densities × 4 emphases
 * × 6 media strategies × 3 spacings = 2,000+ combinations
 *
 * Filtered by:
 * 1. Valid layout-media combinations
 * 2. Content capacity matching
 * 3. Layout Rules validation
 */

import type { TemplateVariant, TemplateConfig, TemplateGenerationOptions, ContentProfile, GenerationResult, BaseLayout } from "./types.js";
import { BASE_LAYOUTS, DENSITY_LEVELS, VISUAL_EMPHASIS, MEDIA_STRATEGIES, SPACING_SYSTEMS, calculateContentCapacity, isValidTemplateConfig, generateTemplateId, SPACING_MULTIPLIERS } from "./primitives.js";

/**
 * Template Generator
 *
 * Generates infinite template variations constrained by rules
 *
 * @example
 * ```typescript
 * const generator = new TemplateGenerator();
 * const result = generator.generate({
 *   itemCount: 5,
 *   hasMedia: true,
 *   hasData: false
 * });
 *
 * console.log(`Generated ${result.templates.length} templates`);
 * ```
 */
export class TemplateGenerator {
  /**
   * Generate templates matching content requirements
   *
   * @param options - Generation options
   * @returns Generation result with templates
   */
  generate(options: TemplateGenerationOptions): GenerationResult {
    const start = performance.now();
    const templates: TemplateVariant[] = [];
    let combinationsExplored = 0;

    // Determine target capacity
    const targetCapacity = options.itemCount;

    // Generate all valid combinations
    for (const baseLayout of BASE_LAYOUTS) {
      // Skip if layout not in preferred list
      if (options.preferredLayouts && !options.preferredLayouts.includes(baseLayout)) {
        continue;
      }

      for (const density of DENSITY_LEVELS) {
        const capacity = calculateContentCapacity(baseLayout, density);

        // Skip if capacity doesn't match content
        if (targetCapacity < capacity.min || targetCapacity > capacity.max) {
          continue;
        }

        for (const mediaStrategy of MEDIA_STRATEGIES) {
          // Skip invalid layout-media combinations
          if (!isValidTemplateConfig(baseLayout, mediaStrategy)) {
            continue;
          }

          // Skip if content has no media but template requires it
          if (!options.hasMedia && mediaStrategy !== "none") {
            // Allow some non-none strategies even without media
            // (media can be added later or is optional)
          }

          for (const emphasis of VISUAL_EMPHASIS) {
            // Match emphasis to content
            if (options.hasData && emphasis !== "data" && emphasis !== "balanced") {
              // Data-heavy content should use data or balanced emphasis
              // But don't skip entirely - give option
            }

            for (const spacing of SPACING_SYSTEMS) {
              combinationsExplored++;

              const template = this.createTemplateVariant({
                baseLayout,
                density,
                emphasis,
                mediaStrategy,
                spacing,
              });

              templates.push(template);

              // Respect maxTemplates limit
              if (options.maxTemplates && templates.length >= options.maxTemplates) {
                break;
              }
            }

            if (options.maxTemplates && templates.length >= options.maxTemplates) {
              break;
            }
          }

          if (options.maxTemplates && templates.length >= options.maxTemplates) {
            break;
          }
        }

        if (options.maxTemplates && templates.length >= options.maxTemplates) {
          break;
        }
      }

      if (options.maxTemplates && templates.length >= options.maxTemplates) {
        break;
      }
    }

    const duration = performance.now() - start;

    return {
      templates,
      validatedCount: 0, // Set by validator
      duration,
      combinationsExplored,
    };
  }

  /**
   * Generate templates optimized for specific content
   *
   * Uses content analysis to pre-filter optimal templates
   */
  generateForContent(profile: ContentProfile, options: Partial<TemplateGenerationOptions> = {}): GenerationResult {
    const itemCount = profile.textBlocks + profile.bulletLists + profile.dataPoints + (profile.hasQuote ? 1 : 0) + (profile.hasCTA ? 1 : 0);

    const hasMedia = profile.mediaCount > 0;
    const hasData = profile.dataPoints > 0;

    // Determine preferred layouts based on content
    const preferredLayouts = this.determinePreferredLayouts(profile);

    return this.generate({
      itemCount,
      hasMedia,
      hasData,
      hasQuotes: profile.hasQuote,
      contentType: options.contentType || "generic",
      preferredLayouts,
      maxTemplates: options.maxTemplates || 50,
    });
  }

  /**
   * Create a template variant from configuration
   */
  private createTemplateVariant(config: TemplateConfig): TemplateVariant {
    const capacity = calculateContentCapacity(config.baseLayout, config.density);

    return {
      id: generateTemplateId(config.baseLayout, config.density, config.emphasis, config.mediaStrategy, config.spacing),
      baseLayout: config.baseLayout,
      density: config.density,
      emphasis: config.emphasis,
      mediaStrategy: config.mediaStrategy,
      spacing: config.spacing,
      minItems: capacity.min,
      maxItems: capacity.max,
      supportsMedia: config.mediaStrategy !== "none",
      supportsData: ["stat_highlight", "grid_2x2", "three_column"].includes(config.baseLayout),
      styleTokens: {
        paddingMultiplier: SPACING_MULTIPLIERS[config.spacing],
        gapMultiplier: SPACING_MULTIPLIERS[config.spacing],
        fontScale: this.calculateFontScale(config.density, config.emphasis),
      },
      layoutRules: config.baseLayout,
    };
  }

  /**
   * Determine preferred layouts for content profile
   */
  private determinePreferredLayouts(profile: ContentProfile): BaseLayout[] {
    const layouts: BaseLayout[] = [];

    // Media-heavy content
    if (profile.mediaCount > 1) {
      layouts.push("grid_2x2", "hero_overlay", "image_dominant");
    } else if (profile.mediaCount === 1) {
      layouts.push("split_screen", "hero_overlay", "image_dominant");
    }

    // Data-heavy content
    if (profile.dataPoints >= 3) {
      layouts.push("stat_highlight", "grid_2x2");
    } else if (profile.dataPoints > 0) {
      layouts.push("two_column", "three_column");
    }

    // Text-heavy content
    if (profile.contentWeight > 500) {
      layouts.push("two_column", "three_column", "timeline");
    }

    // Quote/testimonial
    if (profile.hasQuote) {
      layouts.push("center_focus", "hero_overlay");
    }

    // Default fallback
    if (layouts.length === 0) {
      layouts.push("center_focus", "two_column");
    }

    return layouts;
  }

  /**
   * Calculate font scale based on density and emphasis
   */
  private calculateFontScale(density: string, emphasis: string): number {
    let scale = 1.0;

    // Density adjustment
    if (density === "minimal") scale *= 1.3;
    if (density === "low") scale *= 1.15;
    if (density === "high") scale *= 0.9;
    if (density === "maximal") scale *= 0.8;

    // Emphasis adjustment
    if (emphasis === "text") scale *= 1.1;
    if (emphasis === "data") scale *= 1.05;

    return Math.max(0.7, Math.min(1.5, scale));
  }

  /**
   * Get total number of possible template combinations
   */
  getPossibilityCount(): number {
    let count = 0;
    for (const layout of BASE_LAYOUTS) {
      for (const media of MEDIA_STRATEGIES) {
        if (isValidTemplateConfig(layout, media)) {
          count += DENSITY_LEVELS.length * VISUAL_EMPHASIS.length * SPACING_SYSTEMS.length;
        }
      }
    }
    return count;
  }
}
