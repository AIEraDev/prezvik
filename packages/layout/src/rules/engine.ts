/**
 * Layout Rules Engine v1
 *
 * Main entry point for layout validation and quality scoring.
 *
 * CORE PRINCIPLE:
 * Validates positioned layouts against spatial constraints
 * and assigns quality scores for template ranking.
 *
 * Pipeline:
 * 1. Collision Detection (nodes must not overlap)
 * 2. Whitespace Analysis (balanced distribution)
 * 3. Hierarchy Check (clear visual hierarchy)
 * 4. Quality Scoring (composite metrics)
 */

import type { LayoutTree, LayoutNode } from "../types.js";
import type { LayoutValidationResult, CorrectionPlan } from "./types.js";
import { CollisionDetector } from "./collision.js";
import { WhitespaceAnalyzer } from "./whitespace.js";
import { HierarchyChecker } from "./hierarchy.js";
import { QualityScorer } from "./quality.js";

/**
 * Layout Rules Engine
 *
 * Validates layouts and calculates quality scores
 *
 * @example
 * ```typescript
 * const engine = new LayoutRulesEngine();
 * const result = engine.validate(tree);
 *
 * if (result.valid) {
 *   console.log(`Quality: ${result.qualityScore.rating}`);
 * } else {
 *   console.log('Violations:', result.violations);
 * }
 * ```
 */
export class LayoutRulesEngine {
  private collisionDetector: CollisionDetector;
  private whitespaceAnalyzer: WhitespaceAnalyzer;
  private hierarchyChecker: HierarchyChecker;
  private qualityScorer: QualityScorer;

  constructor() {
    this.collisionDetector = new CollisionDetector();
    this.whitespaceAnalyzer = new WhitespaceAnalyzer();
    this.hierarchyChecker = new HierarchyChecker();
    this.qualityScorer = new QualityScorer();
  }

  /**
   * Validate a layout tree
   *
   * Performs complete validation including:
   * - Collision detection
   * - Whitespace balance analysis
   * - Visual hierarchy check
   * - Quality scoring
   *
   * @param tree - Layout tree to validate
   * @returns Complete validation result
   */
  validate(tree: LayoutTree): LayoutValidationResult {
    const start = performance.now();

    // Run all checks
    const collisions = this.collisionDetector.detect(tree.root);
    const whitespace = this.whitespaceAnalyzer.analyze(tree.root);
    const hierarchy = this.hierarchyChecker.check(tree.root);
    const qualityScore = this.qualityScorer.calculate(tree, {
      collisions,
      whitespace,
      hierarchy,
    });

    // Collect all violations
    const violations = [
      ...this.collisionDetector.generateViolations(collisions),
      ...this.whitespaceAnalyzer.generateViolations(whitespace),
      ...this.hierarchyChecker.generateViolations(hierarchy),
    ];

    // Count checked nodes
    const nodesChecked = this.countNodes(tree.root);

    const duration = performance.now() - start;

    // Valid if no errors (warnings are acceptable)
    const hasErrors = violations.some((v) => v.severity === "error");
    const valid = !hasErrors && !collisions.hasCollisions;

    return {
      valid,
      qualityScore,
      violations,
      collisions,
      whitespace,
      hierarchy,
      performance: {
        duration,
        nodesChecked,
      },
    };
  }

  /**
   * Validate multiple layout trees
   *
   * @param trees - Array of layout trees
   * @returns Array of validation results
   */
  validateAll(trees: LayoutTree[]): LayoutValidationResult[] {
    return trees.map((tree) => this.validate(tree));
  }

  /**
   * Rank layouts by quality score
   *
   * @param trees - Layout trees to rank
   * @returns Trees sorted by quality (highest first)
   */
  rankLayouts(trees: LayoutTree[]): Array<{
    tree: LayoutTree;
    result: LayoutValidationResult;
    rank: number;
  }> {
    const results = trees.map((tree) => ({
      tree,
      result: this.validate(tree),
    }));

    // Sort by quality score descending
    results.sort((a, b) => {
      // First by validity
      if (a.result.valid !== b.result.valid) {
        return a.result.valid ? -1 : 1;
      }
      // Then by quality score
      return b.result.qualityScore.overall - a.result.qualityScore.overall;
    });

    // Add rank
    return results.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  /**
   * Check if a layout is usable (passes critical checks)
   *
   * @param tree - Layout tree to check
   * @returns True if layout is usable
   */
  isUsable(tree: LayoutTree): boolean {
    const result = this.validate(tree);
    return result.valid && result.qualityScore.rating !== "unusable";
  }

  /**
   * Generate correction plan for invalid layout
   *
   * @param tree - Layout tree to fix
   * @returns Correction plan with suggestions
   */
  generateCorrectionPlan(tree: LayoutTree): CorrectionPlan {
    const result = this.validate(tree);

    if (result.valid) {
      return {
        possible: true,
        suggestions: [],
        estimatedQuality: result.qualityScore.overall,
      };
    }

    const suggestions = this.createSuggestions(result);
    const estimatedQuality = this.estimatePostCorrectionQuality(result);

    return {
      possible: suggestions.length > 0,
      suggestions,
      estimatedQuality,
    };
  }

  /**
   * Create correction suggestions from validation result
   */
  private createSuggestions(
    result: LayoutValidationResult
  ): Array<{
    type: "resize" | "reposition" | "scale" | "split" | "merge";
    targetNodeId: string;
    description: string;
    expectedImprovement: number;
  }> {
    const suggestions: Array<{
      type: "resize" | "reposition" | "scale" | "split" | "merge";
      targetNodeId: string;
      description: string;
      expectedImprovement: number;
    }> = [];

    // Suggest fixes for collisions
    for (const collision of result.collisions.collisions) {
      suggestions.push({
        type: "reposition",
        targetNodeId: collision.nodeB.id,
        description: `Move node "${collision.nodeB.id}" to avoid overlap with "${collision.nodeA.id}"`,
        expectedImprovement: 20,
      });
    }

    // Suggest fixes for whitespace issues
    if (result.whitespace.whitespaceRatio < 0.1) {
      suggestions.push({
        type: "split",
        targetNodeId: "root",
        description: "Layout is too dense - consider splitting into multiple slides",
        expectedImprovement: 30,
      });
    } else if (result.whitespace.leftRightBalance > 30) {
      suggestions.push({
        type: "reposition",
        targetNodeId: "root",
        description: "Reposition content to improve horizontal balance",
        expectedImprovement: 15,
      });
    }

    // Suggest fixes for hierarchy issues
    if (result.hierarchy.score < 60) {
      suggestions.push({
        type: "scale",
        targetNodeId: "largest-text-node",
        description: "Increase font size contrast to strengthen visual hierarchy",
        expectedImprovement: 25,
      });
    }

    return suggestions;
  }

  /**
   * Estimate quality after corrections
   */
  private estimatePostCorrectionQuality(
    result: LayoutValidationResult
  ): number {
    // Simple estimation: assume we can fix major issues
    let estimated = result.qualityScore.overall;

    // Boost for fixable issues
    if (result.collisions.hasCollisions) {
      estimated += 20;
    }

    if (result.whitespace.score < 50) {
      estimated += 20;
    }

    if (result.hierarchy.score < 50) {
      estimated += 15;
    }

    return Math.min(100, estimated);
  }

  /**
   * Count total nodes in a layout tree
   */
  private countNodes(node: LayoutNode): number {
    let count = 1;

    if (node.type === "container" && "children" in node) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }

    return count;
  }

  /**
   * Get quick summary of layout quality
   *
   * @param tree - Layout tree
   * @returns Short quality summary
   */
  getQuickSummary(tree: LayoutTree): {
    rating: string;
    score: number;
    issues: number;
    usable: boolean;
  } {
    const result = this.validate(tree);

    return {
      rating: result.qualityScore.rating,
      score: result.qualityScore.overall,
      issues: result.violations.length,
      usable: this.isUsable(tree),
    };
  }
}
