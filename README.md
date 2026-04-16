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

# Set up AI provider (required)
export OPENAI_API_KEY="sk-..."
# or
export ANTHROPIC_API_KEY="sk-ant-..."
# or
export GROQ_API_KEY="gsk_..."

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

- **AI-Powered Generation**: Uses OpenAI, Anthropic, or Groq for intelligent Blueprint creation
- **Smart Themes**: Auto-selects executive/minimal/modern based on keywords
- **Adaptive Layout**: Professional layouts with percentage-based positioning
- **Multiple Providers**: Choose between OpenAI, Anthropic, or Groq
- **Fast**: 2-5 seconds for complete presentation generation

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

Kyro v1 implements a complete 6-stage pipeline that transforms natural language prompts into professional presentations:

```
User Prompt
    ↓
[1] Blueprint Generation
    ↓ (Blueprint v2 JSON)
[2] Validation Layer
    ↓ (Validated Blueprint)
[3] Layout Engine v2
    ↓ (Layout Trees)
[4] Positioning Engine
    ↓ (Positioned Trees with coordinates)
[5] Theme Resolver
    ↓ (Themed Trees)
[6] PPTX Renderer
    ↓
Output File (.pptx)
```

### Pipeline Stages

**Stage 1: Blueprint Generation**

- Transforms user prompts into structured Blueprint JSON
- Uses AI providers (OpenAI, Anthropic, Groq) for intelligent generation
- Infers presentation metadata (goal, tone, audience) from prompt
- Assigns appropriate slide types and layouts

**Stage 2: Validation Layer**

- Validates Blueprint against Zod schema
- Ensures all required fields are present
- Verifies content blocks match discriminated union types
- Provides actionable error messages with field paths

**Stage 3: Layout Engine v2**

- Transforms Blueprint into layout node trees
- Applies layout rules based on slide type
- Creates container nodes with flow, grid, or absolute layouts
- Converts content blocks into text and container nodes

**Stage 4: Positioning Engine**

- Computes absolute x/y coordinates for all nodes
- Uses percentage-based coordinates (0-100) for renderer independence
- Handles flow, grid, and absolute positioning modes
- Respects padding, margins, and gap spacing
- Stores computed rectangles in `node._rect` property

**Stage 5: Theme Resolver**

- Applies theme tokens (colors, fonts) to positioned nodes
- Resolves semantic roles (fontRole, colorRole) to actual values
- Supports multiple themes (executive, minimal, modern)
- Preserves explicit styling overrides from Blueprint

**Stage 6: PPTX Renderer**

- Renders positioned, themed layout trees to PowerPoint files
- Converts percentage coordinates to PowerPoint EMUs
- Creates text boxes, shapes, and backgrounds
- Produces valid .pptx files that open in PowerPoint/Keynote

### Blueprint Format

Kyro uses Blueprint as its intermediate representation (IR). Blueprint is a structured JSON format that describes presentation content, layout, and styling:

```json
{
  "version": "2.0",
  "meta": {
    "title": "AI in Education",
    "goal": "inform",
    "tone": "modern",
    "audience": "educators"
  },
  "slides": [
    {
      "id": "s1",
      "type": "hero",
      "intent": "Introduce the topic",
      "layout": "center_focus",
      "content": [
        {
          "type": "heading",
          "value": "AI in Education",
          "level": "h1",
          "emphasis": "high"
        }
      ]
    }
  ]
}
```

**Key Features:**

- **Slide Types**: hero, section, content, comparison, grid, quote, data, callout, closing
- **Layout Types**: center_focus, two_column, three_column, split_screen, grid_2x2, hero_overlay, timeline, stat_highlight, image_dominant
- **Content Blocks**: heading, text, bullets, quote, stat, code
- **Semantic Roles**: Font and color roles for theme-independent styling

### Coordinate System

Kyro uses a percentage-based coordinate system (0-100) for renderer independence:

- **X/Y coordinates**: 0-100 (percentage of slide dimensions)
- **Width/Height**: 0-100 (percentage of slide dimensions)
- **Origin**: Top-left corner (0, 0)
- **Slide bounds**: (0, 0) to (100, 100)

This approach allows the same positioned layout to be rendered to different targets (PPTX, PDF, Web) without recalculation. Renderers convert percentages to their native units (EMUs for PowerPoint, pixels for Web).

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
# Set up API key first
export OPENAI_API_KEY="sk-..."

# Startup pitch
kyro magic "AI-powered developer tools startup pitch"

# Financial report
kyro magic "Q3 2024 financial report for enterprise SaaS"

# Educational content
kyro magic "Introduction to machine learning for beginners"

# With different provider
export ANTHROPIC_API_KEY="sk-ant-..."
kyro magic "startup pitch deck" --provider anthropic

# With custom theme
kyro magic "fintech product launch" --theme modern
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

**v1.0** - Complete AI-powered pipeline ✅

- ✅ 6-stage pipeline (Blueprint → Validation → Layout → Positioning → Theming → Rendering)
- ✅ Blueprint format with full schema validation
- ✅ AI-powered Blueprint generation (OpenAI, Anthropic, Groq)
- ✅ Positioning Engine with percentage-based coordinates
- ✅ Theme Resolver with semantic roles
- ✅ PPTX renderer with coordinate conversion
- ✅ Magic command with auto-theme detection
- ✅ Comprehensive error handling and diagnostics
- ✅ Full test coverage (unit + integration)
- ✅ Unified schema architecture (no v1/v2 split)

**v1.1** - Enhanced features (coming soon)

- 🔄 Google Slides renderer integration
- 🔄 Additional themes and customization
- 🔄 Multi-language support
- 🔄 Advanced layout modes

## Documentation

- [Implementation Spec](./.kiro/specs/kyro-pipeline-integration/) - Complete pipeline implementation spec
- [CLI README](./apps/cli/README.md) - Full CLI documentation
- [MCP Server](./apps/mcp-server/README.md) - AI agent integration

## License

MIT

---

**Built with**: TypeScript, pptxgenjs, OpenAI, Zod, Commander

**The vision**: idea → presentation, zero friction
