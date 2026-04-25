import { z } from "zod";
/**
 * Hero slide content schema
 *
 * The opening slide - big impact, clear message
 */
export declare const HeroContentSchema: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    kicker: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    kicker?: string | undefined;
    subtitle?: string | undefined;
}, {
    title: string;
    kicker?: string | undefined;
    subtitle?: string | undefined;
}>;
export type HeroContent = z.infer<typeof HeroContentSchema>;
//# sourceMappingURL=hero.d.ts.map