/**
 * Type-specific validators registry
 *
 * This is the critical layer that makes validation dynamic and extensible.
 * Each slide type owns its own validation rules.
 */
/**
 * Slide type validators registry
 *
 * Maps slide type strings to their Zod validators
 * This becomes the foundation for:
 * - Dynamic validation
 * - Layout engine mapping
 * - Type-safe content handling
 */
export declare const SlideTypeValidators: {
    readonly hero: import("zod").ZodObject<{
        title: import("zod").ZodString;
        subtitle: import("zod").ZodOptional<import("zod").ZodString>;
        kicker: import("zod").ZodOptional<import("zod").ZodString>;
    }, "strip", import("zod").ZodTypeAny, {
        title: string;
        kicker?: string | undefined;
        subtitle?: string | undefined;
    }, {
        title: string;
        kicker?: string | undefined;
        subtitle?: string | undefined;
    }>;
    readonly "bullet-list": import("zod").ZodObject<{
        title: import("zod").ZodString;
        bullets: import("zod").ZodArray<import("zod").ZodString, "many">;
    }, "strip", import("zod").ZodTypeAny, {
        title: string;
        bullets: string[];
    }, {
        title: string;
        bullets: string[];
    }>;
    readonly "stat-trio": import("zod").ZodObject<{
        title: import("zod").ZodOptional<import("zod").ZodString>;
        stats: import("zod").ZodArray<import("zod").ZodObject<{
            label: import("zod").ZodString;
            value: import("zod").ZodString;
            delta: import("zod").ZodOptional<import("zod").ZodString>;
        }, "strip", import("zod").ZodTypeAny, {
            value: string;
            label: string;
            delta?: string | undefined;
        }, {
            value: string;
            label: string;
            delta?: string | undefined;
        }>, "many">;
    }, "strip", import("zod").ZodTypeAny, {
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
    readonly "two-column": import("zod").ZodObject<{
        title: import("zod").ZodOptional<import("zod").ZodString>;
        left: import("zod").ZodArray<import("zod").ZodDiscriminatedUnion<"type", [import("zod").ZodObject<{
            type: import("zod").ZodLiteral<"text">;
            text: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            type: "text";
            text: string;
        }, {
            type: "text";
            text: string;
        }>, import("zod").ZodObject<{
            type: import("zod").ZodLiteral<"image">;
            src: import("zod").ZodString;
            alt: import("zod").ZodOptional<import("zod").ZodString>;
        }, "strip", import("zod").ZodTypeAny, {
            type: "image";
            src: string;
            alt?: string | undefined;
        }, {
            type: "image";
            src: string;
            alt?: string | undefined;
        }>, import("zod").ZodObject<{
            type: import("zod").ZodLiteral<"list">;
            items: import("zod").ZodArray<import("zod").ZodString, "many">;
        }, "strip", import("zod").ZodTypeAny, {
            type: "list";
            items: string[];
        }, {
            type: "list";
            items: string[];
        }>]>, "many">;
        right: import("zod").ZodArray<import("zod").ZodDiscriminatedUnion<"type", [import("zod").ZodObject<{
            type: import("zod").ZodLiteral<"text">;
            text: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            type: "text";
            text: string;
        }, {
            type: "text";
            text: string;
        }>, import("zod").ZodObject<{
            type: import("zod").ZodLiteral<"image">;
            src: import("zod").ZodString;
            alt: import("zod").ZodOptional<import("zod").ZodString>;
        }, "strip", import("zod").ZodTypeAny, {
            type: "image";
            src: string;
            alt?: string | undefined;
        }, {
            type: "image";
            src: string;
            alt?: string | undefined;
        }>, import("zod").ZodObject<{
            type: import("zod").ZodLiteral<"list">;
            items: import("zod").ZodArray<import("zod").ZodString, "many">;
        }, "strip", import("zod").ZodTypeAny, {
            type: "list";
            items: string[];
        }, {
            type: "list";
            items: string[];
        }>]>, "many">;
    }, "strip", import("zod").ZodTypeAny, {
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
};
/**
 * Re-export all type schemas
 */
export * from "./hero";
export * from "./bullet-list";
export * from "./stat-trio";
export * from "./two-column";
//# sourceMappingURL=index.d.ts.map