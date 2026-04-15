/**
 * Theme Registry
 *
 * All available themes
 */

export * from "./types.js";
export * from "./executive.js";
export * from "./minimal.js";

import { executiveTheme } from "./executive.js";
import { minimalTheme } from "./minimal.js";
import type { Theme } from "./types.js";

/**
 * Theme registry
 */
export const themes: Record<string, Theme> = {
  executive: executiveTheme,
  minimal: minimalTheme,
};

/**
 * Get theme by name
 */
export function getTheme(name: string): Theme {
  return themes[name] ?? executiveTheme;
}
