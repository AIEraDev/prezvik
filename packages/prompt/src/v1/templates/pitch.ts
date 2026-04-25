/**
 * Pitch Deck Template
 *
 * Generates Blueprint IR for pitch decks
 */

import type { KyroBlueprint } from "@kyro/schema";
import type { Intent } from "../intent-detector.js";

export function pitchTemplate(intent: Intent): KyroBlueprint {
  return {
    version: "2.0",

    meta: {
      title: intent.topic,
      language: "en",
      goal: "pitch",
      tone: intent.tone,
      audience: "investors",
    },

    theme: {
      name: "kyro_modern",
    },

    slides: [
      // Slide 1: Hero
      {
        id: "s1",
        type: "hero",
        intent: "Capture attention and introduce the company vision",
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
            value: "Transforming the future of the industry",
            emphasis: "medium",
          },
        ],
        media: [
          {
            type: "image",
            source: {
              query: `${intent.topic} abstract modern technology`,
            },
            placement: "background",
            style: {
              filter: "soft",
            },
          },
        ],
      },

      // Slide 2: Problem
      {
        id: "s2",
        type: "content",
        intent: "Define the problem we're solving",
        layout: "two_column",
        content: [
          {
            type: "heading",
            value: "The Problem",
            level: "h2",
            emphasis: "high",
          },
          {
            type: "bullets",
            items: [
              { text: "Current solutions are inefficient", icon: "❌" },
              { text: "Market needs better alternatives", icon: "📉" },
              { text: "Opportunity for disruption", icon: "💡" },
            ],
          },
        ],
      },

      // Slide 3: Solution
      {
        id: "s3",
        type: "content",
        intent: "Present our solution",
        layout: "two_column",
        content: [
          {
            type: "heading",
            value: "Our Solution",
            level: "h2",
            emphasis: "high",
          },
          {
            type: "bullets",
            items: [
              { text: "Innovative approach", icon: "🚀" },
              { text: "Proven technology", icon: "⚡" },
              { text: "Scalable platform", icon: "📈" },
            ],
          },
        ],
      },

      // Slide 4: Market
      {
        id: "s4",
        type: "data",
        intent: "Show market opportunity",
        layout: "stat_highlight",
        content: [
          {
            type: "heading",
            value: "Market Opportunity",
            level: "h2",
            emphasis: "high",
          },
          {
            type: "stat",
            value: "$10B",
            label: "Total Addressable Market",
            visualWeight: "hero",
          },
        ],
      },

      // Slide 5: Traction
      {
        id: "s5",
        type: "grid",
        intent: "Demonstrate traction and growth",
        layout: "grid_2x2",
        content: [
          {
            type: "stat",
            value: "1000+",
            label: "Active Users",
            visualWeight: "emphasis",
          },
          {
            type: "stat",
            value: "50%",
            label: "Month-over-Month Growth",
            visualWeight: "emphasis",
          },
          {
            type: "stat",
            value: "$500K",
            label: "Annual Revenue",
            visualWeight: "emphasis",
          },
          {
            type: "stat",
            value: "95%",
            label: "Customer Satisfaction",
            visualWeight: "emphasis",
          },
        ],
      },

      // Slide 6: Call to Action
      {
        id: "s6",
        type: "closing",
        intent: "Drive action and next steps",
        layout: "center_focus",
        content: [
          {
            type: "heading",
            value: "Let's Build the Future Together",
            level: "h1",
            emphasis: "high",
          },
          {
            type: "text",
            value: "Join us in transforming the industry",
            emphasis: "medium",
          },
        ],
      },
    ],
  };
}
