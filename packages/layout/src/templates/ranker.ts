/**
 * Template Ranker
 *
 * Ranks and selects the best templates for specific content.
 *
 * CORE PRINCIPLE:
 * Not all templates are equal. Rank based on:
 * - Content fit (capacity matching)
 * - Layout quality (rules engine score)
 * - Theme compatibility
 * - Historical performance (if available)
 */

import type {
  TemplateVariant,
  ContentProfile,
  TemplateSelectionCriteria,
  TemplateMatch,
  TemplateScore,
} from "./types.js";

/**
 * Template Ranker
 *
 * Ranks templates by quality and content fit
 *
 * @example
 * ```typescript
 * const ranker = new TemplateRanker();
 * const ranked = ranker.rank(templates, contentProfile);
 *
 * // Get top 3 templates
 * const top3 = ranked.slice(0, 3);
 * ```
 */
export class TemplateRanker {
  /**
   * Rank templates for specific content
   *
   * @param templates - Templates to rank
   * @param profile - Content profile
   * @param criteria - Selection criteria
   * @returns Ranked template matches
   */
  rank(
    templates: TemplateVariant[],
    profile: ContentProfile,
    criteria: TemplateSelectionCriteria = {}
  ): TemplateMatch[] {
    const matches: TemplateMatch[] = [];

    for (const template of templates) {
      // Skip if doesn't meet minimum quality
      if (criteria.minQualityScore && (template.qualityScore || 0) < criteria.minQualityScore) {
        continue;
      }

      // Check content capacity
      const totalItems =
        profile.textBlocks +
        profile.bulletLists +
        profile.dataPoints +
        (profile.hasQuote ? 1 : 0) +
        (profile.hasCTA ? 1 : 0);

      if (totalItems < template.minItems || totalItems > template.maxItems) {
        continue;
      }

      // Check media requirement
      if (criteria.preferMediaSupport && profile.mediaCount > 0 && !template.supportsMedia) {
        continue;
      }

      // Calculate match score
      const score = this.calculateMatchScore(template, profile, criteria);

      // Generate reasoning
      const reasoning = this.generateReasoning(template, score, profile);

      matches.push({
        template,
        score,
        rank: 0, // Set after sorting
        reasoning,
      });
    }

    // Sort by overall score descending
    matches.sort((a, b) => b.score.overall - a.score.overall);

    // Assign ranks
    matches.forEach((match, index) => {
      match.rank = index + 1;
    });

    return matches;
  }

  /**
   * Select the single best template
   *
   * @param templates - Available templates
   * @param profile - Content profile
   * @returns Best matching template or null
   */
  selectBest(
    templates: TemplateVariant[],
    profile: ContentProfile
  ): TemplateMatch | null {
    const ranked = this.rank(templates, profile);
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
  selectTop(
    templates: TemplateVariant[],
    profile: ContentProfile,
    n: number
  ): TemplateMatch[] {
    const ranked = this.rank(templates, profile);
    return ranked.slice(0, n);
  }

  /**
   * Calculate match score breakdown
   */
  private calculateMatchScore(
    template: TemplateVariant,
    profile: ContentProfile,
    criteria: TemplateSelectionCriteria
  ): TemplateScore {
    // Content fit score (0-100)
    const contentFit = this.calculateContentFit(template, profile);

    // Layout quality score (from validation)
    const layoutQuality = template.qualityScore || 70;

    // Theme fit score (0-100)
    const themeFit = this.calculateThemeFit(template, criteria);

    // Performance score (0-100, based on complexity)
    const performance = this.calculatePerformanceScore(template);

    // Weighted overall score
    const overall = Math.round(
      contentFit * 0.4 +
      layoutQuality * 0.3 +
      themeFit * 0.2 +
      performance * 0.1
    );

    return {
      overall,
      contentFit,
      layoutQuality,
      themeFit,
      performance,
    };
  }

  /**
   * Calculate how well template fits content
   */
  private calculateContentFit(
    template: TemplateVariant,
    profile: ContentProfile
  ): number {
    const scores: number[] = [];

    // Item count fit
    const totalItems =
      profile.textBlocks +
      profile.bulletLists +
      profile.dataPoints +
      (profile.hasQuote ? 1 : 0) +
      (profile.hasCTA ? 1 : 0);

    const itemRange = template.maxItems - template.minItems;
    const itemPosition = totalItems - template.minItems;
    const itemFit = itemRange > 0 ? (itemPosition / itemRange) * 100 : 100;
    scores.push(Math.max(0, Math.min(100, itemFit)));

    // Media fit
    if (profile.mediaCount > 0) {
      scores.push(template.supportsMedia ? 100 : 0);
    }

    // Data fit
    if (profile.dataPoints > 0) {
      scores.push(template.supportsData ? 100 : 50);
    }

    // Quote fit
    if (profile.hasQuote) {
      // Quote works best with center_focus or hero_overlay
      const quoteFriendly = ["center_focus", "hero_overlay"].includes(
        template.baseLayout
      );
      scores.push(quoteFriendly ? 100 : 60);
    }

    // Density preference match
    if (profile.contentWeight > 1000 && template.density === "high") {
      scores.push(100); // Good match for dense content
    } else if (profile.contentWeight < 200 && template.density === "minimal") {
      scores.push(100); // Good match for sparse content
    }

    // Average the scores
    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 70;
  }

  /**
   * Calculate theme compatibility
   */
  private calculateThemeFit(
    template: TemplateVariant,
    criteria: TemplateSelectionCriteria
  ): number {
    // If no theme specified, neutral score
    if (!criteria.themeCompatible) {
      return 80;
    }

    // Check theme compatibility based on emphasis and spacing
    let score = 80;

    // Premium themes work better with airy spacing
    if (
      criteria.themeCompatible.includes("luxury") &&
      template.spacing === "airy"
    ) {
      score += 15;
    }

    // Minimal themes work better with balanced/tight spacing
    if (
      criteria.themeCompatible.includes("minimal") &&
      template.spacing !== "airy"
    ) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate performance score (render speed)
 */
  private calculatePerformanceScore(template: TemplateVariant): number {
    // Simple complexity-based scoring
    let score = 100;

    // Penalize high-density templates (more to render)
    if (template.density === "maximal") score -= 15;
    if (template.density === "high") score -= 10;

    // Penalize complex layouts
    if (template.baseLayout === "timeline") score -= 5;
    if (template.baseLayout === "grid_2x2") score -= 5;

    // Bonus for simple layouts
    if (template.baseLayout === "center_focus") score += 5;

    return Math.max(50, score);
  }

  /**
   * Generate human-readable reasoning for selection
   */
  private generateReasoning(
    template: TemplateVariant,
    score: TemplateScore,
    profile: ContentProfile
  ): string[] {
    const reasoning: string[] = [];

    if (score.contentFit >= 90) {
      reasoning.push("Excellent content capacity match");
    } else if (score.contentFit >= 70) {
      reasoning.push("Good content fit");
    }

    if (template.supportsMedia && profile.mediaCount > 0) {
      reasoning.push(`Supports ${profile.mediaCount} media elements`);
    }

    if (template.supportsData && profile.dataPoints > 0) {
      reasoning.push("Optimal for data presentation");
    }

    if (score.layoutQuality >= 80) {
      reasoning.push("High layout quality score");
    }

    if (template.spacing === "airy") {
      reasoning.push("Premium spacious feel");
    }

    if (template.emphasis === "text" && profile.contentWeight > 500) {
      reasoning.push("Text-optimized for readability");
    }

    return reasoning;
  }

  /**
   * Get quick recommendations for content
   *
   * @param profile - Content profile
   * @returns Recommended template configurations
   */
  getRecommendations(profile: ContentProfile): Array<{
    baseLayout: string;
    reason: string;
  }> {
    const recommendations: Array<{ baseLayout: string; reason: string }> = [];

    if (profile.mediaCount === 1) {
      recommendations.push({
        baseLayout: "split_screen",
        reason: "Perfect for single image with supporting text",
      });
    }

    if (profile.mediaCount > 2) {
      recommendations.push({
        baseLayout: "grid_2x2",
        reason: "Grid layout showcases multiple images effectively",
      });
    }

    if (profile.dataPoints >= 3) {
      recommendations.push({
        baseLayout: "stat_highlight",
        reason: "Purpose-built for metrics and data points",
      });
    }

    if (profile.contentWeight < 200 && profile.hasQuote) {
      recommendations.push({
        baseLayout: "center_focus",
        reason: "Minimal layout emphasizes the quote",
      });
    }

    if (profile.bulletLists >= 2) {
      recommendations.push({
        baseLayout: "two_column",
        reason: "Columns organize multiple lists clearly",
      });
    }

    return recommendations;
  }
}
