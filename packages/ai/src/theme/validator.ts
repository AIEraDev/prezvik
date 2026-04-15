/**
 * Theme Validator
 *
 * Don't trust AI blindly - validate structure
 */

export function validateTheme(theme: any): void {
  // Check required top-level keys
  if (!theme.typography) {
    throw new Error("Theme missing typography");
  }

  if (!theme.colors) {
    throw new Error("Theme missing colors");
  }

  if (!theme.spacing) {
    throw new Error("Theme missing spacing");
  }

  // Validate typography
  if (!theme.typography.fontFamily) {
    throw new Error("Theme missing typography.fontFamily");
  }

  if (!theme.typography.scale) {
    throw new Error("Theme missing typography.scale");
  }

  // Validate required font sizes
  const requiredSizes = ["hero", "title", "subtitle", "h1", "h2", "body", "small", "caption"];
  for (const size of requiredSizes) {
    if (typeof theme.typography.scale[size] !== "number") {
      throw new Error(`Theme missing typography.scale.${size}`);
    }
  }

  // Validate colors
  const requiredColors = ["background", "text", "primary", "accent"];
  for (const color of requiredColors) {
    if (!theme.colors[color]) {
      throw new Error(`Theme missing colors.${color}`);
    }

    // Validate hex format
    if (!/^#[0-9A-Fa-f]{6}$/.test(theme.colors[color])) {
      throw new Error(`Invalid hex color: ${theme.colors[color]}`);
    }
  }

  // Validate spacing
  if (!Array.isArray(theme.spacing.scale)) {
    throw new Error("Theme spacing.scale must be an array");
  }
}
