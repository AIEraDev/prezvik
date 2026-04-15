/**
 * Theme Normalizer
 *
 * Ensure theme has all required fields with defaults
 */

export function normalizeTheme(theme: any): any {
  return {
    ...theme,
    // Ensure layout config exists
    layout: {
      padding: theme.layout?.padding ?? 8,
      maxWidth: theme.layout?.maxWidth ?? 90,
      contentPadding: theme.layout?.contentPadding ?? 5,
    },
    // Ensure weight exists
    typography: {
      ...theme.typography,
      weight: {
        regular: theme.typography.weight?.regular ?? 400,
        medium: theme.typography.weight?.medium ?? 500,
        bold: theme.typography.weight?.bold ?? 700,
      },
      lineHeight: {
        tight: theme.typography.lineHeight?.tight ?? 1.1,
        normal: theme.typography.lineHeight?.normal ?? 1.15,
        relaxed: theme.typography.lineHeight?.relaxed ?? 1.5,
      },
    },
    // Ensure spacing unit exists
    spacing: {
      ...theme.spacing,
      unit: theme.spacing.unit ?? 8,
    },
  };
}
