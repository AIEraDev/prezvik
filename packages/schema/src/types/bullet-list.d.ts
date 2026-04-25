import { z } from "zod";
/**
 * Bullet list slide content schema
 *
 * Classic presentation format - title + bullets
 */
export declare const BulletListContentSchema: z.ZodObject<{
    title: z.ZodString;
    bullets: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    bullets: string[];
}, {
    title: string;
    bullets: string[];
}>;
export type BulletListContent = z.infer<typeof BulletListContentSchema>;
//# sourceMappingURL=bullet-list.d.ts.map