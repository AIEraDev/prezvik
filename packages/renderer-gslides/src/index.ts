/**
 * Google Slides Renderer
 *
 * Clean adapter: LayoutTree → Google Slides
 * Uses batchUpdate API for efficiency
 */

import type { LayoutTree } from "@prezvik/layout";
import { hasCredentials } from "./adapter/client.js";
import { createPresentation, getPresentationUrl, deleteFirstSlide } from "./adapter/presentation.js";
import { createSlide } from "./adapter/slide.js";
import { renderNode } from "./adapter/node.js";

export * from "./adapter/client.js";
export * from "./adapter/presentation.js";
export * from "./adapter/slide.js";
export * from "./adapter/node.js";

/**
 * Render layout trees to Google Slides
 *
 * Returns presentation ID and URL
 */
export async function renderGoogleSlides(
  layouts: LayoutTree[],
  title: string = "Generated Presentation",
): Promise<{
  presentationId: string;
  url: string;
}> {
  // Check credentials
  if (!hasCredentials()) {
    throw new Error("Google Slides credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS environment variable.");
  }

  // Create presentation
  const presentationId = await createPresentation(title);

  // Delete default first slide
  await deleteFirstSlide(presentationId);

  // Render each slide
  for (const layout of layouts) {
    const slideId = await createSlide(presentationId, layout.background);
    await renderNode(presentationId, slideId, layout.root);
  }

  return {
    presentationId,
    url: getPresentationUrl(presentationId),
  };
}

/**
 * Check if Google Slides rendering is available
 */
export function isGoogleSlidesAvailable(): boolean {
  return hasCredentials();
}
