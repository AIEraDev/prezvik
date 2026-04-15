# Kyro

**AI-native presentation engine**

> "I typed a sentence → I got a presentation"

## 🪄 Magic Command (The Viral Moment)

```bash
kyro magic "AI startup pitch deck"
```

**Output**: Professional 6-slide presentation in **< 1 second**

That's it. No config, no decisions, no friction.

[See full Magic documentation →](./MAGIC.md)

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Try the magic
cd apps/cli
node dist/index.js magic "your idea here"
```

## What You Get

### Three Interfaces

1. **Magic Command** - One-shot pipeline (the viral moment)
2. **CLI** - Full control for developers
3. **MCP Server** - AI agent integration

### Core Features

- **Smart Templates**: Auto-detects pitch/report/educational
- **Smart Themes**: Auto-selects executive/minimal based on keywords
- **Adaptive Layout**: Professional layouts that just work
- **AI Enhancement**: Optional content polish (requires OpenAI API key)
- **Fast**: < 1 second without AI, 3-5 seconds with AI

## Architecture

```
├── apps/
│   ├── cli/                # 🪄 Magic command + dev tools
│   ├── mcp-server/        # AI agent integration
│   └── api/               # REST API (future)
├── packages/
│   ├── core/              # Pipeline orchestration
│   ├── prompt/            # Template-driven generation
│   ├── ai/                # Content enhancement + theme generation
│   ├── layout/            # 🧠 THE MOAT - Adaptive layout engine
│   ├── design/            # Design system with tokens
│   ├── renderer-pptx/     # PPTX output
│   └── renderer-gslides/  # Google Slides output
└── examples/              # Sample decks
```

## The Pipeline

```
Natural Language Prompt
  ↓
Intent Detection
  ↓
Deck Generation (template-driven)
  ↓
AI Enhancement [optional]
  ↓
Layout Engine (adaptive, flow-based)
  ↓
Design System (themed with tokens)
  ↓
Polish Layer (hierarchy, rhythm, balance)
  ↓
Positioning (compute coordinates)
  ↓
Render (PPTX or Google Slides)
```

## CLI Commands

```bash
# Magic - one command, full pipeline
kyro magic "AI startup pitch"

# Generate - JSON to PPTX
kyro generate deck.json

# Init - create starter deck
kyro init

# Validate - check schema
kyro validate deck.json

# Dev - watch mode
kyro dev deck.json
```

## Examples

```bash
# Startup pitch
kyro magic "AI-powered developer tools startup pitch"

# Financial report
kyro magic "Q3 2024 financial report for enterprise SaaS"

# Educational content
kyro magic "Introduction to machine learning for beginners"

# Dark theme
kyro magic "dark modern fintech product launch"

# With AI enhancement
export OPENAI_API_KEY="sk-..."
kyro magic "startup pitch deck"
```

## Why Kyro?

### For Users

- **Zero friction**: One command, instant output
- **Professional quality**: Layout engine ensures visual polish
- **Smart defaults**: No design decisions needed

### For Developers

- **Clean architecture**: Each package has one job
- **Extensible**: Add templates, themes, or renderers
- **Type-safe**: Full TypeScript with Zod validation

### The Moat

The **layout engine** is the real product:

- Adaptive text measurement
- Flow-based positioning
- Automatic overflow handling
- Visual hierarchy enforcement
- Vertical rhythm optimization

Competitors have AI. We have **structured intelligence**.

## Development

```bash
# Install
pnpm install

# Build all
pnpm build

# Build specific package
pnpm --filter @kyro/layout build

# Run tests
./test-magic.sh

# Demo
./demo-magic.sh
```

## Project Status

**v0.1** - Template-driven generation

- ✅ Magic command
- ✅ 3 templates (pitch, report, educational)
- ✅ 2 themes (executive, minimal)
- ✅ AI content enhancement
- ✅ AI theme generation
- ✅ PPTX renderer
- ✅ Google Slides renderer
- ✅ MCP server

**v0.2** - LLM-assisted generation (coming soon)

- 🔄 Full customization
- 🔄 More templates and themes
- 🔄 Multi-language support

## Documentation

- [Magic Command](./MAGIC.md) - The viral moment
- [Slide Types](./docs/SLIDE_TYPES.md) - Available slide types
- [CLI README](./apps/cli/README.md) - Full CLI documentation
- [MCP Server](./apps/mcp-server/README.md) - AI agent integration

## License

MIT

---

**Built with**: TypeScript, pptxgenjs, OpenAI, Zod, Commander

**The vision**: idea → presentation, zero friction
