# @prezvik/schema

Type-safe schema definitions and validation for Prezvik.

## Architecture

```
Raw Input
    ↓
Base Schema Validation (structure)
    ↓
Type-Specific Validation (semantics)
    ↓
Normalized Output
```

This is **compiler-level architecture** for deck generation.

## Usage

```typescript
import { parseDeck, SlideTypeValidators } from "@prezvik/schema";

// Parse and validate a complete deck
const deck = parseDeck({
  id: "deck-1",
  title: "My Presentation",
  slides: [
    {
      id: "slide-1",
      type: "hero",
      content: {
        title: "Welcome",
        subtitle: "To Prezvik",
        kicker: "Presentation System",
      },
    },
    {
      id: "slide-2",
      type: "stat-trio",
      content: {
        title: "Key Metrics",
        stats: [
          { label: "Users", value: "10K", delta: "+12%" },
          { label: "Revenue", value: "$50K", delta: "+8%" },
          { label: "Growth", value: "25%", delta: "+5pts" },
        ],
      },
    },
  ],
});
```

## Supported Slide Types

- **hero**: Opening slide with title, subtitle, and kicker
- **bullet-list**: Classic presentation format with title and bullets
- **stat-trio**: Three key metrics side-by-side (enforces exactly 3)
- **two-column**: Split content layout with flexible blocks

## Type-Specific Validation

Each slide type has its own validator:

```typescript
import { SlideTypeValidators } from "@prezvik/schema";

// Validate hero content
const heroContent = SlideTypeValidators.hero.parse({
  title: "Welcome",
  subtitle: "Optional subtitle",
});

// Validate stat trio (enforces exactly 3 stats)
const statContent = SlideTypeValidators["stat-trio"].parse({
  stats: [
    { label: "Metric 1", value: "100" },
    { label: "Metric 2", value: "200" },
    { label: "Metric 3", value: "300" },
  ],
});
```

## Extensibility

Unknown slide types are allowed (for plugins and experiments):

```typescript
const deck = parseDeck({
  slides: [
    {
      type: "custom-type", // ✅ Allowed
      content: {
        /* any structure */
      },
    },
  ],
});
```

This enables:

- Future slide types
- Plugin systems
- Experimentation
- Without breaking the system

## Why This Matters

**Without this layer:**

- Layout engine becomes spaghetti
- Every slide type is a special case
- System doesn't scale

**With this layer:**

- Layout engine becomes deterministic
- Type-safe content handling
- Enforced design constraints (e.g., stat-trio requires exactly 3 stats)
- Clear separation of concerns

## Design Principles

1. **Generic → Specific**: Base validation first, then type-specific
2. **Fail Fast**: Catch errors at schema level, not in layout engine
3. **Extensible**: Allow unknown types for future growth
4. **Deterministic**: Same input always produces same output
5. **Type-Safe**: Full TypeScript support with inferred types
