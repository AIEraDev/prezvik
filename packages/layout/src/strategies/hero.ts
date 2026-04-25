/**
 * Hero Slide Layout Strategy (with adaptive logic)
 *
 * Large, centered text with optional kicker and subtitle
 * Now with design intelligence and semantic roles
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";
import { scaleTitleFont } from "../adaptive/font-scale.js";

export interface HeroContent {
  title: string;
  subtitle?: string;
  kicker?: string;
}

export function layoutHero(content: HeroContent | any[]): LayoutTree {
  // Handle Blueprint content blocks format (array of content blocks)
  let title = "";
  let subtitle = "";
  let kicker = "";

  if (Array.isArray(content)) {
    // Extract from Blueprint content blocks
    for (const block of content) {
      if (block.type === "heading" && block.value && !title) {
        title = block.value;
      } else if (block.type === "text" && block.value && !subtitle) {
        subtitle = block.value;
      } else if (block.type === "kicker" && block.value) {
        kicker = block.value;
      }
    }
  } else {
    // Handle direct HeroContent object format
    title = content.title || "";
    subtitle = content.subtitle || "";
    kicker = content.kicker || "";
  }

  // Fallback if no title found
  if (!title) {
    title = "Untitled";
  }

  console.log(`        [layoutHero] Building hero layout - title: "${title?.substring(0, 30)}...", hasKicker: ${!!kicker}, hasSubtitle: ${!!subtitle}`);

  const children: TextNode[] = [];

  // Kicker (optional)
  if (kicker) {
    children.push({
      id: "kicker",
      type: "text",
      content: kicker,
      text: {
        fontSize: 14,
        fontWeight: "bold",
        align: "center",
        fontRole: "small" as any,
        colorRole: "textMuted" as any,
        weightRole: "bold" as any,
      },
    });
  }

  // Title (adaptive font scaling)
  const baseFontSize = 72;
  const titleFontSize = scaleTitleFont(baseFontSize, title.length);
  children.push({
    id: "title",
    type: "text",
    content: title,
    text: {
      fontSize: titleFontSize,
      fontWeight: "bold",
      align: "center",
      fontRole: "hero" as any,
      colorRole: "text" as any,
      weightRole: "bold" as any,
    },
  });

  // Subtitle (optional)
  if (subtitle) {
    children.push({
      id: "subtitle",
      type: "text",
      content: subtitle,
      text: {
        fontSize: 28,
        align: "center",
        fontRole: "h2" as any,
        colorRole: "textMuted" as any,
        weightRole: "regular" as any,
      },
    });
  }

  const root: ContainerNode = {
    id: "root",
    type: "container",
    children,
    layout: {
      type: "flow",
      direction: "vertical",
      gap: 3,
      align: "center",
    },
    padding: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  };

  console.log(`        [layoutHero] COMPLETED - created ${children.length} text nodes`);
  return { root };
}
