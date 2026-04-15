/**
 * Slide Content Enhancer
 *
 * Enhance entire slide content (HIGH IMPACT)
 */

import { rewriteTexts } from "./rewrite.js";

/**
 * Enhance slide content
 *
 * Rewrites bullets, titles, and other text for maximum impact
 */
export async function enhanceSlide(content: any): Promise<any> {
  const enhanced = { ...content };

  // Enhance title
  if (content.title && typeof content.title === "string") {
    const [rewrittenTitle] = await rewriteTexts([content.title]);
    enhanced.title = rewrittenTitle;
  }

  // Enhance subtitle
  if (content.subtitle && typeof content.subtitle === "string") {
    const [rewrittenSubtitle] = await rewriteTexts([content.subtitle]);
    enhanced.subtitle = rewrittenSubtitle;
  }

  // Enhance bullets
  if (content.bullets && Array.isArray(content.bullets)) {
    enhanced.bullets = await rewriteTexts(content.bullets);
  }

  // Enhance kicker
  if (content.kicker && typeof content.kicker === "string") {
    const [rewrittenKicker] = await rewriteTexts([content.kicker]);
    enhanced.kicker = rewrittenKicker;
  }

  return enhanced;
}

/**
 * Enhance entire deck
 */
export async function enhanceDeck(deck: any): Promise<any> {
  const enhanced = { ...deck };

  // Enhance each slide
  enhanced.slides = await Promise.all(deck.slides.map((slide: any) => enhanceSlide(slide.content).then((content) => ({ ...slide, content }))));

  return enhanced;
}
