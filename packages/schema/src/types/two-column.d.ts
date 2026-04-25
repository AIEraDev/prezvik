import { z } from "zod";
/**
 * Content block for two-column layouts
 * Simplified content model for nested content
 */
export declare const TwoColumnContentBlockSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "text";
    text: string;
}, {
    type: "text";
    text: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"image">;
    src: z.ZodString;
    alt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "image";
    src: string;
    alt?: string | undefined;
}, {
    type: "image";
    src: string;
    alt?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"list">;
    items: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: "list";
    items: string[];
}, {
    type: "list";
    items: string[];
}>]>;
/**
 * Two column slide content schema
 *
 * Split content layout - flexible but structured
 */
export declare const TwoColumnContentSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    left: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "text";
        text: string;
    }, {
        type: "text";
        text: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "image";
        src: string;
        alt?: string | undefined;
    }, {
        type: "image";
        src: string;
        alt?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"list">;
        items: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "list";
        items: string[];
    }, {
        type: "list";
        items: string[];
    }>]>, "many">;
    right: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "text";
        text: string;
    }, {
        type: "text";
        text: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "image";
        src: string;
        alt?: string | undefined;
    }, {
        type: "image";
        src: string;
        alt?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"list">;
        items: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "list";
        items: string[];
    }, {
        type: "list";
        items: string[];
    }>]>, "many">;
}, "strip", z.ZodTypeAny, {
    left: ({
        type: "text";
        text: string;
    } | {
        type: "image";
        src: string;
        alt?: string | undefined;
    } | {
        type: "list";
        items: string[];
    })[];
    right: ({
        type: "text";
        text: string;
    } | {
        type: "image";
        src: string;
        alt?: string | undefined;
    } | {
        type: "list";
        items: string[];
    })[];
    title?: string | undefined;
}, {
    left: ({
        type: "text";
        text: string;
    } | {
        type: "image";
        src: string;
        alt?: string | undefined;
    } | {
        type: "list";
        items: string[];
    })[];
    right: ({
        type: "text";
        text: string;
    } | {
        type: "image";
        src: string;
        alt?: string | undefined;
    } | {
        type: "list";
        items: string[];
    })[];
    title?: string | undefined;
}>;
export type TwoColumnContentBlock = z.infer<typeof TwoColumnContentBlockSchema>;
export type TwoColumnContent = z.infer<typeof TwoColumnContentSchema>;
//# sourceMappingURL=two-column.d.ts.map