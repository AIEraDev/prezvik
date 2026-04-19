/**
 * Layout Rules Engine Tests
 *
 * Tests for spatial validation and quality scoring
 */

import { describe, it, expect } from "vitest";
import { LayoutRulesEngine, CollisionDetector, WhitespaceAnalyzer, HierarchyChecker, QualityScorer } from "./index.js";
import type { LayoutTree, ContainerNode, TextNode } from "../types.js";

describe("LayoutRulesEngine", () => {
  const engine = new LayoutRulesEngine();

  describe("Basic Validation", () => {
    it("should validate a valid layout without collisions", () => {
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          _rect: { x: 0, y: 0, width: 100, height: 100 },
          layout: { type: "flow", direction: "vertical", gap: 10 },
          children: [
            {
              id: "child1",
              type: "text",
              _rect: { x: 10, y: 10, width: 80, height: 20 },
              content: "Title",
              text: { fontSize: 36, fontFamily: "Arial", color: "#000000" },
            } as TextNode,
            {
              id: "child2",
              type: "text",
              _rect: { x: 10, y: 40, width: 80, height: 40 },
              content: "Body text",
              text: { fontSize: 16, fontFamily: "Arial", color: "#333333" },
            } as TextNode,
          ],
        } as ContainerNode,
      };

      const result = engine.validate(tree);

      expect(result.valid).toBe(true);
      expect(result.collisions.hasCollisions).toBe(false);
      expect(result.qualityScore.overall).toBeGreaterThan(60);
    });

    it("should detect node collisions", () => {
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          _rect: { x: 0, y: 0, width: 100, height: 100 },
          layout: { type: "flow", direction: "vertical", gap: 10 },
          children: [
            {
              id: "child1",
              type: "text",
              _rect: { x: 10, y: 10, width: 80, height: 30 },
              content: "First",
              text: { fontSize: 16, fontFamily: "Arial", color: "#000000" },
            } as TextNode,
            {
              id: "child2",
              type: "text",
              _rect: { x: 10, y: 20, width: 80, height: 30 }, // Overlaps with child1
              content: "Second",
              text: { fontSize: 16, fontFamily: "Arial", color: "#000000" },
            } as TextNode,
          ],
        } as ContainerNode,
      };

      const result = engine.validate(tree);

      expect(result.valid).toBe(false);
      expect(result.collisions.hasCollisions).toBe(true);
      expect(result.collisions.collisions.length).toBeGreaterThan(0);
    });

    it("should score layout quality", () => {
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          _rect: { x: 0, y: 0, width: 100, height: 100 },
          layout: { type: "flow", direction: "vertical", gap: 10 },
          children: [
            {
              id: "title",
              type: "text",
              _rect: { x: 10, y: 10, width: 80, height: 15 },
              content: "Title",
              text: { fontSize: 36, fontFamily: "Arial", color: "#000000" },
            } as TextNode,
            {
              id: "subtitle",
              type: "text",
              _rect: { x: 10, y: 35, width: 80, height: 10 },
              content: "Subtitle",
              text: { fontSize: 24, fontFamily: "Arial", color: "#333333" },
            } as TextNode,
            {
              id: "body",
              type: "text",
              _rect: { x: 10, y: 55, width: 80, height: 30 },
              content: "Body content here",
              text: { fontSize: 16, fontFamily: "Arial", color: "#333333" },
            } as TextNode,
          ],
        } as ContainerNode,
      };

      const result = engine.validate(tree);

      expect(result.qualityScore.overall).toBeGreaterThan(0);
      expect(result.qualityScore.rating).toBeDefined();
      expect(result.qualityScore.dimensions.spatial).toBeGreaterThanOrEqual(0);
      expect(result.qualityScore.dimensions.balance).toBeGreaterThanOrEqual(0);
      expect(result.qualityScore.dimensions.hierarchy).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Collision Detection", () => {
    const detector = new CollisionDetector();

    it("should detect overlapping nodes", () => {
      const root: ContainerNode = {
        id: "root",
        type: "container",
        _rect: { x: 0, y: 0, width: 100, height: 100 },
        layout: { type: "flow", direction: "vertical", gap: 10 },
        children: [
          {
            id: "a",
            type: "text",
            _rect: { x: 10, y: 10, width: 40, height: 20 },
            content: "A",
            text: { fontSize: 16 },
          } as TextNode,
          {
            id: "b",
            type: "text",
            _rect: { x: 30, y: 15, width: 40, height: 20 }, // Overlaps with a
            content: "B",
            text: { fontSize: 16 },
          } as TextNode,
        ],
      };

      const report = detector.detect(root);

      expect(report.hasCollisions).toBe(true);
      expect(report.collisions.length).toBe(1);
      expect(report.collisions[0].nodeA.id).toBe("a");
      expect(report.collisions[0].nodeB.id).toBe("b");
    });

    it("should not detect collision for non-overlapping nodes", () => {
      const root: ContainerNode = {
        id: "root",
        type: "container",
        _rect: { x: 0, y: 0, width: 100, height: 100 },
        layout: { type: "flow", direction: "vertical", gap: 10 },
        children: [
          {
            id: "a",
            type: "text",
            _rect: { x: 10, y: 10, width: 40, height: 20 },
            content: "A",
            text: { fontSize: 16 },
          } as TextNode,
          {
            id: "b",
            type: "text",
            _rect: { x: 10, y: 40, width: 40, height: 20 }, // No overlap
            content: "B",
            text: { fontSize: 16 },
          } as TextNode,
        ],
      };

      const report = detector.detect(root);

      expect(report.hasCollisions).toBe(false);
      expect(report.collisions.length).toBe(0);
    });
  });

  describe("Whitespace Analysis", () => {
    const analyzer = new WhitespaceAnalyzer();

    it("should calculate whitespace balance", () => {
      const root: ContainerNode = {
        id: "root",
        type: "container",
        _rect: { x: 0, y: 0, width: 100, height: 100 },
        layout: { type: "flow", direction: "vertical", gap: 10 },
        children: [
          {
            id: "child",
            type: "text",
            _rect: { x: 10, y: 10, width: 80, height: 20 },
            content: "Text",
            text: { fontSize: 16 },
          } as TextNode,
        ],
      };

      const balance = analyzer.analyze(root);

      expect(balance.score).toBeGreaterThanOrEqual(0);
      expect(balance.score).toBeLessThanOrEqual(100);
      expect(balance.whitespaceRatio).toBeGreaterThan(0);
      expect(balance.leftRightBalance).toBeGreaterThanOrEqual(0);
      expect(balance.topBottomBalance).toBeGreaterThanOrEqual(0);
    });

    it("should detect excessive density", () => {
      const root: ContainerNode = {
        id: "root",
        type: "container",
        _rect: { x: 0, y: 0, width: 100, height: 100 },
        layout: { type: "flow", direction: "vertical", gap: 5 },
        children: Array.from({ length: 10 }, (_, i) => ({
          id: `child-${i}`,
          type: "text",
          _rect: { x: 5, y: i * 10, width: 90, height: 15 },
          content: `Text ${i}`,
          text: { fontSize: 16 },
        })) as TextNode[],
      };

      const balance = analyzer.analyze(root);
      const violations = analyzer.generateViolations(balance);

      const densityViolation = violations.find((v: { type: string }) => v.type === "excessive_content");
      expect(densityViolation).toBeDefined();
    });
  });

  describe("Hierarchy Checking", () => {
    const checker = new HierarchyChecker();

    it("should detect clear visual hierarchy", () => {
      const root: ContainerNode = {
        id: "root",
        type: "container",
        _rect: { x: 0, y: 0, width: 100, height: 100 },
        layout: { type: "flow", direction: "vertical", gap: 10 },
        children: [
          {
            id: "title",
            type: "text",
            _rect: { x: 10, y: 10, width: 80, height: 15 },
            content: "Title",
            text: { fontSize: 44 }, // Title size
          } as TextNode,
          {
            id: "body",
            type: "text",
            _rect: { x: 10, y: 35, width: 80, height: 50 },
            content: "Body content",
            text: { fontSize: 16 }, // Body size
          } as TextNode,
        ],
      };

      const result = checker.check(root);

      expect(result.score).toBeGreaterThan(50);
      expect(result.detectedHierarchy.length).toBeGreaterThanOrEqual(1);
    });

    it("should detect weak hierarchy", () => {
      const root: ContainerNode = {
        id: "root",
        type: "container",
        _rect: { x: 0, y: 0, width: 100, height: 100 },
        layout: { type: "flow", direction: "vertical", gap: 10 },
        children: [
          {
            id: "a",
            type: "text",
            _rect: { x: 10, y: 10, width: 40, height: 15 },
            content: "A",
            text: { fontSize: 16 },
          } as TextNode,
          {
            id: "b",
            type: "text",
            _rect: { x: 10, y: 35, width: 40, height: 15 },
            content: "B",
            text: { fontSize: 15 }, // Almost same size
          } as TextNode,
        ],
      };

      const result = checker.check(root);

      // Weak hierarchy should score lower
      expect(result.score).toBeLessThan(80);
    });
  });

  describe("Quality Scoring", () => {
    const scorer = new QualityScorer();

    it("should calculate overall quality score", () => {
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          _rect: { x: 0, y: 0, width: 100, height: 100 },
          layout: { type: "flow", direction: "vertical", gap: 10 },
          children: [
            {
              id: "child",
              type: "text",
              _rect: { x: 10, y: 10, width: 80, height: 20 },
              content: "Text",
              text: { fontSize: 16 },
            } as TextNode,
          ],
        } as ContainerNode,
      };

      const score = scorer.calculate(tree, {
        collisions: { hasCollisions: false, collisions: [], totalOverlapArea: 0 },
        whitespace: {
          score: 80,
          whitespaceRatio: 0.3,
          leftRightBalance: 10,
          topBottomBalance: 10,
          quadrantDistribution: {
            topLeft: 25,
            topRight: 25,
            bottomLeft: 25,
            bottomRight: 25,
          },
        },
        hierarchy: { valid: true, score: 70, nodeChecks: [], detectedHierarchy: ["title"], missingLevels: [] },
      });

      expect(score.overall).toBeGreaterThan(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.rating).toBeDefined();
      expect(score.dimensions.spatial).toBe(100); // No collisions
    });

    it("should penalize layouts with collisions", () => {
      const tree: LayoutTree = {
        root: {
          id: "root",
          type: "container",
          _rect: { x: 0, y: 0, width: 100, height: 100 },
          layout: { type: "flow", direction: "vertical", gap: 10 },
          children: [],
        } as ContainerNode,
      };

      const score = scorer.calculate(tree, {
        collisions: {
          hasCollisions: true,
          collisions: [
            {
              nodeA: { id: "a", rect: { x: 0, y: 0, width: 50, height: 50 } },
              nodeB: { id: "b", rect: { x: 25, y: 25, width: 50, height: 50 } },
              overlapArea: 625,
              overlapRect: { x: 25, y: 25, width: 25, height: 25 },
            },
          ],
          totalOverlapArea: 625,
        },
        whitespace: {
          score: 70,
          whitespaceRatio: 0.3,
          leftRightBalance: 15,
          topBottomBalance: 15,
          quadrantDistribution: {
            topLeft: 25,
            topRight: 25,
            bottomLeft: 25,
            bottomRight: 25,
          },
        },
        hierarchy: { valid: true, score: 60, nodeChecks: [], detectedHierarchy: [], missingLevels: [] },
      });

      expect(score.dimensions.spatial).toBeLessThan(50); // Penalized for collisions
      // Rating may vary based on overall composite score
    });
  });

  describe("Ranking", () => {
    it("should rank layouts by quality", () => {
      const goodTree: LayoutTree = {
        root: {
          id: "good",
          type: "container",
          _rect: { x: 0, y: 0, width: 100, height: 100 },
          layout: { type: "flow", direction: "vertical", gap: 10 },
          children: [
            {
              id: "title",
              type: "text",
              _rect: { x: 10, y: 10, width: 80, height: 15 },
              content: "Title",
              text: { fontSize: 44 },
            } as TextNode,
          ],
        } as ContainerNode,
      };

      const badTree: LayoutTree = {
        root: {
          id: "bad",
          type: "container",
          _rect: { x: 0, y: 0, width: 100, height: 100 },
          layout: { type: "flow", direction: "vertical", gap: 10 },
          children: [
            {
              id: "a",
              type: "text",
              _rect: { x: 10, y: 10, width: 80, height: 30 },
              content: "A",
              text: { fontSize: 16 },
            } as TextNode,
            {
              id: "b",
              type: "text",
              _rect: { x: 10, y: 20, width: 80, height: 30 }, // Collision
              content: "B",
              text: { fontSize: 16 },
            } as TextNode,
          ],
        } as ContainerNode,
      };

      const ranked = engine.rankLayouts([badTree, goodTree]);

      expect(ranked[0].rank).toBe(1);
      // Good layout should rank higher than bad layout
      expect(ranked[0].result.qualityScore.overall).toBeGreaterThan(ranked[1].result.qualityScore.overall);
    });
  });
});
