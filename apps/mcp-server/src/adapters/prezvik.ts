/**
 * Prezvik Adapter
 *
 * Thin wrapper around core engine
 * NO business logic here - just calls the pipeline
 */

import { generateDeck } from "@prezvik/core";
import * as path from "path";

/**
 * Generate presentation from deck schema
 */
export async function generatePresentation(deck: any, options?: { theme?: string; outputDir?: string }): Promise<{ fileName: string; path: string }> {
  const outputDir = options?.outputDir || process.cwd();

  // Generate unique filename
  const timestamp = Date.now();
  const fileName = `prezvik-${timestamp}.pptx`;
  const filePath = path.join(outputDir, fileName);

  // Call core pipeline
  await generateDeck(deck, filePath);

  return {
    fileName,
    path: filePath,
  };
}

/**
 * Validate deck schema
 */
export function validateDeck(deck: any): { valid: boolean; error?: string; slideCount?: number; slideTypes?: string[] } {
  try {
    // Basic validation
    if (!deck.slides || !Array.isArray(deck.slides)) {
      return {
        valid: false,
        error: "Missing slides array",
      };
    }

    if (deck.slides.length === 0) {
      return {
        valid: false,
        error: "No slides in deck",
      };
    }

    // Validate each slide
    for (const slide of deck.slides) {
      if (!slide.type) {
        return {
          valid: false,
          error: `Slide ${slide.id || "unknown"} missing type`,
        };
      }

      if (!slide.content) {
        return {
          valid: false,
          error: `Slide ${slide.id || "unknown"} missing content`,
        };
      }
    }

    // Extract slide types
    const slideTypes = Array.from(new Set(deck.slides.map((s: any) => s.type as string)));

    return {
      valid: true,
      slideCount: deck.slides.length,
      slideTypes: slideTypes as string[],
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message,
    };
  }
}

/**
 * Get available themes
 */
export function getAvailableThemes(): string[] {
  return ["executive", "minimal"];
}

/**
 * Get available slide types
 */
export function getAvailableSlideTypes(): string[] {
  return ["hero", "bullet-list", "stat-trio", "two-column"];
}
