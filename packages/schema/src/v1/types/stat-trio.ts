import { z } from "zod";

/**
 * Individual stat schema
 */
export const StatSchema = z.object({
  label: z.string(),
  value: z.string(),
  delta: z.string().optional(), // e.g., "+12%", "↑ 5pts"
});

/**
 * Stat trio slide content schema
 *
 * Three key metrics side-by-side
 * 🔥 Enforces exactly 3 stats at schema level
 */
export const StatTrioContentSchema = z.object({
  title: z.string().optional(),
  stats: z.array(StatSchema).length(3), // 👈 Design constraint enforced
});

export type Stat = z.infer<typeof StatSchema>;
export type StatTrioContent = z.infer<typeof StatTrioContentSchema>;
