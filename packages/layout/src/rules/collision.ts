/**
 * Collision Detection System
 *
 * Detects overlapping nodes in positioned layouts.
 *
 * CORE PRINCIPLE:
 * No two content nodes should overlap - this creates visual
 * confusion and broken layouts.
 *
 * Algorithm:
 * 1. Extract all positioned nodes with _rect
 * 2. Check each pair for rectangle intersection
 * 3. Calculate overlap area and severity
 * 4. Report collisions with suggested fixes
 */

import type { LayoutNode, Rectangle, ContainerNode } from "../types.js";
import type { CollisionReport, Collision, LayoutViolation } from "./types.js";

/**
 * Node with extracted rectangle for collision checking
 */
interface PositionedNode {
  id: string;
  rect: Rectangle;
  type: string;
}

/**
 * Collision Detector
 *
 * Detects and reports node collisions in positioned layouts
 *
 * @example
 * ```typescript
 * const detector = new CollisionDetector();
 * const report = detector.detect(tree);
 *
 * if (report.hasCollisions) {
 *   console.log(`${report.collisions.length} collisions detected`);
 * }
 * ```
 */
export class CollisionDetector {
  /**
   * Minimum overlap area to consider a collision (in percentage points squared)
   * Prevents false positives from floating point precision issues
   */
  private readonly MIN_OVERLAP_THRESHOLD = 0.01;

  /**
   * Detect collisions in a layout tree
   *
   * @param root - Root layout node (must have _rect set)
   * @returns Collision report with all detected overlaps
   */
  detect(root: LayoutNode): CollisionReport {
    const nodes = this.extractPositionedNodes(root);
    const collisions: Collision[] = [];

    // Check all pairs (O(n²) but n is small for slides)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const collision = this.checkCollision(nodes[i], nodes[j]);
        if (collision) {
          collisions.push(collision);
        }
      }
    }

    const totalOverlapArea = collisions.reduce((sum, c) => sum + c.overlapArea, 0);

    return {
      hasCollisions: collisions.length > 0,
      collisions,
      totalOverlapArea,
    };
  }

  /**
   * Generate layout violations from collision report
   *
   * @param report - Collision detection result
   * @returns Array of layout violations
   */
  generateViolations(report: CollisionReport): LayoutViolation[] {
    return report.collisions.map((collision) => ({
      type: "node_collision",
      message: `Nodes "${collision.nodeA.id}" and "${collision.nodeB.id}" overlap by ${collision.overlapArea.toFixed(2)}%`,
      severity: this.determineSeverity(collision.overlapArea),
      nodeId: collision.nodeA.id,
      relatedNodeId: collision.nodeB.id,
      details: {
        overlapArea: collision.overlapArea,
        overlapRect: collision.overlapRect,
      },
    }));
  }

  /**
   * Extract all positioned nodes from a layout tree
   *
   * Recursively traverses tree and collects nodes with _rect property
   *
   * @param node - Layout node to extract from
   * @returns Array of positioned nodes
   */
  private extractPositionedNodes(node: LayoutNode): PositionedNode[] {
    const nodes: PositionedNode[] = [];

    const traverse = (n: LayoutNode) => {
      // Only check leaf nodes (actual content, not containers)
      // Containers overlapping with children is expected (children are inside)
      if (n._rect && n.type !== "container") {
        nodes.push({
          id: n.id,
          rect: n._rect,
          type: n.type,
        });
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
   * Check if two nodes collide
   *
   * @param a - First positioned node
   * @param b - Second positioned node
   * @returns Collision details if they overlap, null otherwise
   */
  private checkCollision(a: PositionedNode, b: PositionedNode): Collision | null {
    // Calculate overlap rectangle
    const overlapLeft = Math.max(a.rect.x, b.rect.x);
    const overlapRight = Math.min(a.rect.x + a.rect.width, b.rect.x + b.rect.width);
    const overlapTop = Math.max(a.rect.y, b.rect.y);
    const overlapBottom = Math.min(a.rect.y + a.rect.height, b.rect.y + b.rect.height);

    // Check if there's actual overlap
    if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) {
      return null;
    }

    const overlapWidth = overlapRight - overlapLeft;
    const overlapHeight = overlapBottom - overlapTop;
    const overlapArea = overlapWidth * overlapHeight;

    // Filter out tiny overlaps (floating point precision)
    if (overlapArea < this.MIN_OVERLAP_THRESHOLD) {
      return null;
    }

    return {
      nodeA: { id: a.id, rect: a.rect },
      nodeB: { id: b.id, rect: b.rect },
      overlapArea,
      overlapRect: {
        x: overlapLeft,
        y: overlapTop,
        width: overlapWidth,
        height: overlapHeight,
      },
    };
  }

  /**
   * Determine collision severity based on overlap area
   *
   * @param overlapArea - Area of overlap in percentage points squared
   * @returns Severity level
   */
  private determineSeverity(overlapArea: number): "error" | "warning" | "info" {
    if (overlapArea > 5) {
      return "error"; // Significant overlap
    } else if (overlapArea > 1) {
      return "warning"; // Moderate overlap
    }
    return "info"; // Minor overlap
  }
}
