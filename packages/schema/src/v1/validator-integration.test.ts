/**
 * Integration tests for Validation Layer
 * Tests real-world scenarios and edge cases
 */

import { describe, it, expect } from "vitest";
import { validateBlueprint } from "./validator.js";

describe("Validation Layer Integration", () => {
  it("should validate a complete real-world Blueprint", () => {
    const realWorldBlueprint = {
      version: "2.0",
      meta: {
        title: "Q4 2024 Product Roadmap",
        subtitle: "Strategic Planning Session",
        author: "Product Team",
        audience: "Executive Leadership",
        goal: "persuade",
        tone: "formal",
        language: "en",
      },
      theme: {
        name: "executive",
        primaryColor: "#1E40AF",
        fontPairing: "Inter",
      },
      slides: [
        {
          id: "slide-1",
          type: "hero",
          intent: "Introduce the roadmap presentation",
          layout: "center_focus",
          content: [
            {
              type: "heading",
              value: "Q4 2024 Product Roadmap",
              level: "h1",
              emphasis: "high",
            },
            {
              type: "text",
              value: "Strategic Planning Session",
              emphasis: "medium",
            },
          ],
        },
        {
          id: "slide-2",
          type: "section",
          intent: "Introduce key initiatives section",
          layout: "center_focus",
          content: [
            {
              type: "heading",
              value: "Key Initiatives",
              level: "h1",
            },
          ],
        },
        {
          id: "slide-3",
          type: "content",
          intent: "List major features planned for Q4",
          layout: "two_column",
          content: [
            {
              type: "heading",
              value: "Major Features",
              level: "h2",
            },
            {
              type: "bullets",
              items: [
                {
                  text: "AI-powered search",
                  icon: "🔍",
                  highlight: true,
                },
                {
                  text: "Real-time collaboration",
                  icon: "👥",
                  highlight: true,
                },
                {
                  text: "Advanced analytics dashboard",
                  icon: "📊",
                },
                {
                  text: "Mobile app redesign",
                  icon: "📱",
                },
              ],
            },
          ],
        },
        {
          id: "slide-4",
          type: "data",
          intent: "Show key metrics and targets",
          layout: "grid_2x2",
          content: [
            {
              type: "stat",
              value: "50K",
              label: "Target Users",
              prefix: "+",
              visualWeight: "hero",
            },
            {
              type: "stat",
              value: "99.9",
              label: "Uptime SLA",
              suffix: "%",
              visualWeight: "emphasis",
            },
            {
              type: "stat",
              value: 25,
              label: "New Features",
              visualWeight: "normal",
            },
            {
              type: "stat",
              value: "Q4",
              label: "Launch Target",
              visualWeight: "normal",
            },
          ],
        },
        {
          id: "slide-5",
          type: "quote",
          intent: "Share customer feedback",
          layout: "center_focus",
          content: [
            {
              type: "quote",
              text: "This platform has transformed how our team collaborates",
              author: "Sarah Johnson",
              role: "VP of Engineering, TechCorp",
            },
          ],
        },
        {
          id: "slide-6",
          type: "closing",
          intent: "Call to action and next steps",
          layout: "center_focus",
          content: [
            {
              type: "heading",
              value: "Next Steps",
              level: "h1",
            },
            {
              type: "bullets",
              items: [{ text: "Review and approve roadmap" }, { text: "Allocate resources" }, { text: "Set milestone dates" }],
            },
          ],
        },
      ],
    };

    const result = validateBlueprint(realWorldBlueprint);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.slides).toHaveLength(6);
    expect(result.errors).toBeUndefined();
  });

  it("should provide clear error messages for common mistakes", () => {
    const blueprintWithMistakes = {
      version: "2.0",
      meta: {
        title: "Test",
        goal: "sell", // Invalid enum value
        tone: "modern",
      },
      slides: [
        {
          id: "s1",
          type: "hero",
          intent: "Test",
          layout: "invalid_layout", // Invalid enum value
          content: [
            {
              type: "heading",
              // Missing required 'value' field
              level: "h1",
            },
          ],
        },
      ],
    };

    const result = validateBlueprint(blueprintWithMistakes);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);

    // Check that errors are actionable
    const errorMessages = result.errors!.map((e) => e.message);
    expect(errorMessages.some((msg) => msg.includes("goal"))).toBe(true);
    expect(errorMessages.some((msg) => msg.includes("layout"))).toBe(true);
    expect(errorMessages.some((msg) => msg.includes("value"))).toBe(true);
  });

  it("should handle deeply nested validation errors", () => {
    const blueprintWithNestedErrors = {
      version: "2.0",
      meta: {
        title: "Test",
        goal: "inform",
        tone: "modern",
      },
      slides: [
        {
          id: "s1",
          type: "content",
          intent: "Test",
          layout: "two_column",
          content: [
            {
              type: "bullets",
              items: [
                {
                  text: "Valid item",
                },
                {
                  // Missing required 'text' field
                  icon: "✓",
                },
              ],
            },
          ],
        },
      ],
    };

    const result = validateBlueprint(blueprintWithNestedErrors);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();

    // Check that the error path is clear
    const error = result.errors![0];
    expect(error.path.length).toBeGreaterThan(2);
    expect(error.path.join(".")).toContain("slides");
    expect(error.path.join(".")).toContain("content");
  });

  it("should validate all slide types", () => {
    const allSlideTypes = ["hero", "section", "content", "comparison", "grid", "quote", "data", "callout", "closing"];

    allSlideTypes.forEach((slideType) => {
      const blueprint = {
        version: "2.0",
        meta: {
          title: "Test",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "s1",
            type: slideType,
            intent: `Test ${slideType} slide`,
            layout: "center_focus",
            content: [
              {
                type: "heading",
                value: "Test",
              },
            ],
          },
        ],
      };

      const result = validateBlueprint(blueprint);
      expect(result.success).toBe(true);
    });
  });

  it("should validate all layout types", () => {
    const layoutConfig: Record<string, number> = {
      center_focus: 1,
      two_column: 2,
      three_column: 3,
      split_screen: 2,
      grid_2x2: 4,
      hero_overlay: 1,
      timeline: 3,
      stat_highlight: 2,
      image_dominant: 1,
    };

    Object.entries(layoutConfig).forEach(([layoutType, contentCount]) => {
      const blueprint = {
        version: "2.0",
        meta: {
          title: "Test",
          goal: "inform",
          tone: "modern",
        },
        slides: [
          {
            id: "s1",
            type: "content",
            intent: `Test ${layoutType} layout`,
            layout: layoutType,
            content: Array.from({ length: contentCount }, (_, i) => ({
              type: "heading" as const,
              value: `Test ${i + 1}`,
            })),
          },
        ],
      };

      const result = validateBlueprint(blueprint);
      expect(result.success).toBe(true);
    });
  });
});
