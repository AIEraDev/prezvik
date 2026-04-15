# 🪄 Kyro Magic

**The viral moment: one command, full pipeline**

> "I typed a sentence → I got a presentation"

## Quick Start

```bash
# Basic usage (no AI)
kyro magic "AI startup pitch deck"

# With AI enhancement (requires OPENAI_API_KEY)
export OPENAI_API_KEY="sk-..."
kyro magic "AI startup pitch deck"

# Custom output
kyro magic "Q3 report" -o quarterly-review.pptx

# Skip AI features
kyro magic "pitch deck" --no-enhance --no-theme-gen
```

## What It Does

Magic orchestrates the full Kyro pipeline:

```
Natural Language Prompt
  ↓
Intent Detection (pitch/report/educational)
  ↓
Deck Generation (template-driven)
  ↓
Content Enhancement (AI) [optional]
  ↓
Theme Generation (AI) [optional]
  ↓
Layout Engine (adaptive, flow-based)
  ↓
Design System (themed with tokens)
  ↓
Polish Layer (hierarchy, rhythm, balance)
  ↓
Positioning (compute coordinates)
  ↓
Render (PPTX)
```

## Features

### 🎯 Smart Template Detection

Magic automatically detects the right template:

- **Pitch Deck**: "AI startup pitch", "fundraising deck", "investor presentation"
- **Report**: "Q3 report", "quarterly review", "financial summary"
- **Educational**: "tutorial", "course", "introduction to", "learning"

### 🎨 Smart Theme Detection

Magic automatically picks the right theme:

- **Executive**: "corporate", "enterprise", "professional", "business"
- **Minimal**: "dark", "minimal", "clean", "simple", "modern"

### ✨ AI Enhancement (Optional)

When `OPENAI_API_KEY` is set, Magic can:

1. **Enhance Content**: Rewrite bullets and titles for maximum impact
2. **Generate Themes**: Create custom design tokens from natural language

## Options

```
-o, --output <file>     Output file (default: kyro-magic.pptx)
-t, --theme <theme>     Use existing theme (executive|minimal)
--no-enhance            Skip AI content enhancement
--no-theme-gen          Skip AI theme generation
```

## Examples

### Example 1: Startup Pitch

```bash
kyro magic "AI-powered developer tools startup pitch deck"
```

**Output**: 6 slides

- Hero slide with company vision
- Problem statement
- Solution overview
- Key features
- Market opportunity
- Call to action

### Example 2: Financial Report

```bash
kyro magic "Q3 2024 financial report for enterprise SaaS"
```

**Output**: 5 slides

- Executive summary
- Key metrics
- Revenue breakdown
- Growth trends
- Next quarter outlook

### Example 3: Educational Content

```bash
kyro magic "Introduction to machine learning for beginners"
```

**Output**: 5 slides

- Course overview
- Core concepts
- Key techniques
- Practical examples
- Next steps

### Example 4: Dark Theme

```bash
kyro magic "dark modern fintech product launch"
```

**Output**: Minimal theme with dark aesthetic

### Example 5: With AI Enhancement

```bash
export OPENAI_API_KEY="sk-..."
kyro magic "startup pitch deck"
```

**Output**: AI-enhanced content with polished copy

## Performance

Without AI:

- **Speed**: < 1 second
- **Cost**: $0

With AI enhancement:

- **Speed**: 3-5 seconds (parallel processing)
- **Cost**: ~$0.01 per deck (gpt-4o-mini)

## Architecture

Magic is a thin orchestrator that chains together:

1. **@kyro/prompt** - Template-driven deck generation
2. **@kyro/ai** - Content enhancement and theme generation
3. **@kyro/layout** - Adaptive layout engine
4. **@kyro/design** - Design system with tokens
5. **@kyro/renderer-pptx** - PPTX rendering

## Why This Matters

### For Users

- **Zero friction**: One command, instant output
- **No decisions**: Smart defaults for everything
- **Professional quality**: Layout engine ensures visual polish

### For Developers

- **Clean pipeline**: Each package has one job
- **Extensible**: Add new templates, themes, or renderers
- **Testable**: Pure functions, no side effects

## Limitations

### Current (v0.1)

- Template-driven (v1) - limited customization
- Two themes only (executive, minimal)
- PPTX output only
- English only

### Coming Soon

- LLM-assisted generation (v2) - full customization
- More themes and templates
- Google Slides output
- Multi-language support

## Testing

Run the test suite:

```bash
./test-magic.sh
```

This generates 6 test presentations covering:

- Different templates (pitch, report, educational)
- Different themes (executive, minimal)
- Theme detection logic

## Troubleshooting

### "OPENAI_API_KEY not set"

If you see this error but don't want AI features:

```bash
kyro magic "your prompt" --no-enhance --no-theme-gen
```

### Slow performance

AI enhancement adds 3-5 seconds. Skip it for speed:

```bash
kyro magic "your prompt" --no-enhance
```

### Output quality issues

The layout engine is deterministic. If output looks wrong:

1. Check your prompt - be specific
2. Try a different theme with `-t minimal` or `-t executive`
3. Report issues with the exact prompt used

## Next Steps

1. **Try it**: `kyro magic "your idea"`
2. **Customize**: Edit generated JSON with `kyro generate`
3. **Watch mode**: Use `kyro dev` for live editing
4. **MCP integration**: Use with AI agents via MCP server

## The Vision

Magic is designed to feel **effortless**:

- No config files
- No design decisions
- No manual layout
- No friction

Just: **idea → presentation**

That's the magic.
