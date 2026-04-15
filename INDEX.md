# Kyro Documentation Index

**AI-Native Presentation Design System**

---

## Start Here

### 🎯 New to Kyro?

1. Read **[VISION.md](./VISION.md)** - Understand what Kyro is and why it matters
2. Read **[HIGHLIGHTS.md](./HIGHLIGHTS.md)** - See key achievements and differentiators
3. Try the **Magic Command**: `kyro magic "your idea"`

### 🏗️ Want to Understand the Architecture?

1. Read **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical specification
2. Read **[AI-ADAPTER-LAYER.md](./AI-ADAPTER-LAYER.md)** - Model-agnostic AI infrastructure
3. Explore the **[code organization](#code-organization)**

### 📊 Want the Complete Picture?

Read **[SUMMARY.md](./SUMMARY.md)** - Everything in one place

---

## Documentation Structure

### Strategic Documents

#### [VISION.md](./VISION.md)

**What**: Product vision and strategic positioning  
**Why Read**: Understand Kyro's category, moat, and competitive advantage  
**Key Sections**:

- What Kyro actually is (not a slide generator)
- The problem (precise definition)
- The solution (three-layer architecture)
- Design intelligence engine (the moat)
- Plugin system (ecosystem play)
- Real positioning (presentation compiler)

#### [HIGHLIGHTS.md](./HIGHLIGHTS.md)

**What**: Key achievements and differentiators  
**Why Read**: Quick overview of what makes Kyro special  
**Key Sections**:

- The strategic shift (SlideForge → Kyro)
- Core innovations (three layers, AI infrastructure)
- Technical achievements (what's built)
- Competitive positioning (who we compete with)
- The moat (technical + strategic)

#### [SUMMARY.md](./SUMMARY.md)

**What**: Complete overview of everything  
**Why Read**: Comprehensive reference document  
**Key Sections**:

- Executive summary
- What was built (detailed)
- Three-layer architecture
- Technical stack
- Performance metrics
- Roadmap

---

### Technical Documents

#### [ARCHITECTURE.md](./ARCHITECTURE.md)

**What**: Technical architecture and specifications  
**Why Read**: Understand how Kyro works internally  
**Key Sections**:

- System overview (three layers)
- Intent layer (parsing, detection)
- Composition layer (THE MOAT - six engines)
- Rendering layer (multi-target output)
- Core data structures (Blueprint schema)
- Plugin system (extensibility)

#### [AI-ADAPTER-LAYER.md](./AI-ADAPTER-LAYER.md)

**What**: Model-agnostic AI infrastructure  
**Why Read**: Understand how Kyro survives model wars  
**Key Sections**:

- What was built (adapters, router, high-level API)
- Architecture (unified interface)
- Usage examples (basic, smart routing, CLI)
- Provider comparison (OpenAI, Anthropic, Groq)
- Adding new providers (extensibility)

#### [packages/ai/ADAPTERS.md](./packages/ai/ADAPTERS.md)

**What**: AI adapter layer detailed documentation  
**Why Read**: Deep dive into AI infrastructure  
**Key Sections**:

- The problem (vendor lock-in)
- The solution (adapter layer)
- Architecture (interface, adapters, router)
- Usage (basic, high-level, CLI)
- Provider comparison
- Adding new providers

---

### User Documentation

#### [README.md](./README.md)

**What**: Main project readme  
**Why Read**: Quick start and overview  
**Key Sections**:

- What Kyro is
- Magic command
- Quick start
- CLI commands
- Examples

#### [MAGIC.md](./MAGIC.md)

**What**: Magic command documentation  
**Why Read**: Learn the one-command workflow  
**Key Sections**:

- Quick start
- What it does (full pipeline)
- Features (template detection, theme detection)
- Options
- Examples
- Performance

#### [docs/SLIDE_TYPES.md](./docs/SLIDE_TYPES.md)

**What**: Available slide types  
**Why Read**: Understand what Kyro can generate  
**Key Sections**:

- 10 core slide types
- Design philosophy
- Usage examples

---

### Status Documents

#### [STATUS.md](./STATUS.md)

**What**: Project status and test results  
**Why Read**: See what's working and what's next  
**Key Sections**:

- Mission accomplished
- What's working
- Test results
- Performance
- Next steps

#### [RENAME.md](./RENAME.md)

**What**: SlideForge → Kyro rename summary  
**Why Read**: Understand the rename process  
**Key Sections**:

- What changed
- Files updated
- Verification
- Package scope

---

## Quick Reference

### Commands

```bash
# Magic command (one-shot generation)
kyro magic "AI startup pitch deck"

# AI provider management
kyro ai list                    # List available providers
kyro ai test "prompt"           # Test a provider
kyro ai compare "prompt"        # Compare all providers
kyro ai set-default <provider>  # Set default

# Other commands
kyro init                       # Create starter deck
kyro generate deck.json         # Generate from JSON
kyro validate deck.json         # Validate schema
kyro dev deck.json              # Watch mode
```

### Programmatic Usage

```typescript
// High-level API
import { getKyroAI } from "@kyro/ai";

const ai = getKyroAI();
const deck = await ai.generateSlideDeck("AI startup pitch", {
  strategy: "quality",
});

// Core pipeline
import { generateDeck } from "@kyro/core";

await generateDeck(deck, "output.pptx", "executive");

// AI router
import { getRouter } from "@kyro/ai";

const router = getRouter();
const response = await router.generateSmart("balanced", {
  messages: [{ role: "user", content: "Hello!" }],
});
```

---

## Code Organization

```
kyro/
├── apps/
│   ├── cli/              # Magic command + dev tools
│   ├── mcp-server/       # AI agent integration
│   └── api/              # REST API (future)
│
├── packages/
│   ├── core/             # Pipeline orchestration
│   ├── prompt/           # Template-driven generation
│   ├── ai/               # Model-agnostic AI layer ⭐
│   │   ├── adapters/     # OpenAI, Anthropic, Groq
│   │   ├── content/      # Enhancement, rewrite
│   │   └── theme/        # Theme generation
│   ├── layout/           # Adaptive layout engine ⭐
│   │   ├── adaptive/     # Text measurement, overflow
│   │   ├── positioning/  # Flow, spacing, coordinates
│   │   └── polish/       # Hierarchy, rhythm, balance
│   ├── design/           # Design system with tokens
│   │   ├── tokens/       # Typography, colors, spacing
│   │   └── themes/       # Executive, minimal
│   ├── renderer-pptx/    # PPTX output
│   ├── renderer-gslides/ # Google Slides output
│   ├── schema/           # Type definitions + validation
│   └── utils/            # Shared utilities
│
└── docs/
    ├── VISION.md         # Strategic positioning ⭐
    ├── ARCHITECTURE.md   # Technical specification ⭐
    ├── HIGHLIGHTS.md     # Key achievements ⭐
    ├── SUMMARY.md        # Complete overview ⭐
    ├── INDEX.md          # This file
    └── SLIDE_TYPES.md    # Available slide types
```

---

## Key Concepts

### Three-Layer Architecture

```
Intent Layer
  ↓ (what user wants)
Composition Layer ← THE MOAT
  ↓ (structured visual blueprint)
Rendering Layer
  ↓ (multi-target output)
```

### Six Intelligence Engines

1. **Layout Engine** - Spatial reasoning
2. **Visual Hierarchy** - Typography + contrast
3. **Media Intelligence** - Image/emoji placement
4. **Animation Semantics** - Motion design rules
5. **Design System** - Theme consistency
6. **Semantic Signals** - Emoji as meaning

### Model-Agnostic AI

```
Kyro Core
  ↓
AI Router (smart routing)
  ↓
Adapters (OpenAI | Anthropic | Groq | Future...)
  ↓
Models
```

### Plugin Architecture

```typescript
interface KyroRenderer {
  render(blueprint: Blueprint): Promise<Output>;
}
```

---

## Learning Paths

### Path 1: User

1. Read [VISION.md](./VISION.md) - Understand what Kyro is
2. Read [MAGIC.md](./MAGIC.md) - Learn the magic command
3. Try it: `kyro magic "your idea"`
4. Explore [docs/SLIDE_TYPES.md](./docs/SLIDE_TYPES.md) - See what's possible

### Path 2: Developer

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
2. Read [AI-ADAPTER-LAYER.md](./AI-ADAPTER-LAYER.md) - Understand AI infrastructure
3. Explore the code in `packages/`
4. Read [packages/ai/ADAPTERS.md](./packages/ai/ADAPTERS.md) - Deep dive

### Path 3: Contributor

1. Read [SUMMARY.md](./SUMMARY.md) - Get complete picture
2. Read [STATUS.md](./STATUS.md) - See what's next
3. Check the roadmap in [VISION.md](./VISION.md)
4. Pick a Phase 2 task

### Path 4: Investor/Evaluator

1. Read [VISION.md](./VISION.md) - Understand the vision
2. Read [HIGHLIGHTS.md](./HIGHLIGHTS.md) - See the moat
3. Read [SUMMARY.md](./SUMMARY.md) - Complete overview
4. Check [STATUS.md](./STATUS.md) - Current state

---

## Roadmap

### Phase 1: Foundation ✅ (Complete)

- Layout engine, design system, PPTX renderer
- Model-agnostic AI layer (OpenAI, Anthropic, Groq)
- CLI interface, MCP server

### Phase 2: Intelligence (Next)

- Blueprint schema v2
- Layout rules engine
- Media intelligence
- Animation semantics

### Phase 3: Multi-Target (Future)

- Canva adapter
- Web renderer (React)
- PDF export
- Figma plugin

### Phase 4: Ecosystem (Future)

- Plugin marketplace
- Design system templates
- Animation library
- Community ecosystem

---

## The Vision

**Kyro is the presentation compiler for the AI era.**

When AI generates communication, Kyro ensures it's:

- Structurally correct
- Visually balanced
- Semantically meaningful
- Multi-target ready

Not slides. **Designed communication artifacts.**

---

## Quick Links

### Strategic

- [Vision](./VISION.md) - What Kyro is
- [Highlights](./HIGHLIGHTS.md) - Key achievements
- [Summary](./SUMMARY.md) - Complete overview

### Technical

- [Architecture](./ARCHITECTURE.md) - System design
- [AI Adapter Layer](./AI-ADAPTER-LAYER.md) - AI infrastructure
- [AI Adapters](./packages/ai/ADAPTERS.md) - Detailed docs

### User

- [README](./README.md) - Quick start
- [Magic Command](./MAGIC.md) - One-shot workflow
- [Slide Types](./docs/SLIDE_TYPES.md) - What's possible

### Status

- [Status](./STATUS.md) - Current state
- [Rename](./RENAME.md) - Rename summary

---

**Start with [VISION.md](./VISION.md) to understand what Kyro is and why it matters.**

🚀
