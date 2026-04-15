/**
 * Slide Type System
 *
 * This is the UX - the 10 core slide types users work with
 * Extensible system for adding custom types
 */

import { z } from "zod";

/**
 * 1. Hero - Opening slide with big impact
 */
export const HeroSlideSchema = z.object({
  type: z.literal("hero"),
  content: z.object({
    kicker: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
  }),
});

/**
 * 2. Bullet List - Classic presentation format
 */
export const BulletListSlideSchema = z.object({
  type: z.literal("bullet-list"),
  content: z.object({
    title: z.string(),
    bullets: z.array(z.string()).min(1).max(8),
  }),
});

/**
 * 3. Stat Trio - Three key metrics side-by-side
 */
export const StatTrioSlideSchema = z.object({
  type: z.literal("stat-trio"),
  content: z.object({
    title: z.string().optional(),
    stats: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          delta: z.string().optional(),
        }),
      )
      .length(3),
  }),
});

/**
 * 4. Two Column - Split content layout
 */
export const TwoColumnSlideSchema = z.object({
  type: z.literal("two-column"),
  content: z.object({
    title: z.string().optional(),
    left: z.array(
      z.object({
        type: z.enum(["text", "image", "list"]),
        text: z.string().optional(),
        src: z.string().optional(),
        items: z.array(z.string()).optional(),
      }),
    ),
    right: z.array(
      z.object({
        type: z.enum(["text", "image", "list"]),
        text: z.string().optional(),
        src: z.string().optional(),
        items: z.array(z.string()).optional(),
      }),
    ),
  }),
});

/**
 * 5. Quote - Large centered quote with attribution
 */
export const QuoteSlideSchema = z.object({
  type: z.literal("quote"),
  content: z.object({
    quote: z.string(),
    author: z.string().optional(),
    role: z.string().optional(),
  }),
});

/**
 * 6. Image Full - Full-bleed image with optional caption
 */
export const ImageFullSlideSchema = z.object({
  type: z.literal("image-full"),
  content: z.object({
    src: z.string(),
    caption: z.string().optional(),
    overlay: z.boolean().optional(),
  }),
});

/**
 * 7. Section Header - Divider slide between sections
 */
export const SectionHeaderSlideSchema = z.object({
  type: z.literal("section-header"),
  content: z.object({
    section: z.string(),
    subtitle: z.string().optional(),
  }),
});

/**
 * 8. Comparison - Side-by-side comparison
 */
export const ComparisonSlideSchema = z.object({
  type: z.literal("comparison"),
  content: z.object({
    title: z.string().optional(),
    left: z.object({
      label: z.string(),
      items: z.array(z.string()),
    }),
    right: z.object({
      label: z.string(),
      items: z.array(z.string()),
    }),
  }),
});

/**
 * 9. Timeline - Sequential events or milestones
 */
export const TimelineSlideSchema = z.object({
  type: z.literal("timeline"),
  content: z.object({
    title: z.string().optional(),
    events: z
      .array(
        z.object({
          date: z.string(),
          title: z.string(),
          description: z.string().optional(),
        }),
      )
      .min(2)
      .max(6),
  }),
});

/**
 * 10. CTA - Call to action / closing slide
 */
export const CTASlideSchema = z.object({
  type: z.literal("cta"),
  content: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    action: z.string(),
    url: z.string().optional(),
  }),
});

/**
 * Union of all slide types
 */
export const SlideTypeSchema = z.discriminatedUnion("type", [HeroSlideSchema, BulletListSlideSchema, StatTrioSlideSchema, TwoColumnSlideSchema, QuoteSlideSchema, ImageFullSlideSchema, SectionHeaderSlideSchema, ComparisonSlideSchema, TimelineSlideSchema, CTASlideSchema]);

/**
 * Slide type names
 */
export const SLIDE_TYPES = ["hero", "bullet-list", "stat-trio", "two-column", "quote", "image-full", "section-header", "comparison", "timeline", "cta"] as const;

export type SlideTypeName = (typeof SLIDE_TYPES)[number];

/**
 * Type inference
 */
export type HeroSlide = z.infer<typeof HeroSlideSchema>;
export type BulletListSlide = z.infer<typeof BulletListSlideSchema>;
export type StatTrioSlide = z.infer<typeof StatTrioSlideSchema>;
export type TwoColumnSlide = z.infer<typeof TwoColumnSlideSchema>;
export type QuoteSlide = z.infer<typeof QuoteSlideSchema>;
export type ImageFullSlide = z.infer<typeof ImageFullSlideSchema>;
export type SectionHeaderSlide = z.infer<typeof SectionHeaderSlideSchema>;
export type ComparisonSlide = z.infer<typeof ComparisonSlideSchema>;
export type TimelineSlide = z.infer<typeof TimelineSlideSchema>;
export type CTASlide = z.infer<typeof CTASlideSchema>;

export type SlideType = z.infer<typeof SlideTypeSchema>;
