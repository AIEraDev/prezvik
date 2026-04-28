/**
 * Design Vocabulary
 *
 * Constrained vocabulary for AI agents to reason about design decisions.
 * Agents pick from named presets, never raw coordinates or pixel values.
 */

export const BACKGROUND_STYLES = [
  "dark-geometric", // navy + colorful shapes (modern, bold)
  "light-minimal", // white + subtle accent (clean, professional)
  "gradient-diagonal", // two-color diagonal gradient
  "dark-gradient", // dark base + darker gradient overlay
  "mesh-vivid", // colorful mesh gradient
  "split-panel", // left dark, right light (or vice versa)
  "noise-overlay", // solid + film grain texture
  "brand-saturated", // full brand color, very bold
] as const;

export const DECORATION_PRESETS = [
  "geometric-quartet", // 4-shape composition (purple circle, teal/yellow rects, blue/orange circles)
  "left-accent-bar", // thin vertical bar
  "corner-circles", // 2 large overlapping circles top-right
  "bottom-band", // footer bar
  "diagonal-slice", // angled geometric split
  "dot-grid", // subtle dot pattern
  "none", // no decorations
] as const;

export const COLOR_PALETTES = [
  "midnight-vivid", // navy + purple + teal + orange (bold, modern)
  "ocean-depth", // dark blue + cyan + white (professional, tech)
  "forest-focus", // dark green + lime + cream (natural, growth)
  "solar-bold", // dark charcoal + yellow + red (energetic, attention)
  "monochrome-pro", // black + white + one accent (minimal, elegant)
  "corporate-trust", // navy + royal blue + gray (traditional, reliable)
  "healthcare-calm", // blue + teal + green (medical, trustworthy)
  "creative-vibrant", // purple + pink + orange (artistic, dynamic)
] as const;

export type BackgroundStyle = (typeof BACKGROUND_STYLES)[number];
export type DecorationPreset = (typeof DECORATION_PRESETS)[number];
export type ColorPalette = (typeof COLOR_PALETTES)[number];

/**
 * What the AI Agent outputs - only named vocabulary, no raw values
 */
export interface AgentThemeDecision {
  backgroundStyle: BackgroundStyle;
  decorationPreset: DecorationPreset;
  colorPalette: ColorPalette;
  slideRhythm: Array<{
    slideId: string;
    backgroundMode: "dark" | "light";
    decorationVariant: DecorationPreset;
  }>;
}

/**
 * Build AI prompt with constrained vocabulary
 */
export function buildThemePrompt(slideIds: string[], contentContext: string): string {
  return `You are a slide design AI. Output ONLY raw JSON matching the schema.

Choose from ONLY these exact values:

backgroundStyle: ${BACKGROUND_STYLES.join(" | ")}
decorationPreset: ${DECORATION_PRESETS.join(" | ")}
colorPalette: ${COLOR_PALETTES.join(" | ")}
backgroundMode: "dark" | "light"

PRESENTATION CONTEXT:
${contentContext}

DESIGN RULES:
- First slide (hero): always "dark-geometric" + "geometric-quartet"
- Data slides: prefer "dark-gradient" + "none" or "left-accent-bar"
- Closing slides: prefer "dark-geometric" + "corner-circles"
- Content slides: prefer "light-minimal" + "left-accent-bar"
- Never use the same backgroundMode 3 times in a row
- Match colorPalette to content:
  * Healthcare/Medical → "healthcare-calm"
  * Financial/Corporate → "corporate-trust" or "midnight-vivid"
  * Creative/Marketing → "creative-vibrant"
  * Technical/Data → "ocean-depth"
  * Bold/Modern → "midnight-vivid" or "solar-bold"

SLIDE IDS TO THEME:
${slideIds.map((id, i) => `- ${id} (slide ${i + 1})`).join("\n")}

Output JSON schema:
{
  "backgroundStyle": "...",
  "decorationPreset": "...",
  "colorPalette": "...",
  "slideRhythm": [
    {
      "slideId": "slide-1",
      "backgroundMode": "dark",
      "decorationVariant": "geometric-quartet"
    }
  ]
}`;
}
