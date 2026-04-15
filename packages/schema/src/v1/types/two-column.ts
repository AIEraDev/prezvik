import { z } from "zod";

/**
 * Content block for two-column layouts
 * Simplified content model for nested content
 */
export const TwoColumnContentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("image"),
    src: z.string(),
    alt: z.string().optional(),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string()),
  }),
]);

/**
 * Two column slide content schema
 *
 * Split content layout - flexible but structured
 */
export const TwoColumnContentSchema = z.object({
  title: z.string().optional(),
  left: z.array(TwoColumnContentBlockSchema),
  right: z.array(TwoColumnContentBlockSchema),
});

export type TwoColumnContentBlock = z.infer<typeof TwoColumnContentBlockSchema>;
export type TwoColumnContent = z.infer<typeof TwoColumnContentSchema>;
