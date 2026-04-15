import { z } from "zod";
import { SlideSchema } from "./slide";
import { NarrativeTypes } from "./enums";

export const DeckSchema = z.object({
  version: z.literal("1.0"),

  meta: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    author: z.string().optional(),
    theme: z.string().optional(),
    createdAt: z.string().optional(),
  }),

  config: z
    .object({
      aspectRatio: z.enum(["16:9", "4:3"]).optional(),
      density: z.enum(["compact", "comfortable", "spacious"]).optional(),
      language: z.string().optional(),
    })
    .optional(),

  narrative: z
    .object({
      type: z.enum(NarrativeTypes).optional(),
      goal: z.string().optional(),
      audience: z.string().optional(),
      keyPoints: z.array(z.string()).optional(),
    })
    .optional(),

  slides: z.array(SlideSchema),
});

export type DeckSchemaType = z.infer<typeof DeckSchema>;
