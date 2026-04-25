import { z } from "zod";
/**
 * Individual stat schema
 */
export declare const StatSchema: z.ZodObject<{
    label: z.ZodString;
    value: z.ZodString;
    delta: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: string;
    label: string;
    delta?: string | undefined;
}, {
    value: string;
    label: string;
    delta?: string | undefined;
}>;
/**
 * Stat trio slide content schema
 *
 * Three key metrics side-by-side
 * 🔥 Enforces exactly 3 stats at schema level
 */
export declare const StatTrioContentSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    stats: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodString;
        delta: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        label: string;
        delta?: string | undefined;
    }, {
        value: string;
        label: string;
        delta?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    stats: {
        value: string;
        label: string;
        delta?: string | undefined;
    }[];
    title?: string | undefined;
}, {
    stats: {
        value: string;
        label: string;
        delta?: string | undefined;
    }[];
    title?: string | undefined;
}>;
export type Stat = z.infer<typeof StatSchema>;
export type StatTrioContent = z.infer<typeof StatTrioContentSchema>;
//# sourceMappingURL=stat-trio.d.ts.map