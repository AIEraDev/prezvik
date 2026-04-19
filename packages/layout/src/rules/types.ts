/**
 * Layout Rules Engine Types
 *
 * Type definitions for spatial validation and quality scoring
 */

import type { Rectangle } from "../types.js";

/**
 * Spatial bounds for validation
 */
export interface SpatialBounds {
  /** Minimum X coordinate (typically 0) */
  minX: number;
  /** Maximum X coordinate (typically 100) */
  maxX: number;
  /** Minimum Y coordinate (typically 0) */
  minY: number;
  /** Maximum Y coordinate (typically 100) */
  maxY: number;
}

/**
 * Severity levels for violations
 */
export type ViolationSeverity = "error" | "warning" | "info";

/**
 * Layout violation record
 */
export interface LayoutViolation {
  /** Unique violation type identifier */
  type: string;
  /** Human-readable description */
  message: string;
  /** Severity level */
  severity: ViolationSeverity;
  /** Node ID where violation occurred */
  nodeId: string;
  /** Optional: second node involved (for collisions) */
  relatedNodeId?: string;
  /** Additional context data */
  details?: Record<string, unknown>;
}

/**
 * Collision between two nodes
 */
export interface Collision {
  /** First colliding node */
  nodeA: { id: string; rect: Rectangle };
  /** Second colliding node */
  nodeB: { id: string; rect: Rectangle };
  /** Overlap area in percentage points squared */
  overlapArea: number;
  /** Overlap rectangle */
  overlapRect: Rectangle;
}

/**
 * Collision detection report
 */
export interface CollisionReport {
  /** Whether any collisions were detected */
  hasCollisions: boolean;
  /** List of all collisions */
  collisions: Collision[];
  /** Total overlap area (sum of all collision areas) */
  totalOverlapArea: number;
}

/**
 * Whitespace balance metrics
 */
export interface WhitespaceBalance {
  /** Overall balance score (0-100) */
  score: number;
  /** Whitespace ratio (whitespace area / total area) */
  whitespaceRatio: number;
  /** Balance between left and right sides (0 = perfect balance) */
  leftRightBalance: number;
  /** Balance between top and bottom (0 = perfect balance) */
  topBottomBalance: number;
  /** Distribution of whitespace across quadrants */
  quadrantDistribution: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
}

/**
 * Hierarchy level definition
 */
export interface HierarchyLevel {
  /** Level name (e.g., "title", "subtitle", "body") */
  name: string;
  /** Expected font size range (min, max) */
  fontSizeRange: [number, number];
  /** Expected visual weight (0-100) */
  expectedWeight: number;
}

/**
 * Hierarchy check result for a single node
 */
export interface HierarchyNodeCheck {
  /** Node ID */
  nodeId: string;
  /** Detected hierarchy level */
  detectedLevel: string;
  /** Font size compliance (0-100) */
  fontSizeCompliance: number;
  /** Visual weight compliance (0-100) */
  weightCompliance: number;
  /** Issues found */
  issues: string[];
}

/**
 * Visual hierarchy check result
 */
export interface HierarchyCheck {
  /** Whether hierarchy is properly established */
  valid: boolean;
  /** Overall hierarchy score (0-100) */
  score: number;
  /** Checks for individual nodes */
  nodeChecks: HierarchyNodeCheck[];
  /** Detected hierarchy levels in order */
  detectedHierarchy: string[];
  /** Missing expected levels */
  missingLevels: string[];
}

/**
 * Quality dimension scores
 */
export interface QualityDimensions {
  /** Spatial organization (0-100) */
  spatial: number;
  /** Visual balance (0-100) */
  balance: number;
  /** Typography hierarchy (0-100) */
  hierarchy: number;
  /** Readability (0-100) */
  readability: number;
  /** Aesthetic appeal (0-100) */
  aesthetic: number;
}

/**
 * Quality score breakdown
 */
export interface QualityScore {
  /** Overall quality score (0-100) */
  overall: number;
  /** Individual dimension scores */
  dimensions: QualityDimensions;
  /** Weight applied to each dimension */
  weights: {
    spatial: number;
    balance: number;
    hierarchy: number;
    readability: number;
    aesthetic: number;
  };
  /** Interpretation of the score */
  rating: "excellent" | "good" | "acceptable" | "poor" | "unusable";
}

/**
 * Complete layout validation result
 */
export interface LayoutValidationResult {
  /** Whether layout passes all critical checks */
  valid: boolean;
  /** Quality score breakdown */
  qualityScore: QualityScore;
  /** All violations found */
  violations: LayoutViolation[];
  /** Collision report */
  collisions: CollisionReport;
  /** Whitespace analysis */
  whitespace: WhitespaceBalance;
  /** Hierarchy check */
  hierarchy: HierarchyCheck;
  /** Performance metrics */
  performance: {
    /** Validation duration in milliseconds */
    duration: number;
    /** Number of nodes checked */
    nodesChecked: number;
  };
}

/**
 * Layout correction suggestion
 */
export interface LayoutSuggestion {
  /** Type of correction */
  type: "resize" | "reposition" | "scale" | "split" | "merge";
  /** Target node ID */
  targetNodeId: string;
  /** Description of the fix */
  description: string;
  /** Expected improvement in quality score */
  expectedImprovement: number;
  /** Suggested new rectangle (if applicable) */
  suggestedRect?: Rectangle;
  /** Suggested font size (if applicable) */
  suggestedFontSize?: number;
}

/**
 * Layout correction plan
 */
export interface CorrectionPlan {
  /** Whether corrections are possible */
  possible: boolean;
  /** List of suggested corrections */
  suggestions: LayoutSuggestion[];
  /** Estimated final quality score after corrections */
  estimatedQuality: number;
}
