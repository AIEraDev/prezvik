/**
 * Visual Hierarchy Checker
 *
 * Validates and enforces visual hierarchy in layouts.
 *
 * CORE PRINCIPLE:
 * Slides must have clear visual hierarchy - titles should be
 * largest and most prominent, supporting content smaller.
 *
 * Hierarchy Levels (typical presentation):
 * - Title: 36-48pt (highest emphasis)
 * - Subtitle: 24-32pt (high emphasis)
 * - Heading: 20-28pt (medium-high emphasis)
 * - Body: 14-18pt (normal emphasis)
 * - Caption: 12-14pt (low emphasis)
 */

import type { LayoutNode, TextNode, ContainerNode } from "../types.js";
import type { HierarchyCheck, HierarchyNodeCheck, LayoutViolation } from "./types.js";

/**
 * Font size ranges for hierarchy levels
 */
const HIERARCHY_LEVELS = {
  title: { min: 36, max: 72, expected: 44 },
  subtitle: { min: 24, max: 36, expected: 28 },
  heading: { min: 20, max: 32, expected: 24 },
  body: { min: 14, max: 20, expected: 16 },
  caption: { min: 12, max: 16, expected: 14 },
};

/**
 * Detected hierarchy level for a node
 */
interface DetectedLevel {
  level: keyof typeof HIERARCHY_LEVELS | "unknown";
  confidence: number;
  fontSize: number;
}

/**
 * Hierarchy Checker
 *
 * Validates visual hierarchy in positioned layouts
 *
 * @example
 * ```typescript
 * const checker = new HierarchyChecker();
 * const result = checker.check(tree.root);
 *
 * if (!result.valid) {
 *   console.log('Hierarchy issues:', result.nodeChecks);
 * }
 * ```
 */
export class HierarchyChecker {
  /**
   * Check visual hierarchy in a layout
   *
   * @param root - Root layout node
   * @returns Hierarchy check result
   */
  check(root: LayoutNode): HierarchyCheck {
    const textNodes = this.extractTextNodes(root);

    if (textNodes.length === 0) {
      return {
        valid: true,
        score: 100,
        nodeChecks: [],
        detectedHierarchy: [],
        missingLevels: [],
      };
    }

    // Detect hierarchy levels for each node
    const detectedLevels = textNodes.map((node) => ({
      node,
      detected: this.detectHierarchyLevel(node),
    }));

    // Create node checks
    const nodeChecks = this.createNodeChecks(detectedLevels);

    // Determine detected hierarchy (unique levels in order)
    const detectedHierarchy = this.determineDetectedHierarchy(detectedLevels);

    // Check for missing expected levels
    const missingLevels = this.findMissingLevels(detectedHierarchy, textNodes.length);

    // Calculate overall score
    const score = this.calculateHierarchyScore(nodeChecks, detectedHierarchy);

    // Valid if score is acceptable
    const valid = score >= 60;

    return {
      valid,
      score,
      nodeChecks,
      detectedHierarchy,
      missingLevels,
    };
  }

  /**
   * Generate violations from hierarchy check
   *
   * @param check - Hierarchy check result
   * @returns Array of violations
   */
  generateViolations(check: HierarchyCheck): LayoutViolation[] {
    const violations: LayoutViolation[] = [];

    // Check for poor hierarchy score
    if (check.score < 40) {
      violations.push({
        type: "poor_hierarchy",
        message: `Visual hierarchy is unclear (score: ${check.score}/100). Consider using distinct font sizes for titles, headings, and body text.`,
        severity: "warning",
        nodeId: "root",
        details: { score: check.score, detectedHierarchy: check.detectedHierarchy },
      });
    } else if (check.score < 70) {
      violations.push({
        type: "weak_hierarchy",
        message: `Visual hierarchy could be improved (score: ${check.score}/100).`,
        severity: "info",
        nodeId: "root",
        details: { score: check.score },
      });
    }

    // Check for nodes with issues
    check.nodeChecks.forEach((nodeCheck) => {
      if (nodeCheck.issues.length > 0) {
        violations.push({
          type: "hierarchy_issue",
          message: `Node "${nodeCheck.nodeId}" (${nodeCheck.detectedLevel}): ${nodeCheck.issues.join("; ")}`,
          severity: nodeCheck.fontSizeCompliance < 50 ? "warning" : "info",
          nodeId: nodeCheck.nodeId,
          details: {
            detectedLevel: nodeCheck.detectedLevel,
            fontSizeCompliance: nodeCheck.fontSizeCompliance,
            weightCompliance: nodeCheck.weightCompliance,
          },
        });
      }
    });

    return violations;
  }

  /**
   * Extract all text nodes from a layout tree
   */
  private extractTextNodes(node: LayoutNode): TextNode[] {
    const nodes: TextNode[] = [];

    const traverse = (n: LayoutNode) => {
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
   * Detect hierarchy level based on font size
   */
  private detectHierarchyLevel(node: TextNode): DetectedLevel {
    const fontSize = node.text.fontSize || 16;

    // Check each hierarchy level
    let bestMatch: keyof typeof HIERARCHY_LEVELS | "unknown" = "unknown";
    let bestConfidence = 0;

    for (const [level, range] of Object.entries(HIERARCHY_LEVELS)) {
      if (fontSize >= range.min && fontSize <= range.max) {
        // Calculate confidence based on distance from expected size
        const distance = Math.abs(fontSize - range.expected);
        const maxDistance = Math.max(range.max - range.expected, range.expected - range.min);
        const confidence = maxDistance > 0 ? 100 - (distance / maxDistance) * 50 : 100;

        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = level as keyof typeof HIERARCHY_LEVELS;
        }
      }
    }

    return {
      level: bestMatch,
      confidence: bestConfidence,
      fontSize,
    };
  }

  /**
   * Create node checks from detected levels
   */
  private createNodeChecks(
    detectedLevels: Array<{ node: TextNode; detected: DetectedLevel }>
  ): HierarchyNodeCheck[] {
    // Sort by font size descending to determine actual hierarchy order
    const sorted = [...detectedLevels].sort(
      (a, b) => b.detected.fontSize - a.detected.fontSize
    );

    return sorted.map((item, index) => {
      const expectedLevel = this.getExpectedLevelByIndex(index, sorted.length);
      const issues: string[] = [];

      // Check font size compliance
      let fontSizeCompliance = item.detected.confidence;

      if (item.detected.level === "unknown") {
        fontSizeCompliance = 0;
        issues.push(`Font size ${item.detected.fontSize}pt doesn't fit standard hierarchy`);
      }

      // Check if level matches expected position
      const weightCompliance = expectedLevel === item.detected.level ? 100 : 50;
      if (expectedLevel !== item.detected.level && item.detected.level !== "unknown") {
        issues.push(`Expected ${expectedLevel} but detected ${item.detected.level}`);
      }

      return {
        nodeId: item.node.id,
        detectedLevel: item.detected.level,
        fontSizeCompliance,
        weightCompliance,
        issues,
      };
    });
  }

  /**
   * Get expected hierarchy level based on position in sorted list
   */
  private getExpectedLevelByIndex(
    index: number,
    total: number
  ): keyof typeof HIERARCHY_LEVELS {
    if (index === 0) return "title";
    if (index === 1 && total > 2) return "subtitle";
    if (index < total / 3) return "heading";
    if (index < (2 * total) / 3) return "body";
    return "caption";
  }

  /**
   * Determine detected hierarchy (unique levels in order of size)
   */
  private determineDetectedHierarchy(
    detectedLevels: Array<{ node: TextNode; detected: DetectedLevel }>
  ): string[] {
    const seen = new Set<string>();
    const ordered: string[] = [];

    // Sort by font size descending
    const sorted = [...detectedLevels].sort(
      (a, b) => b.detected.fontSize - a.detected.fontSize
    );

    for (const item of sorted) {
      if (item.detected.level !== "unknown" && !seen.has(item.detected.level)) {
        seen.add(item.detected.level);
        ordered.push(item.detected.level);
      }
    }

    return ordered;
  }

  /**
   * Find missing expected hierarchy levels
   */
  private findMissingLevels(
    detected: string[],
    nodeCount: number
  ): string[] {
    const expected: string[] = [];

    // Determine expected levels based on node count
    if (nodeCount >= 1) expected.push("title");
    if (nodeCount >= 3) expected.push("body");
    if (nodeCount >= 4) expected.push("heading");

    return expected.filter((level) => !detected.includes(level));
  }

  /**
   * Calculate overall hierarchy score (0-100)
   */
  private calculateHierarchyScore(
    nodeChecks: HierarchyNodeCheck[],
    detectedHierarchy: string[]
  ): number {
    if (nodeChecks.length === 0) return 100;

    // Average compliance scores
    const fontScoreSum = nodeChecks.reduce(
      (sum, check) => sum + check.fontSizeCompliance,
      0
    );
    const weightScoreSum = nodeChecks.reduce(
      (sum, check) => sum + check.weightCompliance,
      0
    );

    const avgFontScore = fontScoreSum / nodeChecks.length;
    const avgWeightScore = weightScoreSum / nodeChecks.length;

    // Bonus for having multiple hierarchy levels
    const hierarchyBonus = Math.min(detectedHierarchy.length * 10, 30);

    // Weighted score
    const baseScore = avgFontScore * 0.5 + avgWeightScore * 0.3;
    const finalScore = Math.min(baseScore + hierarchyBonus, 100);

    return Math.round(finalScore);
  }
}
