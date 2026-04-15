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

export function layoutHero(content: HeroContent): LayoutTree {
  const children: TextNode[] = [];

  // Kicker (optional)
  if (content.kicker) {
    children.push({
      id: "kicker",
      type: "text",
      content: content.kicker,
      text: {
        fontSize: 14, // Will be overridden by theme
        fontWeight: "bold",
        align: "center",
        fontRole: "small" as any,
        colorRole: "textMuted" as any,
        weightRole: "bold" as any,
      },
    });
  }

  // Title (adaptive font scaling)
  const baseFontSize = 72; // Will be overridden by theme
  const titleFontSize = scaleTitleFont(baseFontSize, content.title.length);
  children.push({
    id: "title",
    type: "text",
    content: content.title,
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
  if (content.subtitle) {
    children.push({
      id: "subtitle",
      type: "text",
      content: content.subtitle,
      text: {
        fontSize: 28, // Will be overridden by theme
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

  return { root };
}
