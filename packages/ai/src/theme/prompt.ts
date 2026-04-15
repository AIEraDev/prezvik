/**
 * Theme Generation Prompts
 *
 * Structured prompts for AI theme generation
 */

export function buildThemePrompt(description: string): string {
  return `You are a professional design system generator for presentation themes.

Generate a complete theme based on this description: "${description}"

Return ONLY valid JSON with this exact structure:
{
  "name": "theme-name",
  "typography": {
    "fontFamily": "Font Name",
    "scale": {
      "hero": 72,
      "title": 48,
      "subtitle": 32,
      "h1": 36,
      "h2": 28,
      "body": 18,
      "small": 14,
      "caption": 12
    },
    "weight": {
      "regular": 400,
      "medium": 500,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.1,
      "normal": 1.15,
      "relaxed": 1.5
    }
  },
  "spacing": {
    "unit": 8,
    "scale": [4, 8, 16, 24, 32, 48, 64]
  },
  "colors": {
    "background": "#FFFFFF",
    "foreground": "#F9FAFB",
    "text": "#111827",
    "textMuted": "#6B7280",
    "primary": "#2563EB",
    "primaryLight": "#DBEAFE",
    "accent": "#F59E0B",
    "accentLight": "#FEF3C7",
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444",
    "border": "#E5E7EB",
    "borderLight": "#F3F4F6"
  },
  "layout": {
    "padding": 8,
    "maxWidth": 90,
    "contentPadding": 5
  }
}

Guidelines:
- Choose fonts that match the style (modern, classic, tech, etc.)
- Colors should be harmonious and accessible
- Maintain proper contrast ratios
- Use hex colors only
- Keep spacing consistent with 8px base unit

Return ONLY the JSON, no explanation.`;
}
