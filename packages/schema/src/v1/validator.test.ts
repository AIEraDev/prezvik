/**
 * Unit tests for Validation Layer
 */

import { describe, it, expect } from "vitest";
import { validateBlueprint, validateSlide, validateContentBlock } from "./validator.js";

describe("Validation Layer", () => {
  describe("validateBlueprint", () => {
    it("should validate a minimal valid Blueprint v2 structure", () => {
      const minimalBlueprint = {
        version: "2.0",
        meta: {
          title: "Test Presentation",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "s1",
            type: "hero",
            intent: "Introduce topic",
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Test Title",
                level: "h1",
              },
            ],
          },
        ],
      };

      const result = validateBlueprint(minimalBlueprint);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.version).toBe("2.0");
      expect(result.data?.slides).toHaveLength(1);
      expect(result.errors).toBeUndefined();
    });

    it("should validate a complex Blueprint with all content types", () => {
      const complexBlueprint = {
        version: "2.0",
        meta: {
          title: "Complex Presentation",
          subtitle: "A comprehensive test",
          author: "Test Author",
          audience: "Developers",
          goal: "educate",
          tone: "formal",
          language: "en",
        },
        theme: {
          name: "executive",
          primaryColor: "#2563EB",
          fontPairing: "Inter",
        },
        slides: [
          {
            id: "s1",
            type: "hero",
            intent: "Title slide",
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Main Title",
                level: "h1",
                emphasis: "high",
              },
              {
                type: "text",
                value: "Subtitle text",
                emphasis: "medium",
              },
            ],
          },
          {
            id: "s2",
            type: "content",
            intent: "Show bullet points",
            layout: "two_column",
            content: [
              {
                type: "heading",
                value: "Key Points",
                level: "h2",
              },
              {
                type: "bullets",
                items: [{ text: "First point", icon: "✓", highlight: true }, { text: "Second point" }, { text: "Third point", icon: "→" }],
              },
            ],
          },
          {
            id: "s3",
            type: "quote",
            intent: "Show testimonial",
            layout: "center_focus",
            content: [
              {
                type: "quote",
                text: "This is a great product",
                author: "John Doe",
                role: "CEO",
              },
            ],
          },
          {
            id: "s4",
            type: "data",
            intent: "Show statistics",
            layout: "grid_2x2",
            content: [
              {
                type: "stat",
                value: 1000,
                label: "Users",
                prefix: "+",
                visualWeight: "hero",
              },
              {
                type: "stat",
                value: "99%",
                label: "Uptime",
                suffix: " SLA",
                visualWeight: "emphasis",
              },
            ],
          },
          {
            id: "s5",
            type: "content",
            intent: "Show code example",
            layout: "center_focus",
            content: [
              {
                type: "code",
                code: 'console.log("Hello World");',
                language: "javascript",
              },
            ],
          },
        ],
      };

      const result = validateBlueprint(complexBlueprint);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.slides).toHaveLength(5);
      expect(result.errors).toBeUndefined();
    });

    it("should reject Blueprint with missing version field", () => {
      const invalidBlueprint = {
        meta: {
          title: "Test",
          goal: "inform",
          tone: "modern",
        },
        slides: [],
      };

      const result = validateBlueprint(invalidBlueprint);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
      expect(result.errors?.[0].path).toContain("version");
    });

    it("should reject Blueprint with wrong version value", () => {
      const invalidBlueprint = {
        version: "1.0",
        meta: {
          title: "Test",
          goal: "inform",
          tone: "modern",
        },
        slides: [],
      };

      const result = validateBlueprint(invalidBlueprint);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain("2.0");
    });

    it("should reject Blueprint with missing required meta fields", () => {
      const invalidBlueprint = {
        version: "2.0",
        meta: {
          title: "Test",
          // Missing goal and tone
        },
        slides: [],
      };

      const result = validateBlueprint(invalidBlueprint);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some((e) => e.path.includes("goal"))).toBe(true);
      expect(result.errors?.some((e) => e.path.includes("tone"))).toBe(true);
    });

    it("should reject Blueprint with invalid goal enum", () => {
      const invalidBlueprint = {
        version: "2.0",
        meta: {
          title: "Test",
          goal: "invalid_goal",
          tone: "modern",
        },
        slides: [],
      };

      const result = validateBlueprint(invalidBlueprint);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain("inform");
      expect(result.errors?.[0].message).toContain("persuade");
    });

    it("should reject Blueprint with invalid tone enum", () => {
      const invalidBlueprint = {
        version: "2.0",
        meta: {
          title: "Test",
          goal: "inform",
          tone: "invalid_tone",
        },
        slides: [],
      };

      const result = validateBlueprint(invalidBlueprint);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain("formal");
      expect(result.errors?.[0].message).toContain("modern");
    });

    it("should reject Blueprint with wrong type for fields", () => {
      const invalidBlueprint = {
        version: "2.0",
        meta: {
          title: 123, // Should be string
          goal: "inform",
          tone: "modern",
        },
        slides: [],
      };

      const result = validateBlueprint(invalidBlueprint);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain("Expected string");
    });
  });

  describe("validateSlide", () => {
    it("should validate a valid slide", () => {
      const validSlide = {
        id: "s1",
        type: "hero",
        intent: "Introduce topic",
        layout: "center_focus",
        content: [
          {
            type: "heading",
            value: "Test Title",
          },
        ],
      };

      const result = validateSlide(validSlide);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe("s1");
    });

    it("should reject slide with invalid type enum", () => {
      const invalidSlide = {
        id: "s1",
        type: "invalid_type",
        intent: "Test",
        layout: "center_focus",
        content: [],
      };

      const result = validateSlide(invalidSlide);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain("hero");
      expect(result.errors?.[0].message).toContain("section");
    });

    it("should reject slide with invalid layout enum", () => {
      const invalidSlide = {
        id: "s1",
        type: "hero",
        intent: "Test",
        layout: "invalid_layout",
        content: [],
      };

      const result = validateSlide(invalidSlide);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain("center_focus");
      expect(result.errors?.[0].message).toContain("two_column");
    });

    it("should reject slide with missing required fields", () => {
      const invalidSlide = {
        id: "s1",
        type: "hero",
        // Missing intent, layout, content
      };

      const result = validateSlide(invalidSlide);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe("validateContentBlock", () => {
    it("should validate heading content block", () => {
      const heading = {
        type: "heading",
        value: "Test Heading",
        level: "h1",
        emphasis: "high",
      };

      const result = validateContentBlock(heading);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.type).toBe("heading");
    });

    it("should validate text content block", () => {
      const text = {
        type: "text",
        value: "Test text content",
        emphasis: "medium",
      };

      const result = validateContentBlock(text);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.type).toBe("text");
    });

    it("should validate bullets content block", () => {
      const bullets = {
        type: "bullets",
        items: [{ text: "First item", icon: "✓", highlight: true }, { text: "Second item" }],
      };

      const result = validateContentBlock(bullets);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.type).toBe("bullets");
    });

    it("should validate quote content block", () => {
      const quote = {
        type: "quote",
        text: "This is a quote",
        author: "John Doe",
        role: "CEO",
      };

      const result = validateContentBlock(quote);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.type).toBe("quote");
    });

    it("should validate stat content block", () => {
      const stat = {
        type: "stat",
        value: 1000,
        label: "Users",
        prefix: "+",
        suffix: "%",
        visualWeight: "hero",
      };

      const result = validateContentBlock(stat);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.type).toBe("stat");
    });

    it("should validate code content block", () => {
      const code = {
        type: "code",
        code: 'console.log("test");',
        language: "javascript",
      };

      const result = validateContentBlock(code);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.type).toBe("code");
    });

    it("should reject content block with invalid discriminator", () => {
      const invalid = {
        type: "invalid_type",
        value: "Test",
      };

      const result = validateContentBlock(invalid);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain("Invalid discriminator");
    });

    it("should reject heading with missing value", () => {
      const invalid = {
        type: "heading",
        level: "h1",
      };

      const result = validateContentBlock(invalid);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should reject bullets with missing items", () => {
      const invalid = {
        type: "bullets",
      };

      const result = validateContentBlock(invalid);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should reject stat with missing required fields", () => {
      const invalid = {
        type: "stat",
        value: 100,
        // Missing label
      };

      const result = validateContentBlock(invalid);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe("formatZodError", () => {
    it("should format error with readable field paths", () => {
      const invalidData = {
        version: "1.0",
        meta: {
          title: "Test",
          goal: "inform",
          tone: "modern",
        },
        slides: [],
      };

      const result = validateBlueprint(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].path).toEqual(["version"]);
      expect(result.errors?.[0].message).toContain("2.0");
    });

    it("should format nested field paths", () => {
      const invalidData = {
        version: "2.0",
        meta: {
          title: 123, // Wrong type
          goal: "inform",
          tone: "modern",
        },
        slides: [],
      };

      const result = validateBlueprint(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].path).toEqual(["meta", "title"]);
      expect(result.errors?.[0].message).toContain("string");
    });

    it("should include error codes for programmatic handling", () => {
      const invalidData = {
        version: "2.0",
        meta: {
          title: "Test",
          goal: "inform",
          tone: "modern",
        },
        slides: "not_an_array", // Wrong type
      };

      const result = validateBlueprint(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].code).toBeDefined();
      expect(result.errors?.[0].code).toBe("invalid_type");
    });

    it("should generate actionable messages for enum errors", () => {
      const invalidData = {
        version: "2.0",
        meta: {
          title: "Test",
          goal: "invalid_goal",
          tone: "modern",
        },
        slides: [],
      };

      const result = validateBlueprint(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain("Must be one of");
      expect(result.errors?.[0].message).toContain("inform");
    });

    it("should generate actionable messages for type errors", () => {
      const invalidData = {
        version: "2.0",
        meta: {
          title: 123,
          goal: "inform",
          tone: "modern",
        },
        slides: [],
      };

      const result = validateBlueprint(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain("Expected string");
      expect(result.errors?.[0].message).toContain("received number");
    });
  });
});
