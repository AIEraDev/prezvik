/**
 * Presentation Management
 *
 * Create and manage Google Slides presentations
 */

import { createSlidesClient } from "./client.js";

/**
 * Create a new Google Slides presentation
 *
 * Returns presentation ID
 */
export async function createPresentation(title: string): Promise<string> {
  const slides = createSlidesClient();

  const res = await slides.presentations.create({
    requestBody: {
      title,
    },
  });

  if (!res.data.presentationId) {
    throw new Error("Failed to create presentation");
  }

  return res.data.presentationId;
}

/**
 * Get presentation URL
 */
export function getPresentationUrl(presentationId: string): string {
  return `https://docs.google.com/presentation/d/${presentationId}`;
}

/**
 * Delete first slide (Google Slides creates one by default)
 */
export async function deleteFirstSlide(presentationId: string): Promise<void> {
  const slides = createSlidesClient();

  // Get presentation to find first slide ID
  const presentation = await slides.presentations.get({ presentationId });
  const firstSlideId = presentation.data.slides?.[0]?.objectId;

  if (firstSlideId) {
    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: [
          {
            deleteObject: {
              objectId: firstSlideId,
            },
          },
        ],
      },
    });
  }
}
