export const SlideTypes = ["hero", "section", "bullet-list", "stat-trio", "two-column", "image-text", "quote", "code", "timeline"] as const;

export type SlideType = (typeof SlideTypes)[number];

export const NarrativeTypes = ["pitch", "problem-solution", "report", "educational", "technical"] as const;

export type NarrativeType = (typeof NarrativeTypes)[number];
