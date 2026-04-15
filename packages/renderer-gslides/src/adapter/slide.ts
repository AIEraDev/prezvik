/**
 * Slide Management
 *
 * Create and manage individual slides
 */

import { createSlidesClient } from "./client.js";
import { generateId } from "../utils/ids.js";

/**
 * Create a new blank slide
 *
 * Returns slide ID
 */
export async function createSlide(presentationId: string, background?: string): Promise<string> {
  const slides = createSlidesClient();
  const slideId = generateId();

  const requests: any[] = [
    {
      createSlide: {
        objectId: slideId,
        slideLayoutReference: {
          predefinedLayout: "BLANK",
        },
      },
    },
  ];

  // Add background color if specified
  if (background) {
    requests.push({
      updatePageProperties: {
        objectId: slideId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: hexToRgb(background),
              },
            },
          },
        },
        fields: "pageBackgroundFill",
      },
    });
  }

  await slides.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests,
    },
  });

  return slideId;
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
