/**
 * Template Agent
 *
 * AI-powered template generation and selection system.
 *
 * CORE PRINCIPLE:
 * Infinite template generation constrained by layout rules.
 *
 * Pipeline:
 * 1. Content Analysis → Determine requirements
 * 2. Template Generation → Create variations
 * 3. Validation → Filter by layout rules
 * 4. Ranking → Score by content fit
 * 5. Selection → Pick best template
 *
 * Output: Validated, ranked templates ready for rendering
 */

import type { TemplateVariant, TemplateGenerationOptions, ContentProfile, TemplateSelectionCriteria, TemplateMatch, GenerationResult } from "./types.js";
import { TemplateGenerator } from "./generator.js";
import { TemplateValidator } from "./validator.js";
import { TemplateRanker } from "./ranker.js";

/**
 * Template Agent Configuration
 */
export interface AgentConfig {
  /** Maximum templates to generate */
  maxTemplates: number;
  /** Minimum quality threshold */
  minQualityScore: number;
  /** Enable template caching */
  enableCache: boolean;
  /** Include experimental layouts */
  includeExperimental: boolean;
}

/**
 * Default agent configuration
 */
const DEFAULT_CONFIG: AgentConfig = {
  maxTemplates: 50,
  minQualityScore: 60,
  enableCache: true,
  includeExperimental: false,
};

/**
 * Template Agent
 *
 * Main entry point for AI template generation
 *
 * @example
 * ```typescript
 * const agent = new TemplateAgent();
 *
 * // Generate templates for content
 * const result = agent.generateForContent({
 *   textBlocks: 2,
 *   bulletLists: 1,
 *   dataPoints: 3,
 *   mediaCount: 1,
 *   hasQuote: false,
 *   hasCTA: true,
 *   contentWeight: 500
 * });
 *
 * // Get best template
 * const best = agent.selectBest(result.templates, contentProfile);
 * console.log(`Selected: ${best.template.id}`);
 * ```
 */
export class TemplateAgent {
  private generator: TemplateGenerator;
  private validator: TemplateValidator;
  private ranker: TemplateRanker;
  private config: AgentConfig;
  private templateCache: Map<string, TemplateVariant>;

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.generator = new TemplateGenerator();
    this.validator = new TemplateValidator();
    this.ranker = new TemplateRanker();
    this.templateCache = new Map();
  }

  /**
   * Generate templates for specific content
   *
   * Complete pipeline: Generate → Validate → Cache
   *
   * @param profile - Content profile
   * @param options - Generation options
   * @returns Generation result with validated templates
   */
  generateForContent(profile: ContentProfile, options: Partial<TemplateGenerationOptions> = {}): GenerationResult {
    // Check cache first
    const cacheKey = this.generateCacheKey(profile, options);
    if (this.config.enableCache && this.templateCache.has(cacheKey)) {
      const cached = this.templateCache.get(cacheKey)!;
      return {
        templates: [cached],
        validatedCount: 1,
        duration: 0,
        combinationsExplored: 0,
      };
    }

    const start = performance.now();

    // Step 1: Generate templates
    const generationOptions: TemplateGenerationOptions = {
      itemCount: profile.textBlocks + profile.bulletLists + profile.dataPoints + (profile.hasQuote ? 1 : 0) + (profile.hasCTA ? 1 : 0),
      hasMedia: profile.mediaCount > 0,
      hasData: profile.dataPoints > 0,
      hasQuotes: profile.hasQuote,
      maxTemplates: this.config.maxTemplates,
      includeExperimental: this.config.includeExperimental,
      ...options,
    };

    const result = this.generator.generate(generationOptions);

    // Step 2: Validate templates
    const validTemplates = this.validator.filterValid(result.templates);
    result.validatedCount = validTemplates.length;

    // Step 3: Cache top template
    if (this.config.enableCache && validTemplates.length > 0) {
      this.templateCache.set(cacheKey, validTemplates[0]);
    }

    result.duration = performance.now() - start;

    return result;
  }

  /**
   * Select best template for content
   *
   * @param templates - Available templates
   * @param profile - Content profile
   * @param criteria - Selection criteria
   * @returns Best matching template or null
   */
  selectBest(templates: TemplateVariant[], profile: ContentProfile, criteria: TemplateSelectionCriteria = {}): TemplateMatch | null {
    // Merge with agent config
    const mergedCriteria: TemplateSelectionCriteria = {
      minQualityScore: this.config.minQualityScore,
      ...criteria,
    };

    // Rank with criteria, then return best
    const ranked = this.ranker.rank(templates, profile, mergedCriteria);
    return ranked.length > 0 ? ranked[0] : null;
  }

  /**
   * Select top N templates
   *
   * @param templates - Available templates
   * @param profile - Content profile
   * @param n - Number to select
   * @returns Top N matches
   */
  selectTop(templates: TemplateVariant[], profile: ContentProfile, n: number): TemplateMatch[] {
    return this.ranker.selectTop(templates, profile, n);
  }

  /**
   * Rank all templates for content
   *
   * @param templates - Templates to rank
   * @param profile - Content profile
   * @returns All templates ranked
   */
  rankAll(templates: TemplateVariant[], profile: ContentProfile): TemplateMatch[] {
    return this.ranker.rank(templates, profile, {
      minQualityScore: this.config.minQualityScore,
    });
  }

  /**
   * Quick template selection (one-shot)
   *
   * Combines generation and selection in one call
   *
   * @param profile - Content profile
   * @param options - Generation options
   * @returns Best template or null
   */
  quickSelect(profile: ContentProfile, options: Partial<TemplateGenerationOptions> = {}): TemplateMatch | null {
    const result = this.generateForContent(profile, options);

    if (result.templates.length === 0) {
      return null;
    }

    return this.selectBest(result.templates, profile);
  }

  /**
   * Get total template possibilities
   *
   * @returns Number of possible template combinations
   */
  getPossibilityCount(): number {
    return this.generator.getPossibilityCount();
  }

  /**
   * Get template recommendations for content
   *
   * @param profile - Content profile
   * @returns Recommended layouts with reasons
   */
  getRecommendations(profile: ContentProfile): Array<{ baseLayout: string; reason: string }> {
    return this.ranker.getRecommendations(profile);
  }

  /**
   * Invalidate cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.templateCache.size,
      keys: Array.from(this.templateCache.keys()),
    };
  }

  /**
   * Update agent configuration
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Generate cache key from content profile and options
   */
  private generateCacheKey(profile: ContentProfile, options: Partial<TemplateGenerationOptions>): string {
    const parts = [profile.textBlocks, profile.bulletLists, profile.dataPoints, profile.mediaCount, profile.hasQuote ? "1" : "0", profile.hasCTA ? "1" : "0", options.contentType || "generic"];
    return parts.join("-");
  }

  /**
   * Pre-warm cache with common content profiles
   *
   * Generates templates for common scenarios to speed up selection
   */
  prewarmCache(): void {
    const commonProfiles: ContentProfile[] = [
      // Title slide
      {
        textBlocks: 2,
        bulletLists: 0,
        dataPoints: 0,
        mediaCount: 0,
        hasQuote: false,
        hasCTA: false,
        contentWeight: 100,
      },
      // Content slide
      {
        textBlocks: 1,
        bulletLists: 1,
        dataPoints: 0,
        mediaCount: 0,
        hasQuote: false,
        hasCTA: false,
        contentWeight: 300,
      },
      // Metrics slide
      {
        textBlocks: 1,
        bulletLists: 0,
        dataPoints: 3,
        mediaCount: 0,
        hasQuote: false,
        hasCTA: false,
        contentWeight: 150,
      },
      // Hero slide
      {
        textBlocks: 2,
        bulletLists: 0,
        dataPoints: 0,
        mediaCount: 1,
        hasQuote: false,
        hasCTA: true,
        contentWeight: 200,
      },
    ];

    for (const profile of commonProfiles) {
      this.generateForContent(profile);
    }
  }
}

/**
 * Create a pre-configured Template Agent
 *
 * @param preset - Preset configuration
 * @returns Configured agent
 */
export function createTemplateAgent(preset: "fast" | "quality" | "experimental" = "quality"): TemplateAgent {
  const configs: Record<string, Partial<AgentConfig>> = {
    fast: {
      maxTemplates: 20,
      minQualityScore: 50,
      enableCache: true,
      includeExperimental: false,
    },
    quality: {
      maxTemplates: 100,
      minQualityScore: 70,
      enableCache: true,
      includeExperimental: false,
    },
    experimental: {
      maxTemplates: 200,
      minQualityScore: 60,
      enableCache: true,
      includeExperimental: true,
    },
  };

  return new TemplateAgent(configs[preset]);
}
