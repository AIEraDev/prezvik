/**
 * Blueprint Generator Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { BlueprintGenerator, BlueprintGenerationError } from "./generator.js";
import type { KyroAI } from "../kyro-ai.js";

// Mock KyroAI
const createMockKyroAI = (): KyroAI => {
  return {
    generateSlideDeck: vi.fn(),
    enhanceContent: vi.fn(),
    generateTheme: vi.fn(),
    summarize: vi.fn(),
    scoreContent: vi.fn(),
    getAvailableProviders: vi.fn(),
    isAvailable: vi.fn(),
    setDefaultProvider: vi.fn(),
  } as any;
};

describe("BlueprintGenerator", () => {
  let mockKyroAI: KyroAI;
  let generator: BlueprintGenerator;

  beforeEach(() => {
    mockKyroAI = createMockKyroAI();
    generator = new BlueprintGenerator(mockKyroAI);
  });

  describe("inferMeta", () => {
    it("should infer goal from prompt keywords", () => {
      const testCases = [
        { prompt: "Create a pitch deck for our startup", expectedGoal: "pitch" },
        { prompt: "Make a presentation to persuade investors", expectedGoal: "persuade" },
        { prompt: "Generate a training deck to teach employees", expectedGoal: "educate" },
        { prompt: "Create a report on Q4 sales results", expectedGoal: "report" },
        { prompt: "Make a presentation about AI", expectedGoal: "inform" },
      ];

      for (const { prompt, expectedGoal } of testCases) {
        const meta = generator.inferMeta(prompt);
        expect(meta.goal).toBe(expectedGoal);
      }
    });

    it("should infer tone from prompt keywords", () => {
      const testCases = [
        { prompt: "Create a formal corporate presentation", expectedTone: "formal" },
        { prompt: "Make a bold and striking pitch deck", expectedTone: "bold" },
        { prompt: "Generate a minimal and clean design", expectedTone: "minimal" },
        { prompt: "Create a friendly and casual presentation", expectedTone: "friendly" },
        { prompt: "Make a presentation about AI", expectedTone: "modern" },
      ];

      for (const { prompt, expectedTone } of testCases) {
        const meta = generator.inferMeta(prompt);
        expect(meta.tone).toBe(expectedTone);
      }
    });

    it("should extract audience from prompt", () => {
      const testCases = [
        { prompt: "Create a presentation for educators", expectedAudience: "educators" },
        { prompt: "Make a pitch to investors", expectedAudience: "investors" },
        { prompt: "Generate slides for the sales team", expectedAudience: "the sales team" },
      ];

      for (const { prompt, expectedAudience } of testCases) {
        const meta = generator.inferMeta(prompt);
        expect(meta.audience).toBe(expectedAudience);
      }
    });

    it("should generate title from prompt", () => {
      const meta = generator.inferMeta("Create a presentation about AI in education");
      expect(meta.title).toBe("Create a presentation about AI in education");
    });

    it("should truncate long titles", () => {
      const longPrompt = "Create a very long presentation title that exceeds fifty characters and should be truncated";
      const meta = generator.inferMeta(longPrompt);
      expect(meta.title?.length).toBeLessThanOrEqual(53); // 50 + "..."
      expect(meta.title).toContain("...");
    });
  });

  describe("parseResponse", () => {
    it("should parse valid Blueprint JSON", () => {
      const validJSON = JSON.stringify({
        version: "2.0",
        meta: {
          title: "Test",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "s1",
            type: "hero",
            intent: "Test slide",
            layout: "center_focus",
            content: [{ type: "heading", value: "Test", level: "h1" }],
          },
        ],
      });

      const blueprint = generator.parseResponse(validJSON);
      expect(blueprint.version).toBe("2.0");
      expect(blueprint.slides).toHaveLength(1);
    });

    it("should extract JSON from markdown code blocks", () => {
      const markdownJSON = `\`\`\`json
{
  "version": "2.0",
  "meta": {
    "title": "Test",
    "goal": "inform",
    "tone": "modern"
  },
  "slides": [
    {
      "id": "slide-1",
      "type": "hero",
      "intent": "Test",
      "layout": "center_focus",
      "content": [{ "type": "heading", "value": "Test", "level": "h1", "emphasis": "high" }]
    }
  ]
}
\`\`\``;

      const blueprint = generator.parseResponse(markdownJSON);
      expect(blueprint.version).toBe("2.0");
    });

    it("should throw error for malformed JSON", () => {
      const malformedJSON = "{ invalid json }";

      expect(() => generator.parseResponse(malformedJSON)).toThrow(BlueprintGenerationError);
    });

    it("should throw error for missing version field", () => {
      const invalidBlueprint = JSON.stringify({
        meta: { title: "Test" },
        slides: [],
      });

      expect(() => generator.parseResponse(invalidBlueprint)).toThrow(BlueprintGenerationError);
      expect(() => generator.parseResponse(invalidBlueprint)).toThrow(/version/);
    });

    it("should throw error for incorrect version", () => {
      const invalidBlueprint = JSON.stringify({
        version: "1.0",
        meta: { title: "Test" },
        slides: [],
      });

      expect(() => generator.parseResponse(invalidBlueprint)).toThrow(BlueprintGenerationError);
      expect(() => generator.parseResponse(invalidBlueprint)).toThrow(/version/);
    });

    it("should throw error for missing meta field", () => {
      const invalidBlueprint = JSON.stringify({
        version: "2.0",
        slides: [],
      });

      expect(() => generator.parseResponse(invalidBlueprint)).toThrow(BlueprintGenerationError);
      expect(() => generator.parseResponse(invalidBlueprint)).toThrow(/meta/);
    });

    it("should throw error for missing slides field", () => {
      const invalidBlueprint = JSON.stringify({
        version: "2.0",
        meta: { title: "Test", goal: "inform", tone: "modern" },
      });

      expect(() => generator.parseResponse(invalidBlueprint)).toThrow(BlueprintGenerationError);
      expect(() => generator.parseResponse(invalidBlueprint)).toThrow(/slides/);
    });

    it("should throw error for non-array slides field", () => {
      const invalidBlueprint = JSON.stringify({
        version: "2.0",
        meta: { title: "Test", goal: "inform", tone: "modern" },
        slides: "not an array",
      });

      expect(() => generator.parseResponse(invalidBlueprint)).toThrow(BlueprintGenerationError);
      expect(() => generator.parseResponse(invalidBlueprint)).toThrow(/slides/);
    });
  });

  describe("generate", () => {
    it("should generate Blueprint from prompt", async () => {
      const mockResponse = JSON.stringify({
        version: "2.0",
        meta: {
          title: "AI in Education",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "s1",
            type: "hero",
            intent: "Introduce topic",
            layout: "center_focus",
            content: [{ type: "heading", value: "AI in Education", level: "h1" }],
          },
        ],
      });

      vi.mocked(mockKyroAI.generateSlideDeck).mockResolvedValue(mockResponse);

      const blueprint = await generator.generate("Create a presentation about AI in education");

      expect(blueprint.version).toBe("2.0");
      expect(blueprint.slides).toHaveLength(1);
      expect(mockKyroAI.generateSlideDeck).toHaveBeenCalled();
    });

    it("should merge inferred meta with generated meta", async () => {
      const mockResponse = JSON.stringify({
        version: "2.0",
        meta: {
          title: "Generated Title",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "slide-1",
            type: "hero",
            intent: "Test slide",
            layout: "center_focus",
            content: [{ type: "heading", value: "Test", level: "h1", emphasis: "high" }],
          },
        ],
      });

      vi.mocked(mockKyroAI.generateSlideDeck).mockResolvedValue(mockResponse);

      const blueprint = await generator.generate("Create a pitch deck for investors");

      // Inferred goal should be "pitch", but generated is "inform"
      // Generated meta should take precedence
      expect(blueprint.meta.goal).toBe("inform");
    });

    it("should pass provider option to KyroAI", async () => {
      const mockResponse = JSON.stringify({
        version: "2.0",
        meta: { title: "Test", goal: "inform", tone: "modern" },
        slides: [
          {
            id: "slide-1",
            type: "hero",
            intent: "Test slide",
            layout: "center_focus",
            content: [{ type: "heading", value: "Test", level: "h1", emphasis: "high" }],
          },
        ],
      });

      vi.mocked(mockKyroAI.generateSlideDeck).mockResolvedValue(mockResponse);

      await generator.generate("Test prompt", { provider: "openai" });

      expect(mockKyroAI.generateSlideDeck).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ provider: "openai" }));
    });

    it("should pass strategy option to KyroAI", async () => {
      const mockResponse = JSON.stringify({
        version: "2.0",
        meta: { title: "Test", goal: "inform", tone: "modern" },
        slides: [
          {
            id: "slide-1",
            type: "hero",
            intent: "Test slide",
            layout: "center_focus",
            content: [{ type: "heading", value: "Test", level: "h1", emphasis: "high" }],
          },
        ],
      });

      vi.mocked(mockKyroAI.generateSlideDeck).mockResolvedValue(mockResponse);

      await generator.generate("Test prompt", { strategy: "quality" });

      expect(mockKyroAI.generateSlideDeck).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ strategy: "quality" }));
    });

    it("should throw BlueprintGenerationError on AI failure", async () => {
      vi.mocked(mockKyroAI.generateSlideDeck).mockRejectedValue(new Error("API error"));

      await expect(generator.generate("Test prompt")).rejects.toThrow(BlueprintGenerationError);
    });

    it("should throw BlueprintGenerationError on parse failure", async () => {
      vi.mocked(mockKyroAI.generateSlideDeck).mockResolvedValue("invalid json");

      await expect(generator.generate("Test prompt")).rejects.toThrow(BlueprintGenerationError);
    });
  });

  describe("buildSystemPrompt", () => {
    it("should include Blueprint v2 schema definition", () => {
      const prompt = generator.buildSystemPrompt();
      expect(prompt).toContain("Blueprint v2");
      expect(prompt).toContain("version");
      expect(prompt).toContain("2.0");
    });

    it("should include slide types", () => {
      const prompt = generator.buildSystemPrompt();
      expect(prompt).toContain("hero");
      expect(prompt).toContain("content");
      expect(prompt).toContain("section");
    });

    it("should include layout types", () => {
      const prompt = generator.buildSystemPrompt();
      expect(prompt).toContain("center_focus");
      expect(prompt).toContain("two_column");
      expect(prompt).toContain("grid_2x2");
    });

    it("should include content block types", () => {
      const prompt = generator.buildSystemPrompt();
      expect(prompt).toContain("heading");
      expect(prompt).toContain("text");
      expect(prompt).toContain("bullets");
      expect(prompt).toContain("quote");
      expect(prompt).toContain("stat");
      expect(prompt).toContain("code");
    });

    it("should include example output", () => {
      const prompt = generator.buildSystemPrompt();
      expect(prompt).toContain("EXAMPLE OUTPUT");
      expect(prompt).toContain('"version": "2.0"');
    });

    it("should specify JSON-only output", () => {
      const prompt = generator.buildSystemPrompt();
      expect(prompt).toContain("ONLY valid JSON");
      expect(prompt).toContain("no markdown");
    });
  });
});
