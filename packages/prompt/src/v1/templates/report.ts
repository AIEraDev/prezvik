/**
 * Report Template
 *
 * Generates Blueprint IR for reports
 */

import type { KyroBlueprint } from "@kyro/schema";
import type { Intent } from "../intent-detector.js";

export function reportTemplate(intent: Intent): KyroBlueprint {
  return {
    version: "2.0",

    meta: {
      title: intent.topic,
      language: "en",
      goal: "report",
      tone: intent.tone,
      audience: "stakeholders",
    },

    theme: {
      name: "kyro_executive",
    },

    slides: [
      // Slide 1: Title
      {
        id: "s1",
        type: "hero",
        intent: "Introduce the report",
        layout: "center_focus",
        content: [
          {
            type: "heading",
            value: intent.topic,
            level: "h1",
            emphasis: "high",
          },
        ],
      },

      // Slide 2: Executive Summary
      {
        id: "s2",
        type: "content",
        intent: "Provide high-level overview",
        layout: "two_column",
        content: [
          {
            type: "heading",
            value: "Executive Summary",
            level: "h2",
            emphasis: "high",
          },
          {
            type: "bullets",
            items: [{ text: "Strong performance across key metrics" }, { text: "Achieved major milestones" }, { text: "On track for annual goals" }],
          },
        ],
      },

      // Slide 3: Key Metrics
      {
        id: "s3",
        type: "grid",
        intent: "Show key performance indicators",
        layout: "grid_2x2",
        content: [
          {
            type: "stat",
            value: "125%",
            label: "Revenue Growth",
            prefix: "+",
            visualWeight: "emphasis",
          },
          {
            type: "stat",
            value: "10K",
            label: "New Customers",
            prefix: "+",
            visualWeight: "emphasis",
          },
          {
            type: "stat",
            value: "98%",
            label: "Customer Retention",
            visualWeight: "emphasis",
          },
          {
            type: "stat",
            value: "$2M",
            label: "Monthly Revenue",
            visualWeight: "emphasis",
          },
        ],
      },

      // Slide 4: Highlights
      {
        id: "s4",
        type: "content",
        intent: "Detail key achievements",
        layout: "two_column",
        content: [
          {
            type: "heading",
            value: "Key Highlights",
            level: "h2",
            emphasis: "high",
          },
          {
            type: "bullets",
            items: [
              { text: "Launched new product line", icon: "🚀" },
              { text: "Expanded to 3 new markets", icon: "🌍" },
              { text: "Secured major partnerships", icon: "🤝" },
            ],
          },
        ],
      },

      // Slide 5: Next Steps
      {
        id: "s5",
        type: "closing",
        intent: "Outline future plans",
        layout: "two_column",
        content: [
          {
            type: "heading",
            value: "Looking Ahead",
            level: "h2",
            emphasis: "high",
          },
          {
            type: "bullets",
            items: [{ text: "Continue growth trajectory" }, { text: "Invest in innovation" }, { text: "Scale operations" }],
          },
        ],
      },
    ],
  };
}
