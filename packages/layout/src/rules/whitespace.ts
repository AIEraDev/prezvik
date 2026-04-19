/**
 * Whitespace Balance Analyzer
 *
 * Analyzes whitespace distribution in layouts.
 *
 * CORE PRINCIPLE:
 * Good layouts have balanced whitespace that creates visual
 * breathing room without feeling empty or cluttered.
 *
 * Metrics:
 * - Overall whitespace ratio (20-40% is ideal)
 * - Left/right balance (symmetry score)
 * - Top/bottom balance (vertical distribution)
 * - Quadrant distribution (even spread)
 */

import type { LayoutNode, Rectangle, ContainerNode } from "../types.js";
import type { WhitespaceBalance, LayoutViolation } from "./types.js";

/**
 * Whitespace Analyzer
 *
 * Calculates whitespace balance scores for positioned layouts
 *
 * @example
 * ```typescript
 * const analyzer = new WhitespaceAnalyzer();
 * const balance = analyzer.analyze(tree.root);
 *
 * console.log(`Whitespace score: ${balance.score}`);
 * console.log(`Whitespace ratio: ${balance.whitespaceRatio.toFixed(1)}%`);
 * ```
 */
export class WhitespaceAnalyzer {
  /** Ideal whitespace ratio (20-40%) */
  private readonly IDEAL_WHITESPACE_MIN = 0.15;
  private readonly IDEAL_WHITESPACE_MAX = 0.45;
  // private readonly IDEAL_WHITESPACE_TARGET = 0.30;

  /**
   * Analyze whitespace balance in a layout
   *
   * @param root - Root layout node with _rect
   * @returns Whitespace balance metrics
   */
  analyze(root: LayoutNode): WhitespaceBalance {
    const bounds = root._rect || { x: 0, y: 0, width: 100, height: 100 };
    const nodes = this.extractPositionedNodes(root);

    // Calculate total content area
    const contentArea = this.calculateTotalContentArea(nodes);
    const totalArea = bounds.width * bounds.height;
    const whitespaceArea = Math.max(0, totalArea - contentArea);
    const whitespaceRatio = totalArea > 0 ? whitespaceArea / totalArea : 0;

    // Calculate directional balances
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    const leftRightBalance = this.calculateHorizontalBalance(nodes, centerX);
    const topBottomBalance = this.calculateVerticalBalance(nodes, centerY);
    const quadrantDistribution = this.calculateQuadrantDistribution(nodes, centerX, centerY);

    // Calculate overall score
    const score = this.calculateScore(whitespaceRatio, leftRightBalance, topBottomBalance, quadrantDistribution);

    return {
      score,
      whitespaceRatio,
      leftRightBalance,
      topBottomBalance,
      quadrantDistribution,
    };
  }

  /**
   * Generate violations for poor whitespace balance
   *
   * @param balance - Whitespace analysis result
   * @returns Array of violations
   */
  generateViolations(balance: WhitespaceBalance): LayoutViolation[] {
    const violations: LayoutViolation[] = [];

    // Check whitespace ratio
    if (balance.whitespaceRatio < 0.05) {
      violations.push({
        type: "excessive_content",
        message: `Layout is too dense (${(balance.whitespaceRatio * 100).toFixed(1)}% whitespace). Consider removing content or splitting into multiple slides.`,
        severity: "warning",
        nodeId: "root",
        details: { whitespaceRatio: balance.whitespaceRatio },
      });
    } else if (balance.whitespaceRatio > 0.6) {
      violations.push({
        type: "excessive_whitespace",
        message: `Layout is too sparse (${(balance.whitespaceRatio * 100).toFixed(1)}% whitespace). Consider adding content or using a more compact layout.`,
        severity: "info",
        nodeId: "root",
        details: { whitespaceRatio: balance.whitespaceRatio },
      });
    }

    // Check horizontal balance
    if (balance.leftRightBalance > 30) {
      violations.push({
        type: "unbalanced_horizontal",
        message: `Layout is horizontally unbalanced (${balance.leftRightBalance.toFixed(1)}% difference). Consider centering content or distributing evenly.`,
        severity: "warning",
        nodeId: "root",
        details: { leftRightBalance: balance.leftRightBalance },
      });
    }

    // Check vertical balance
    if (balance.topBottomBalance > 30) {
      violations.push({
        type: "unbalanced_vertical",
        message: `Layout is vertically unbalanced (${balance.topBottomBalance.toFixed(1)}% difference). Consider distributing content more evenly.`,
        severity: "warning",
        nodeId: "root",
        details: { topBottomBalance: balance.topBottomBalance },
      });
    }

    return violations;
  }

  /**
   * Extract all positioned nodes from a layout tree
   */
  private extractPositionedNodes(node: LayoutNode): Array<{
    id: string;
    rect: Rectangle;
  }> {
    const nodes: Array<{ id: string; rect: Rectangle }> = [];

    const traverse = (n: LayoutNode) => {
      if (n._rect && n.type !== "container") {
        nodes.push({ id: n.id, rect: n._rect });
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
   * Calculate total content area (sum of all node areas)
   */
  private calculateTotalContentArea(nodes: Array<{ rect: Rectangle }>): number {
    // Simple sum (collisions will overcount, but that's acceptable for whitespace calc)
    return nodes.reduce((sum, node) => {
      return sum + node.rect.width * node.rect.height;
    }, 0);
  }

  /**
   * Calculate horizontal balance (left vs right weight)
   * Returns percentage difference (0 = perfect balance)
   */
  private calculateHorizontalBalance(nodes: Array<{ rect: Rectangle }>, centerX: number): number {
    let leftWeight = 0;
    let rightWeight = 0;

    nodes.forEach((node) => {
      const area = node.rect.width * node.rect.height;
      const nodeCenterX = node.rect.x + node.rect.width / 2;

      if (nodeCenterX < centerX) {
        leftWeight += area;
      } else {
        rightWeight += area;
      }
    });

    const totalWeight = leftWeight + rightWeight;
    if (totalWeight === 0) return 0;

    // Return percentage difference from 50/50
    const leftRatio = leftWeight / totalWeight;
    const rightRatio = rightWeight / totalWeight;
    return Math.abs(leftRatio - rightRatio) * 100;
  }

  /**
   * Calculate vertical balance (top vs bottom weight)
   * Returns percentage difference (0 = perfect balance)
   */
  private calculateVerticalBalance(nodes: Array<{ rect: Rectangle }>, centerY: number): number {
    let topWeight = 0;
    let bottomWeight = 0;

    nodes.forEach((node) => {
      const area = node.rect.width * node.rect.height;
      const nodeCenterY = node.rect.y + node.rect.height / 2;

      if (nodeCenterY < centerY) {
        topWeight += area;
      } else {
        bottomWeight += area;
      }
    });

    const totalWeight = topWeight + bottomWeight;
    if (totalWeight === 0) return 0;

    // Return percentage difference from 50/50
    const topRatio = topWeight / totalWeight;
    const bottomRatio = bottomWeight / totalWeight;
    return Math.abs(topRatio - bottomRatio) * 100;
  }

  /**
   * Calculate distribution of content across quadrants
   */
  private calculateQuadrantDistribution(
    nodes: Array<{ rect: Rectangle }>,
    centerX: number,
    centerY: number,
  ): {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  } {
    let topLeft = 0;
    let topRight = 0;
    let bottomLeft = 0;
    let bottomRight = 0;

    nodes.forEach((node) => {
      const area = node.rect.width * node.rect.height;
      const nodeCenterX = node.rect.x + node.rect.width / 2;
      const nodeCenterY = node.rect.y + node.rect.height / 2;

      if (nodeCenterX < centerX && nodeCenterY < centerY) {
        topLeft += area;
      } else if (nodeCenterX >= centerX && nodeCenterY < centerY) {
        topRight += area;
      } else if (nodeCenterX < centerX && nodeCenterY >= centerY) {
        bottomLeft += area;
      } else {
        bottomRight += area;
      }
    });

    const total = topLeft + topRight + bottomLeft + bottomRight;
    if (total === 0) {
      return { topLeft: 25, topRight: 25, bottomLeft: 25, bottomRight: 25 };
    }

    return {
      topLeft: (topLeft / total) * 100,
      topRight: (topRight / total) * 100,
      bottomLeft: (bottomLeft / total) * 100,
      bottomRight: (bottomRight / total) * 100,
    };
  }

  /**
   * Calculate overall whitespace balance score (0-100)
   */
  private calculateScore(
    whitespaceRatio: number,
    leftRightBalance: number,
    topBottomBalance: number,
    quadrantDistribution: {
      topLeft: number;
      topRight: number;
      bottomLeft: number;
      bottomRight: number;
    },
  ): number {
    // Score whitespace ratio (ideal: 20-40%)
    let ratioScore: number;
    if (whitespaceRatio >= this.IDEAL_WHITESPACE_MIN && whitespaceRatio <= this.IDEAL_WHITESPACE_MAX) {
      ratioScore = 100;
    } else if (whitespaceRatio < this.IDEAL_WHITESPACE_MIN) {
      // Penalize for being too dense
      ratioScore = (whitespaceRatio / this.IDEAL_WHITESPACE_MIN) * 100;
    } else {
      // Penalize for being too sparse
      ratioScore = ((1 - whitespaceRatio) / (1 - this.IDEAL_WHITESPACE_MAX)) * 100;
    }

    // Score horizontal balance (0 = perfect, >50 = terrible)
    const horizontalScore = Math.max(0, 100 - leftRightBalance * 2);

    // Score vertical balance
    const verticalScore = Math.max(0, 100 - topBottomBalance * 2);

    // Score quadrant distribution (ideal: 25% each quadrant)
    const expectedQuadrant = 25;
    const quadrantDeviations = [Math.abs(quadrantDistribution.topLeft - expectedQuadrant), Math.abs(quadrantDistribution.topRight - expectedQuadrant), Math.abs(quadrantDistribution.bottomLeft - expectedQuadrant), Math.abs(quadrantDistribution.bottomRight - expectedQuadrant)];
    const maxQuadrantDeviation = Math.max(...quadrantDeviations);
    const quadrantScore = Math.max(0, 100 - maxQuadrantDeviation * 2);

    // Weighted average
    return Math.round(ratioScore * 0.35 + horizontalScore * 0.2 + verticalScore * 0.2 + quadrantScore * 0.25);
  }
}
