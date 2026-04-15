# Kyro AI

Intelligent features that create the real moat:

1. **Auto Theme Generation** - Natural language → design tokens
2. **Content Intelligence** - Weak content → impactful slides

## Setup

Set OpenAI API key:

```bash
export OPENAI_API_KEY="sk-..."
```

## 1. Auto Theme Generator

Turn descriptions into complete design systems.

### Usage

```typescript
import { generateTheme } from "@kyro/ai";

const theme = await generateTheme("Modern dark theme for AI startup with neon accents");

// Returns complete theme with:
// - colors (background, text, primary, accent, etc.)
// - typography (fontFamily, scale, weights)
// - spacing (8px base unit scale)
// - layout (padding, maxWidth)
```

### CLI

```bash
kyro theme "dark fintech futuristic" -o custom-theme.json
```

### Why This Matters

- **Instant branding** - No designer required
- **Infinite themes** - Generate unlimited variations
- **Consistent** - Always follows design system structure

## 2. Content Intelligence

Transform weak content into impactful presentation text.

### Rewrite

```typescript
import { rewriteText } from "@kyro/ai";

const improved = await rewriteText("Our product helps users do things faster");
// → "Accelerate workflows by 3x with AI-powered automation"
```

### Enhance Slides

```typescript
import { enhanceSlide, enhanceDeck } from "@kyro/ai";

// Enhance single slide
const enhanced = await enhanceSlide(slide.content);

// Enhance entire deck
const betterDeck = await enhanceDeck(deck);
```

### Summarize

```typescript
import { summarize } from "@kyro/ai";

const short = await summarize(longText, 100); // Max 100 chars
```

### Score Quality

```typescript
import { scoreContent } from "@kyro/ai";

const result = await scoreContent("Our product is good");
// { score: 4, feedback: "Too vague, lacks specifics" }
```

## Pipeline Integration

### Before AI:

```
Prompt → Schema → Layout → Render
```

### With AI:

```
Prompt → Schema → AI Enhancement → Layout → Render
                    ↓
              (rewrite, enhance, score)
```

## The Moat

**Without AI:**

- Generic slides
- Weak content
- Manual theming

**With AI:**

- Crafted slides
- Impactful content
- Instant branding

## Strategic Advantage

Your competitors:

- **AI tools** → Chaotic outputs
- **Slide tools** → Static templates

**You:**

- **Structured + Intelligent + Adaptive**

That's rare.

## Development

```bash
pnpm build
pnpm dev  # Watch mode
```

## Next: Magic Command

Combine everything:

```bash
kyro magic "pitch deck for AI startup"
```

Does:

1. Generate deck from prompt
2. Enhance content with AI
3. Generate custom theme
4. Render professional slides

**That's the viral moment.**
