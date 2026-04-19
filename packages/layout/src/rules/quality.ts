/**
 * Layout Quality Scorer
 *
 * Calculates overall quality scores from layout analysis results.
 *
 * CORE PRINCIPLE:
 * Layouts should be scored across multiple dimensions to
 * provide actionable quality metrics for template ranking.
 *
 * Dimensions:
 * - Spatial: Collision-free, proper positioning
 * - Balance: Whitespace distribution
 * - Hierarchy: Visual hierarchy clarity
 * - Readability: Font sizes, spacing
 * - Aesthetic: Overall visual appeal (composite)
 */

import type { LayoutTree, TextNode, ContainerNode } from "../types.js";
import type {
  QualityScore,
  QualityDimensions,
  CollisionReport,
  WhitespaceBalance,
  HierarchyCheck,
} from "./types.js";

/**
 * Quality Scorer
 *
 * Calculates comprehensive quality metrics for layouts
 *
 * @example
 * ```typescript
 * const scorer = new QualityScorer();
 * const score = scorer.calculate(tree, {
 *   collisions: collisionReport,
 *   whitespace: whitespaceBalance,
 *   hierarchy: hierarchyCheck
 * });
 *
 * console.log(`Rating: ${score.rating} (${score.overall}/100)`);
 * ```
 */
export class QualityScorer {
  /** Default dimension weights (sum should be 1.0) */
  private readonly DEFAULT_WEIGHTS = {
    spatial: 0.30,
    balance: 0.25,
    hierarchy: 0.25,
    readability: 0.15,
    aesthetic: 0.05,
  };

  /** Weights for each dimension */
  private weights: QualityDimensions;

  constructor(customWeights?: Partial<QualityDimensions>) {
    this.weights = { ...this.DEFAULT_WEIGHTS, ...customWeights };
  }

  /**
   * Calculate quality score from analysis results
   *
   * @param tree - Layout tree
   * @param analysis - Analysis results from other engines
   * @returns Complete quality score
   */
  calculate(
    tree: LayoutTree,
    analysis: {
      collisions: CollisionReport;
      whitespace: WhitespaceBalance;
      hierarchy: HierarchyCheck;
    }
  ): QualityScore {
    // Calculate individual dimension scores
    const spatial = this.calculateSpatialScore(analysis.collisions);
    const balance = analysis.whitespace.score;
    const hierarchy = analysis.hierarchy.score;
    const readability = this.calculateReadabilityScore(tree);
    const aesthetic = this.calculateAestheticScore(
      balance,
      hierarchy,
      analysis.whitespace
    );

    const dimensions: QualityDimensions = {
      spatial,
      balance,
      hierarchy,
      readability,
      aesthetic,
    };

    // Calculate weighted overall score
    const overall = Math.round(
      dimensions.spatial * this.weights.spatial +
        dimensions.balance * this.weights.balance +
        dimensions.hierarchy * this.weights.hierarchy +
        dimensions.readability * this.weights.readability +
        dimensions.aesthetic * this.weights.aesthetic
    );

    // Determine rating
    const rating = this.determineRating(overall, analysis.collisions.hasCollisions);

    return {
      overall,
      dimensions,
      weights: this.weights,
      rating,
    };
  }

  /**
   * Calculate spatial score from collision report
   */
  private calculateSpatialScore(collisions: CollisionReport): number {
    if (!collisions.hasCollisions) {
      return 100;
    }

    // Penalize based on collision severity
    const collisionCount = collisions.collisions.length;
    const overlapArea = collisions.totalOverlapArea;

    // Severe penalty for any collisions
    let score = 100 - collisionCount * 20;

    // Additional penalty for large overlaps
    score -= Math.min(overlapArea * 2, 40);

    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate readability score
   */
  private calculateReadabilityScore(tree: LayoutTree): number {
    const textNodes = this.extractTextNodes(tree.root);

    if (textNodes.length === 0) {
      return 100; // No text to read
    }

    let totalScore = 0;

    for (const node of textNodes) {
      const fontSize = node.text.fontSize || 16;
      let nodeScore = 100;

      // Penalize very small fonts
      if (fontSize < 10) {
        nodeScore = 20;
      } else if (fontSize < 12) {
        nodeScore = 50;
      } else if (fontSize < 14) {
        nodeScore = 75;
      }

      // Bonus for good line spacing
      const lineSpacing = node.text.lineSpacingMultiple || 1.2;
      if (lineSpacing >= 1.3 && lineSpacing <= 1.6) {
        nodeScore += 10;
      } else if (lineSpacing < 1.1) {
        nodeScore -= 10;
      }

      totalScore += Math.min(100, nodeScore);
    }

    return Math.round(totalScore / textNodes.length);
  }

  /**
   * Calculate aesthetic score (composite of other factors)
   */
  private calculateAestheticScore(
    balance: number,
    hierarchy: number,
    whitespace: WhitespaceBalance
  ): number {
    // Aesthetic is a combination of balance, hierarchy, and ideal whitespace
    const idealWhitespace =
      whitespace.whitespaceRatio >= 0.2 && whitespace.whitespaceRatio <= 0.4
        ? 100
        : 50;

    const quadrantBalance =
      100 -
      Math.max(
        Math.abs(whitespace.quadrantDistribution.topLeft - 25),
        Math.abs(whitespace.quadrantDistribution.topRight - 25),
        Math.abs(whitespace.quadrantDistribution.bottomLeft - 25),
        Math.abs(whitespace.quadrantDistribution.bottomRight - 25)
      ) *
        2;

    return Math.round((balance + hierarchy + idealWhitespace + quadrantBalance) / 4);
  }

  /**
   * Determine overall rating from score
   */
  private determineRating(
    score: number,
    hasCollisions: boolean
  ): "excellent" | "good" | "acceptable" | "poor" | "unusable" {
    // Collisions make layout unusable regardless of score
    if (hasCollisions && score < 50) {
      return "unusable";
    }

    if (score >= 90) return "excellent";
    if (score >= 75) return "good";
    if (score >= 60) return "acceptable";
    if (score >= 40) return "poor";
    return "unusable";
  }

  /**
   * Extract all text nodes from a layout tree
   */
  private extractTextNodes(node: LayoutTree["root"]): TextNode[] {
    const nodes: TextNode[] = [];

    const traverse = (n: LayoutTree["root"]) => {
      if (n.type === "text") {
        nodes.push(n as TextNode);
      }

      if (n.type === "container" && "children" in n) {
        const container = n as ContainerNode;
        container.children.forEach(traverse);
      }
    };

    traverse(node);
    return nodes;
  }

  /**
   * Generate improvement suggestions based on quality score
   *
   * @param score - Quality score result
   * @returns Array of improvement suggestions
   */
  generateSuggestions(score: QualityScore): string[] {
    const suggestions: string[] = [];

    if (score.dimensions.spatial < 80) {
      suggestions.push("Fix overlapping elements");
    }

    if (score.dimensions.balance < 70) {
      if (score.dimensions.balance < 40) {
        suggestions.push("Layout is too dense - remove some content or split into multiple slides");
      } else {
        suggestions.push("Improve whitespace balance - distribute content more evenly");
      }
    }

    if (score.dimensions.hierarchy < 70) {
      suggestions.push("Strengthen visual hierarchy - use more distinct font sizes");
    }

    if (score.dimensions.readability < 70) {
      suggestions.push("Increase font sizes for better readability");
    }

    return suggestions;
  }
}
