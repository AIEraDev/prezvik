/**
 * Kyro Schema
 *
 * Versioned schema exports for deck generation system
 */

// Export v1 as default
export * from "./v1";

// Also export v1 explicitly for version-specific imports
export * as v1 from "./v1";
