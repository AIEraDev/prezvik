import { z } from "zod";

/**
 * Base slide schema
 *
 * Generic validation - accepts any content structure
 * Type-specific validation happens in validators.ts
 */
export const SlideSchema = z.object({
  id: z.string(),
  type: z.string(), // Slide type (hero, bullet-list, stat-trio, etc.)
  content: z.record(z.unknown()), // Flexible - validated by type-specific schemas
});

export type Slide = z.infer<typeof SlideSchema>;
