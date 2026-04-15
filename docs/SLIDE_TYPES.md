# Kyro Slide Types

The 10 core slide types that define the Kyro UX.

## Design Philosophy

Each slide type is:

- **Purpose-built** for a specific communication goal
- **Validated** at schema level for correctness
- **Adaptive** to content length and density
- **Professional** with proper spacing and positioning

## The 10 Core Types

### 1. Hero

**Purpose**: Opening slide with big impact

**Use when**: Starting presentation, introducing major sections

**Content**:

- `kicker` (optional): Small text above title
- `title` (required): Main message
- `subtitle` (optional): Supporting text

**Example**:

```json
{
  "type": "hero",
  "content": {
    "kicker": "Q1 2026 Launch",
    "title": "Revolutionary Product",
    "subtitle": "Changing the game"
  }
}
```

---

### 2. Bullet List

**Purpose**: Classic presentation format for key points

**Use when**: Listing features, benefits, or action items

**Content**:

- `title` (required): Section heading
- `bullets` (required): 1-8 bullet points

**Adaptive behavior**:

- 1-3 bullets → spacious layout
- 4-6 bullets → comfortable spacing
- 7-8 bullets → compact layout
- 9+ bullets → automatically switches to two-column

**Example**:

```json
{
  "type": "bullet-list",
  "content": {
    "title": "Key Features",
    "bullets": ["Lightning-fast performance", "Intuitive user interface", "Enterprise-grade security"]
  }
}
```

---

### 3. Stat Trio

**Purpose**: Three key metrics side-by-side

**Use when**: Showing KPIs, results, or comparisons

**Content**:

- `title` (optional): Section heading
- `stats` (required): Exactly 3 stats
  - `label`: Metric name
  - `value`: Metric value
  - `delta` (optional): Change indicator (e.g., "+12%")

**Example**:

```json
{
  "type": "stat-trio",
  "content": {
    "title": "Q1 Results",
    "stats": [
      { "label": "Users", "value": "10K", "delta": "+12%" },
      { "label": "Revenue", "value": "$50K", "delta": "+8%" },
      { "label": "Growth", "value": "25%", "delta": "+5pts" }
    ]
  }
}
```

---

### 4. Two Column

**Purpose**: Split content layout for comparison or balance

**Use when**: Showing before/after, pros/cons, or parallel content

**Content**:

- `title` (optional): Section heading
- `left`: Array of content blocks
- `right`: Array of content blocks

**Content block types**:

- `text`: Plain text
- `list`: Bullet list
- `image`: Image reference

**Example**:

```json
{
  "type": "two-column",
  "content": {
    "title": "Before vs After",
    "left": [
      { "type": "text", "text": "Before" },
      { "type": "list", "items": ["Manual", "Slow", "Error-prone"] }
    ],
    "right": [
      { "type": "text", "text": "After" },
      { "type": "list", "items": ["Automated", "Fast", "Reliable"] }
    ]
  }
}
```

---

### 5. Quote

**Purpose**: Large centered quote with attribution

**Use when**: Highlighting testimonials, key insights, or memorable statements

**Content**:

- `quote` (required): The quote text
- `author` (optional): Who said it
- `role` (optional): Their title/position

**Example**:

```json
{
  "type": "quote",
  "content": {
    "quote": "This changed how we work",
    "author": "Jane Smith",
    "role": "CEO, Acme Corp"
  }
}
```

---

### 6. Image Full

**Purpose**: Full-bleed image with optional caption

**Use when**: Showing product screenshots, photos, or visual impact

**Content**:

- `src` (required): Image URL or path
- `caption` (optional): Image description
- `overlay` (optional): Dark overlay for text readability

**Example**:

```json
{
  "type": "image-full",
  "content": {
    "src": "product-screenshot.png",
    "caption": "Our new dashboard",
    "overlay": true
  }
}
```

---

### 7. Section Header

**Purpose**: Divider slide between major sections

**Use when**: Transitioning between topics or chapters

**Content**:

- `section` (required): Section name
- `subtitle` (optional): Section description

**Example**:

```json
{
  "type": "section-header",
  "content": {
    "section": "Product Features",
    "subtitle": "What makes us different"
  }
}
```

---

### 8. Comparison

**Purpose**: Side-by-side comparison with labels

**Use when**: Comparing options, plans, or approaches

**Content**:

- `title` (optional): Comparison heading
- `left`: Label + items
- `right`: Label + items

**Example**:

```json
{
  "type": "comparison",
  "content": {
    "title": "Free vs Pro",
    "left": {
      "label": "Free",
      "items": ["Basic features", "1 user", "Email support"]
    },
    "right": {
      "label": "Pro",
      "items": ["All features", "Unlimited users", "24/7 support"]
    }
  }
}
```

---

### 9. Timeline

**Purpose**: Sequential events or milestones

**Use when**: Showing roadmap, history, or process steps

**Content**:

- `title` (optional): Timeline heading
- `events` (required): 2-6 events
  - `date`: When it happened/will happen
  - `title`: Event name
  - `description` (optional): Event details

**Example**:

```json
{
  "type": "timeline",
  "content": {
    "title": "Product Roadmap",
    "events": [
      { "date": "Q1 2026", "title": "Beta Launch" },
      { "date": "Q2 2026", "title": "Public Release" },
      { "date": "Q3 2026", "title": "Enterprise Features" }
    ]
  }
}
```

---

### 10. CTA

**Purpose**: Call to action / closing slide

**Use when**: Ending presentation with clear next steps

**Content**:

- `title` (required): Main CTA message
- `subtitle` (optional): Supporting text
- `action` (required): Action button text
- `url` (optional): Link destination

**Example**:

```json
{
  "type": "cta",
  "content": {
    "title": "Ready to get started?",
    "subtitle": "Join thousands of happy customers",
    "action": "Start Free Trial",
    "url": "https://example.com/signup"
  }
}
```

---

## Extensibility

The slide type system is extensible. To add custom types:

1. Define schema in `packages/schema/src/v1/slide-types.ts`
2. Add validator in `packages/schema/src/v1/types/`
3. Create layout strategy in `packages/layout/src/strategies/`
4. Register in layout registry

## Adaptive Behavior

All slide types include adaptive logic:

- **Font scaling**: Adjusts based on content length
- **Density control**: Spacing adapts to item count
- **Overflow handling**: Enforces max items with "+N more"
- **Layout switching**: Automatically chooses better layouts

This intelligence is in the layout engine, not the renderer.

## Validation

Every slide type is validated at schema level:

```typescript
import { SlideTypeSchema } from "@kyro/schema";

const result = SlideTypeSchema.safeParse(slideData);
if (!result.success) {
  console.error("Invalid slide:", result.error);
}
```

Validation catches errors early, before layout or rendering.
