# Kyro Blueprint Schema v2

**Design Compiler IR - The Foundation**

---

## What This Is

The Kyro Blueprint Schema is a **design-aware, renderer-agnostic intermediate representation** (IR) for presentations.

**Not**: "JSON for slides"  
**Is**: Design compiler IR (like LLVM IR for compilers)

---

## Core Principle

**Kyro does NOT store "slides". Kyro stores visual communication intent structured into layouts.**

Every element has:
- **Structure** (what it is)
- **Intent** (why it exists)
- **Layout** (how it's arranged)
- **Semantics** (what it means)

---

## Architecture

```
User Intent
  ↓
Blueprint Generator
  ↓
Kyro Blueprint IR ← YOU ARE HERE
  ↓
Layout Engine
  ↓
Renderer (PPTX, Canva, Web, etc.)
```

The Blueprint is the **single source of truth** that all renderers consume.

---

## Top-Level Structure

```typescript
type KyroBlueprint = {
  version: "2.0";
  meta: BlueprintMeta;
  theme?: ThemeHints;
  slides: Slide[];
};
```

### Meta (Context)

```typescript
type BlueprintMeta = {
  title: string;              // Presentation title
  subtitle?: string;          // Optional subtitle
  author?: string;            // Creator
  audience?: string;          // Target audience
  goal: "inform" | "persuade" | "educate" | "pitch" | "report";
  tone: "formal" | "modern" | "bold" | "minimal" | "friendly";
  language?: string;          // Default: "en"
};
```

**Why this matters**: Context informs layout decisions, theme selection, and animation timing.

### Theme (Design Hints)

```typescript
type ThemeHints = {
  name?: string;              // Theme identifier
  primaryColor?: string;      // Brand color
  fontPairing?: string;       // Font combination
  styleTokens?: Record<string, any>; // Custom tokens
};
```

**Why this matters**: Themes are hints, not commands. Renderers interpret based on capabilities.

---

## Slide Structure

```typescript
type Slide = {
  id: string;                 // Unique identifier
  type: SlideType;            // Semantic category
  intent: string;             // WHY this slide exists
  layout: LayoutType;         // HOW content is arranged
  content: ContentBlock[];    // WHAT is displayed
  media?: MediaBlock[];       // Images, icons, etc.
  styling?: SlideStyle;       // Design tokens
  animation?: AnimationHint;  // Motion hints
};
```

### Slide Types (Semantic Categories)

```typescript
type SlideType =
  | "hero"        // Opening slide, big impact
  | "section"     // Section divider
  | "content"     // Main content
  | "comparison"  // Side-by-side comparison
  | "grid"        // Grid of items
  | "quote"       // Large quote
  | "data"        // Data visualization
  | "callout"     // Important message
  | "closing";    // Final slide
```

**Why this matters**: Type informs default layout, animation, and emphasis.

### Layout Types (Composition Rules)

```typescript
type LayoutType =
  | "center_focus"      // Center-heavy, maximum whitespace
  | "two_column"        // Split content
  | "three_column"      // Three columns
  | "split_screen"      // Full-bleed split
  | "grid_2x2"          // 2x2 grid
  | "hero_overlay"      // Text over image
  | "timeline"          // Sequential flow
  | "stat_highlight"    // Large stat display
  | "image_dominant";   // Image-first
```

**Why this matters**: Layout is EXPLICIT, never guessed. This is the moat.

### Intent (Critical for AI)

```typescript
intent: "Capture attention and introduce the company vision"
```

**Why this matters**: 
- AI can reason about slide purpose
- Renderers can optimize for intent
- Humans can understand structure

---

## Content Blocks (Structured Thinking)

Instead of raw text, Kyro uses typed blocks:

### Heading Block

```typescript
{
  type: "heading",
  value: "AI is reshaping how we learn",
  level: "h1" | "h2" | "h3",
  emphasis: "low" | "medium" | "high"
}
```

### Text Block

```typescript
{
  type: "text",
  value: "From personalized tutors to adaptive learning",
  emphasis: "low" | "medium" | "high"
}
```

### Bullet Block

```typescript
{
  type: "bullets",
  items: [
    { 
      text: "Personalized learning", 
      icon: "🧠",              // Semantic emoji
      highlight: false 
    },
    { 
      text: "Instant feedback", 
      icon: "⚡",
      highlight: true          // Emphasize this item
    }
  ]
}
```

**Why icons matter**: Emojis are semantic signals, not decoration.

### Quote Block

```typescript
{
  type: "quote",
  text: "Education is the most powerful weapon",
  author: "Nelson Mandela",
  role: "Former President"
}
```

### Stat Block

```typescript
{
  type: "stat",
  value: "$10B",
  label: "Total Addressable Market",
  prefix: "$",
  suffix: "B",
  visualWeight: "hero" | "emphasis" | "normal"
}
```

### Code Block

```typescript
{
  type: "code",
  code: "const x = 42;",
  language: "javascript"
}
```

---

## Media Blocks (Semantic Placement)

```typescript
type MediaBlock = {
  type: "image" | "icon" | "illustration" | "chart";
  
  source?: {
    query?: string;           // AI image search
    url?: string;             // Direct URL
    aiGenerated?: boolean;    // AI-generated
  };
  
  placement: "background" | "inline" | "side" | "full_bleed";
  
  style?: {
    filter?: "none" | "soft" | "vibrant" | "monochrome";
    crop?: "square" | "wide" | "portrait" | "auto";
  };
};
```

**Why this matters**: Media placement is semantic, not random.

### Example

```typescript
{
  type: "image",
  source: {
    query: "abstract AI neural network glowing education"
  },
  placement: "background",
  style: {
    filter: "soft"
  }
}
```

---

## Slide Styling (Design Tokens)

```typescript
type SlideStyle = {
  background?: {
    type: "solid" | "gradient" | "image";
    value?: string;
  };
  textColor?: string;
  alignment?: "left" | "center" | "right";
  spacing?: "tight" | "normal" | "wide";
};
```

**Why this matters**: Tokens, not inline styles. Theme resolver interprets.

---

## Animation Hints (Intent, Not Execution)

```typescript
type AnimationHint = {
  entrance?: "fade" | "slide" | "zoom" | "none";
  sequence?: "all" | "staggered" | "step_by_step";
  emphasis?: "pulse" | "highlight" | "scale_focus";
};
```

**Why this matters**: Hints, not commands. Renderers decide implementation.

---

## Complete Example

```json
{
  "version": "2.0",
  "meta": {
    "title": "AI in Education",
    "goal": "inform",
    "tone": "modern",
    "audience": "students"
  },
  "theme": {
    "name": "kyro_modern_dark"
  },
  "slides": [
    {
      "id": "s1",
      "type": "hero",
      "intent": "Capture attention and introduce AI transformation",
      "layout": "center_focus",
      "content": [
        {
          "type": "heading",
          "value": "AI is reshaping how we learn",
          "level": "h1",
          "emphasis": "high"
        },
        {
          "type": "text",
          "value": "From personalized tutors to adaptive learning"
        }
      ],
      "media": [
        {
          "type": "image",
          "source": {
            "query": "abstract AI neural network education"
          },
          "placement": "background",
          "style": {
            "filter": "soft"
          }
        }
      ]
    },
    {
      "id": "s2",
      "type": "content",
      "intent": "Explain key benefits of AI in learning",
      "layout": "two_column",
      "content": [
        {
          "type": "heading",
          "value": "Key Benefits",
          "level": "h2"
        },
        {
          "type": "bullets",
          "items": [
            { "text": "Personalized learning", "icon": "🧠" },
            { "text": "Instant feedback", "icon": "⚡" },
            { "text": "Global accessibility", "icon": "🌍" }
          ]
        }
      ]
    }
  ]
}
```

---

## Why This Schema Wins

### 1. Layout Intelligence

**Others**: Dump text into templates  
**Kyro**: Explicit layout rules, semantic composition

### 2. Renderer Independence

**Others**: PPTX-specific structure  
**Kyro**: One IR → many outputs (PPTX, Canva, Web, PDF)

### 3. AI Controllability

**Others**: LLM generates final chaos  
**Kyro**: LLM generates structured blueprint → deterministic rendering

### 4. Design Consistency

**Others**: Random styling  
**Kyro**: Theme tokens + layout rules = coherence

### 5. Semantic Meaning

**Others**: Text is text  
**Kyro**: Every element has intent, type, and purpose

---

## Hard Design Rules

**NEVER BREAK THESE**:

1. **Kyro NEVER outputs raw slides**  
   Always blueprint first, render second

2. **Layout is always explicit**  
   No guessing in renderer

3. **Media is semantically justified**  
   Not decorative noise

4. **Content is structured blocks**  
   Not raw text dumps

5. **Styling is tokens**  
   Not inline styles

6. **Animation is hints**  
   Not execution commands

---

## Layout Rules

Each layout type has explicit rules:

```typescript
const LAYOUT_RULES = {
  center_focus: {
    composition: "center",
    alignment: "center",
    titleSize: "56-72px",
    bodySize: "20-24px",
    whitespace: "maximum",
    padding: 64,
    gap: 32,
    focal: "title"
  },
  
  two_column: {
    composition: "split",
    alignment: "left",
    titleSize: "40-48px",
    bodySize: "16-20px",
    whitespace: "balanced",
    padding: 48,
    gap: 32,
    columns: 2,
    focal: "balanced"
  },
  
  // ... more rules
};
```

**Why this matters**: This is where "beautiful slides" comes from.

---

## Processing Pipeline

```
1. User Input
   ↓
2. Intent Detection
   ↓
3. Blueprint Generation (template-driven or LLM)
   ↓
4. Blueprint Validation (Zod schema)
   ↓
5. Layout Engine (apply rules)
   ↓
6. Theme Resolver (apply tokens)
   ↓
7. Polish Layer (hierarchy, rhythm)
   ↓
8. Renderer (PPTX, Canva, Web, etc.)
```

The Blueprint is step 3-4. Everything else depends on it.

---

## Validation

All blueprints are validated with Zod:

```typescript
import { KyroBlueprintSchema } from "@kyro/schema/v2";

const blueprint = { /* ... */ };

// Validate
const result = KyroBlueprintSchema.safeParse(blueprint);

if (result.success) {
  // Valid blueprint
  const validated = result.data;
} else {
  // Invalid - show errors
  console.error(result.error);
}
```

---

## Extensibility

### Adding New Slide Types

```typescript
// 1. Add to schema
type: "custom_type"

// 2. Add layout rule
LAYOUT_RULES.custom_layout = { /* rules */ };

// 3. Add to layout engine
case "custom_type":
  return composeCustomLayout(slide, rule);
```

### Adding New Content Blocks

```typescript
// 1. Add to ContentBlockSchema
z.object({
  type: z.literal("custom_block"),
  // ... fields
})

// 2. Add to layout engine
case "custom_block":
  return createCustomNode(block, rule);
```

### Adding New Layouts

```typescript
// 1. Add to LayoutType
type: "custom_layout"

// 2. Add rule
LAYOUT_RULES.custom_layout = { /* rules */ };

// 3. Implement in layout engine
```

---

## Next Steps

### Phase 1: Foundation ✅
- Blueprint schema defined
- Layout rules specified
- Validation with Zod

### Phase 2: Implementation (Current)
- Layout engine v2
- Blueprint generator v2
- Renderer contract

### Phase 3: Intelligence (Next)
- LLM blueprint generation
- Media intelligence
- Animation semantics

---

## Files

### Schema
- `packages/schema/src/v2/blueprint.ts` - Blueprint schema
- `packages/schema/src/v2/layout-rules.ts` - Layout rules

### Layout Engine
- `packages/layout/src/v2/layout-engine.ts` - Layout engine v2

### Blueprint Generator
- `packages/prompt/src/v2/blueprint-generator.ts` - Generator
- `packages/prompt/src/v2/templates/` - Templates

---

## The Vision

**The Blueprint Schema is the foundation of Kyro.**

If this is weak, everything else becomes messy hacks.

If this is strong, Kyro becomes infrastructure.

**We chose strong.** 🚀
