import { z } from "zod";

export const ContentBlockSchema = z.union([
  z.object({
    type: z.literal("text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("bullets"),
    items: z.array(z.string()),
  }),
  z.object({
    type: z.literal("image"),
    src: z.string(),
  }),
  z.object({
    type: z.literal("stat"),
    label: z.string(),
    value: z.string(),
  }),
  z.object({
    type: z.literal("code"),
    language: z.string(),
    code: z.string(),
  }),
]);

export type ContentBlock = z.infer<typeof ContentBlockSchema>;
