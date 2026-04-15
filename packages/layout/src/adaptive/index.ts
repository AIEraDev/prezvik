/**
 * Adaptive Layout System
 *
 * This is what separates:
 * - "template generator" vs "design-intelligent system"
 *
 * The engine dynamically adjusts:
 * - Typography scaling → based on text length
 * - Layout density → based on content volume
 * - Overflow handling → prevent ugly slides
 * - Layout switching → choose better structure automatically
 */

export * from "./text-measure";
export * from "./font-scale";
export * from "./density";
export * from "./overflow";
export * from "./layout-switch";
