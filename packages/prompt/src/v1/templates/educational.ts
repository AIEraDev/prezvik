/**
 * Educational Template
 *
 * Generates Blueprint IR for educational content
 */

import type { PrezVikBlueprint } from "@prezvik/schema";
import type { Intent } from "../intent-detector.js";

export function educationalTemplate(intent: Intent): PrezVikBlueprint {
  return {
    version: "2.0",

    meta: {
      title: intent.topic,
      language: "en",
      goal: "educate",
      tone: intent.tone,
      audience: "learners",
    },

    theme: {
      name: "prezvik_modern",
    },

    slides: [
      // Slide 1: Title
      {
        id: "s1",
        type: "hero",
        intent: "Introduce the topic",
        layout: "center_focus",
        content: [
          {
            type: "heading",
            value: intent.topic,
            level: "h1",
            emphasis: "high",
          },
          {
            type: "text",
            value: "A comprehensive guide",
          },
        ],
      },

      // Slide 2: Overview
      {
        id: "s2",
        type: "content",
        intent: "Provide overview of what will be covered",
        layout: "two_column",
        content: [
          {
            type: "heading",
            value: "What You'll Learn",
            level: "h2",
            emphasis: "high",
          },
          {
            type: "bullets",
            items: [
              { text: "Core concepts and fundamentals", icon: "📚" },
              { text: "Practical applications", icon: "🛠️" },
              { text: "Best practices", icon: "✨" },
            ],
          },
        ],
      },

      // Slide 3: Key Concepts
      {
        id: "s3",
        type: "content",
        intent: "Explain main concepts",
        layout: "two_column",
        content: [
          {
            type: "heading",
            value: "Key Concepts",
            level: "h2",
            emphasis: "high",
          },
          {
            type: "bullets",
            items: [{ text: "Foundation principles" }, { text: "Important terminology" }, { text: "Core frameworks" }],
          },
        ],
      },

      // Slide 4: Examples
      {
        id: "s4",
        type: "content",
        intent: "Show practical examples",
        layout: "two_column",
        content: [
          {
            type: "heading",
            value: "Practical Examples",
            level: "h2",
            emphasis: "high",
          },
          {
            type: "bullets",
            items: [
              { text: "Real-world use cases", icon: "🌍" },
              { text: "Step-by-step walkthroughs", icon: "👣" },
              { text: "Common patterns", icon: "🎯" },
            ],
          },
        ],
      },

      // Slide 5: Next Steps
      {
        id: "s5",
        type: "closing",
        intent: "Guide learners on next steps",
        layout: "center_focus",
        content: [
          {
            type: "heading",
            value: "Keep Learning",
            level: "h1",
            emphasis: "high",
          },
          {
            type: "bullets",
            items: [{ text: "Practice with exercises" }, { text: "Explore advanced topics" }, { text: "Join the community" }],
          },
        ],
      },
    ],
  };
}
