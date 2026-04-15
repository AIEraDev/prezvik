/**
 * Bullet List Layout Strategy (with adaptive logic)
 *
 * Classic presentation format - title + bullets
 * Now with design intelligence and semantic roles
 */

import type { LayoutTree, ContainerNode, TextNode } from "../types.js";
import { scaleFontSize, scaleBodyFont } from "../adaptive/font-scale.js";
import { enforceMaxItems } from "../adaptive/overflow.js";
import { totalContentLength } from "../adaptive/text-measure.js";

export interface BulletListContent {
  title: string;
  bullets: string[];
}

export function layoutBulletList(content: BulletListContent): LayoutTree {
  // Adaptive: Enforce max items (controlled degradation)
  const bullets = enforceMaxItems(content.bullets, 8) as string[];

  // Adaptive: Scale font size based on total content length
  const totalLength = totalContentLength(bullets);
  const baseFontSize = 18;
  const bodyFontSize = scaleBodyFont(baseFontSize, totalLength);

  // Adaptive: Scale title font based on title length
  const baseTitleSize = 48;
  const titleFontSize = scaleFontSize(baseTitleSize, content.title.length);

  const children: TextNode[] = [
    {
      id: "title",
      type: "text",
      content: content.title,
      text: {
        fontSize: titleFontSize,
        fontWeight: "bold",
        align: "left",
        fontRole: "title" as any,
        colorRole: "text" as any,
        weightRole: "bold" as any,
      },
    },
    ...bullets.map(
      (bullet, i): TextNode => ({
        id: `bullet-${i}`,
        type: "text",
        content: bullet,
        text: {
          fontSize: bodyFontSize,
          align: "left",
          fontRole: "body" as any,
          colorRole: "text" as any,
          weightRole: "regular" as any,
        },
      }),
    ),
  ];

  const root: ContainerNode = {
    id: "root",
    type: "container",
    children,
    layout: {
      type: "flow",
      direction: "vertical",
      gap: 2,
    },
    padding: {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5,
    },
  };

  return { root };
}
