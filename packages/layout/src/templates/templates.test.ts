/**
 * Template Agent Tests
 *
 * Tests for infinite template generation system
 */

import { describe, it, expect } from "vitest";
import { TemplateAgent, TemplateGenerator, TemplateValidator, TemplateRanker, createTemplateAgent, BASE_LAYOUTS, calculateTemplatePossibilities } from "./index.js";
import type { ContentProfile, TemplateVariant } from "./types.js";

describe("Template Agent", () => {
  describe("TemplateGenerator", () => {
    const generator = new TemplateGenerator();

    it("should generate templates for content", () => {
      const result = generator.generate({
        itemCount: 3,
        hasMedia: false,
        hasData: false,
        hasQuotes: false,
      });

      expect(result.templates.length).toBeGreaterThan(0);
      expect(result.combinationsExplored).toBeGreaterThan(0);
    });

    it("should respect maxTemplates limit", () => {
      const result = generator.generate({
        itemCount: 3,
        hasMedia: false,
        hasData: false,
        hasQuotes: false,
        maxTemplates: 5,
      });

      expect(result.templates.length).toBeLessThanOrEqual(5);
    });

    it("should filter by content capacity", () => {
      const result = generator.generate({
        itemCount: 10, // High content count
        hasMedia: false,
        hasData: false,
        hasQuotes: false,
      });

      // All templates should support 10 items
      result.templates.forEach((t: TemplateVariant) => {
        expect(t.maxItems).toBeGreaterThanOrEqual(10);
      });
    });

    it("should generate content-specific templates", () => {
      const profile: ContentProfile = {
        textBlocks: 1,
        bulletLists: 1,
        dataPoints: 3,
        mediaCount: 0,
        hasQuote: false,
        hasCTA: false,
        contentWeight: 300,
      };

      const result = generator.generateForContent(profile);

      expect(result.templates.length).toBeGreaterThan(0);
      // Data-heavy profile should get data-supporting templates
      const dataTemplates = result.templates.filter((t: TemplateVariant) => t.supportsData);
      expect(dataTemplates.length).toBeGreaterThan(0);
    });

    it("should calculate possibility count", () => {
      const count = generator.getPossibilityCount();
      expect(count).toBeGreaterThan(1000); // Should have thousands of combinations
    });
  });

  describe("TemplateValidator", () => {
    const validator = new TemplateValidator();

    it("should validate good templates", () => {
      const template = {
        id: "test-good",
        baseLayout: "center_focus" as const,
        density: "medium" as const,
        emphasis: "balanced" as const,
        mediaStrategy: "none" as const,
        spacing: "balanced" as const,
        minItems: 1,
        maxItems: 3,
        supportsMedia: false,
        supportsData: false,
        styleTokens: {
          paddingMultiplier: 1.0,
          gapMultiplier: 1.0,
          fontScale: 1.0,
        },
        layoutRules: "center_focus",
      };

      const result = validator.validate(template);

      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(50);
    });

    it("should reject invalid layout-media combinations", () => {
      const template = {
        id: "test-bad",
        baseLayout: "center_focus" as const,
        density: "medium" as const,
        emphasis: "balanced" as const,
        mediaStrategy: "grid" as const, // Invalid: center_focus doesn't support grid
        spacing: "balanced" as const,
        minItems: 1,
        maxItems: 3,
        supportsMedia: false,
        supportsData: false,
        styleTokens: {
          paddingMultiplier: 1.0,
          gapMultiplier: 1.0,
          fontScale: 1.0,
        },
        layoutRules: "center_focus",
      };

      const result = validator.validate(template);

      expect(result.valid).toBe(false);
      expect(result.failures.length).toBeGreaterThan(0);
    });

    it("should filter valid templates", () => {
      const templates = [
        {
          id: "good",
          baseLayout: "center_focus" as const,
          density: "medium" as const,
          emphasis: "balanced" as const,
          mediaStrategy: "none" as const,
          spacing: "balanced" as const,
          minItems: 1,
          maxItems: 3,
          supportsMedia: false,
          supportsData: false,
          styleTokens: {
            paddingMultiplier: 1.0,
            gapMultiplier: 1.0,
            fontScale: 1.0,
          },
          layoutRules: "center_focus",
        },
        {
          id: "bad",
          baseLayout: "center_focus" as const,
          density: "medium" as const,
          emphasis: "balanced" as const,
          mediaStrategy: "grid" as const,
          spacing: "balanced" as const,
          minItems: 1,
          maxItems: 3,
          supportsMedia: false,
          supportsData: false,
          styleTokens: {
            paddingMultiplier: 1.0,
            gapMultiplier: 1.0,
            fontScale: 1.0,
          },
          layoutRules: "center_focus",
        },
      ];

      const valid = validator.filterValid(templates);

      expect(valid.length).toBe(1);
      expect(valid[0].id).toBe("good");
    });

    it("should validate templates", () => {
      const template = {
        id: "test-good",
        baseLayout: "center_focus" as const,
        density: "medium" as const,
        emphasis: "balanced" as const,
        mediaStrategy: "none" as const,
        spacing: "balanced" as const,
        minItems: 1,
        maxItems: 3,
        supportsMedia: false,
        supportsData: false,
        styleTokens: {
          paddingMultiplier: 1.0,
          gapMultiplier: 1.0,
          fontScale: 1.0,
        },
        layoutRules: "center_focus",
      };

      const result = validator.validate(template);
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(50);
    });
  });

  describe("TemplateRanker", () => {
    const ranker = new TemplateRanker();

    it("should rank templates by content fit", () => {
      const templates = [
        {
          id: "perfect-fit",
          baseLayout: "center_focus" as const,
          density: "medium" as const,
          emphasis: "text" as const,
          mediaStrategy: "none" as const,
          spacing: "balanced" as const,
          minItems: 1,
          maxItems: 3,
          supportsMedia: false,
          supportsData: false,
          styleTokens: {
            paddingMultiplier: 1.0,
            gapMultiplier: 1.0,
            fontScale: 1.0,
          },
          layoutRules: "center_focus",
          qualityScore: 90,
        },
        {
          id: "poor-fit",
          baseLayout: "grid_2x2" as const,
          density: "high" as const,
          emphasis: "data" as const,
          mediaStrategy: "inline" as const,
          spacing: "tight" as const,
          minItems: 4,
          maxItems: 8,
          supportsMedia: true,
          supportsData: true,
          styleTokens: {
            paddingMultiplier: 0.7,
            gapMultiplier: 0.7,
            fontScale: 0.9,
          },
          layoutRules: "grid_2x2",
          qualityScore: 70,
        },
      ];

      const profile: ContentProfile = {
        textBlocks: 2,
        bulletLists: 0,
        dataPoints: 0,
        mediaCount: 0,
        hasQuote: false,
        hasCTA: false,
        contentWeight: 150,
      };

      const ranked = ranker.rank(templates, profile);

      expect(ranked.length).toBeGreaterThanOrEqual(1); // At least 1 template passes filters
      expect(ranked[0].rank).toBe(1);
      // Perfect fit should rank higher
      expect(ranked[0].template.id).toBe("perfect-fit");
    });

    it("should select best template", () => {
      const templates = [
        {
          id: "good",
          baseLayout: "center_focus" as const,
          density: "medium" as const,
          emphasis: "balanced" as const,
          mediaStrategy: "none" as const,
          spacing: "balanced" as const,
          minItems: 1,
          maxItems: 3,
          supportsMedia: false,
          supportsData: false,
          styleTokens: {
            paddingMultiplier: 1.0,
            gapMultiplier: 1.0,
            fontScale: 1.0,
          },
          layoutRules: "center_focus",
          qualityScore: 85,
        },
        {
          id: "better",
          baseLayout: "center_focus" as const,
          density: "low" as const,
          emphasis: "text" as const,
          mediaStrategy: "none" as const,
          spacing: "airy" as const,
          minItems: 1,
          maxItems: 3,
          supportsMedia: false,
          supportsData: false,
          styleTokens: {
            paddingMultiplier: 1.5,
            gapMultiplier: 1.5,
            fontScale: 1.1,
          },
          layoutRules: "center_focus",
          qualityScore: 95,
        },
      ];

      const profile: ContentProfile = {
        textBlocks: 2,
        bulletLists: 0,
        dataPoints: 0,
        mediaCount: 0,
        hasQuote: false,
        hasCTA: false,
        contentWeight: 200,
      };

      const best = ranker.selectBest(templates, profile);

      expect(best).not.toBeNull();
      expect(best!.template.id).toBe("better");
    });

    it("should provide layout recommendations", () => {
      const profile: ContentProfile = {
        textBlocks: 1,
        bulletLists: 0,
        dataPoints: 3,
        mediaCount: 0,
        hasQuote: false,
        hasCTA: false,
        contentWeight: 100,
      };

      const recommendations = ranker.getRecommendations(profile);

      expect(recommendations.length).toBeGreaterThan(0);
      // Data-heavy content should recommend stat_highlight
      const statRec = recommendations.find((r: { baseLayout: string }) => r.baseLayout === "stat_highlight");
      expect(statRec).toBeDefined();
    });
  });

  describe("TemplateAgent Integration", () => {
    it("should create agent with presets", () => {
      const fastAgent = createTemplateAgent("fast");
      const qualityAgent = createTemplateAgent("quality");

      expect(fastAgent.getConfig().maxTemplates).toBe(20);
      expect(qualityAgent.getConfig().maxTemplates).toBe(100);
    });

    it("should generate and select templates end-to-end", () => {
      const agent = new TemplateAgent({ maxTemplates: 20 });

      const profile: ContentProfile = {
        textBlocks: 1,
        bulletLists: 1,
        dataPoints: 0,
        mediaCount: 1,
        hasQuote: false,
        hasCTA: false,
        contentWeight: 250,
      };

      // Generate templates
      const result = agent.generateForContent(profile);

      expect(result.templates.length).toBeGreaterThan(0);
      expect(result.validatedCount).toBeGreaterThan(0);

      // Select best
      const best = agent.selectBest(result.templates, profile);

      expect(best).not.toBeNull();
      expect(best!.template.supportsMedia).toBe(true); // Should support media
    });

    it("should cache templates", () => {
      const agent = new TemplateAgent({ maxTemplates: 10 });

      const profile: ContentProfile = {
        textBlocks: 1,
        bulletLists: 0,
        dataPoints: 0,
        mediaCount: 0,
        hasQuote: false,
        hasCTA: false,
        contentWeight: 100,
      };

      // First call generates
      const result1 = agent.generateForContent(profile);
      expect(result1.duration).toBeGreaterThan(0);

      // Second call should be cached (duration 0)
      const result2 = agent.generateForContent(profile);
      expect(result2.duration).toBe(0);

      // Cache should have entry
      const stats = agent.getCacheStats();
      expect(stats.size).toBe(1);
    });

    it("should prewarm cache", () => {
      const agent = new TemplateAgent({ maxTemplates: 10 });

      agent.prewarmCache();

      const stats = agent.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
    });

    it("should quick-select template", () => {
      const agent = createTemplateAgent("fast");

      const profile: ContentProfile = {
        textBlocks: 2,
        bulletLists: 0,
        dataPoints: 0,
        mediaCount: 0,
        hasQuote: false,
        hasCTA: true,
        contentWeight: 150,
      };

      const best = agent.quickSelect(profile);

      expect(best).not.toBeNull();
      expect(best!.score.overall).toBeGreaterThan(0);
    });

    it("should update configuration", () => {
      const agent = new TemplateAgent({ maxTemplates: 10 });

      expect(agent.getConfig().maxTemplates).toBe(10);

      agent.updateConfig({ maxTemplates: 50 });

      expect(agent.getConfig().maxTemplates).toBe(50);
    });
  });

  describe("Template Primitives", () => {
    it("should have 9 base layouts", () => {
      expect(BASE_LAYOUTS.length).toBe(9);
    });

    it("should calculate many template possibilities", () => {
      const count = calculateTemplatePossibilities();
      expect(count).toBeGreaterThan(1000);
    });
  });
});
