import { z } from "zod";

/**
 * Hero slide content schema
 *
 * The opening slide - big impact, clear message
 */
export const HeroContentSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  kicker: z.string().optional(), // Small text above title
});

export type HeroContent = z.infer<typeof HeroContentSchema>;
