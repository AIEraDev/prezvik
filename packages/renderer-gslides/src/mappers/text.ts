/**
 * Text Mapper
 *
 * Convert TextNode → Google Slides text box
 */

import type { TextNode } from "@kyro/layout";
import { createSlidesClient } from "../adapter/client.js";
import { generateId } from "../utils/ids.js";
import { pctToPt } from "../utils/units.js";

/**
 * Render text node to Google Slides
 */
export async function renderText(presentationId: string, slideId: string, node: TextNode): Promise<void> {
  const slides = createSlidesClient();
  const objectId = generateId();

  const rect = node._rect;
  if (!rect) {
    throw new Error(`TextNode "${node.id}" has no _rect`);
  }

  // Convert percentage coordinates to points
  const x = pctToPt(rect.x, "x");
  const y = pctToPt(rect.y, "y");
  const width = pctToPt(rect.width, "x");
  const height = pctToPt(rect.height, "y");

  const requests: any[] = [
    // Create text box
    {
      createShape: {
        objectId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: width, unit: "PT" },
            height: { magnitude: height, unit: "PT" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: x,
            translateY: y,
            unit: "PT",
          },
        },
      },
    },
    // Insert text
    {
      insertText: {
        objectId,
        text: node.content,
      },
    },
  ];

  // Style text
  const textStyle: any = {
    fontSize: {
      magnitude: node.text.fontSize,
      unit: "PT",
    },
  };

  if (node.text.fontFamily) {
    textStyle.fontFamily = node.text.fontFamily;
  }

  if (node.text.fontWeight === "bold") {
    textStyle.bold = true;
  }

  if (node.text.color) {
    textStyle.foregroundColor = {
      opaqueColor: {
        rgbColor: hexToRgb(node.text.color),
      },
    };
  }

  requests.push({
    updateTextStyle: {
      objectId,
      style: textStyle,
      fields: Object.keys(textStyle).join(","),
    },
  });

  // Paragraph alignment
  if (node.text.align) {
    requests.push({
      updateParagraphStyle: {
        objectId,
        style: {
          alignment: mapAlignment(node.text.align),
        },
        fields: "alignment",
      },
    });
  }

  // Execute all requests
  await slides.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests,
    },
  });
}

/**
 * Convert hex color to RGB object
 */
function hexToRgb(hex: string): { red: number; green: number; blue: number } {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;

  return { red: r, green: g, blue: b };
}

/**
 * Map text alignment
 */
function mapAlignment(align: string): string {
  const map: Record<string, string> = {
    left: "START",
    center: "CENTER",
    right: "END",
  };
  return map[align] || "START";
}
