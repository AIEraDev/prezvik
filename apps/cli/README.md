# Prezvik CLI

AI-native presentation engine. Dead simple, fast, opinionated.

## Quick Start

```bash
# Install
npx prezvik init

# Generate
npx prezvik generate deck.json

# Watch mode (auto-regenerate on changes)
npx prezvik dev deck.json
```

## Commands

### `init` - Create starter deck

```bash
prezvik init
prezvik init -o my-deck.json
```

Creates a starter deck with 3 example slides. Gets you from zero to value in 30 seconds.

### `generate` - Generate PowerPoint

```bash
prezvik generate deck.json
prezvik generate deck.json -o presentation.pptx
prezvik generate deck.json -t minimal
```

**Options:**

- `-o, --output <file>` - Output file (default: `output.pptx`)
- `-t, --theme <theme>` - Theme: `executive` or `minimal` (default: `executive`)

### `validate` - Validate deck schema

```bash
prezvik validate deck.json
```

Checks your deck JSON for errors before generating.

### `dev` - Watch mode

```bash
prezvik dev deck.json
prezvik dev deck.json -o presentation.pptx -t minimal
```

**The addictive loop:**

1. Edit `deck.json`
2. Slides auto-regenerate
3. Open PPTX to see changes

**Options:**

- `-o, --output <file>` - Output file (default: `output.pptx`)
- `-t, --theme <theme>` - Theme: `executive` or `minimal` (default: `executive`)

## Deck Schema

```json
{
  "version": "1.0",
  "meta": {
    "title": "My Presentation"
  },
  "slides": [
    {
      "id": "slide-1",
      "type": "hero",
      "content": {
        "title": "Welcome",
        "subtitle": "Subtitle here"
      }
    }
  ]
}
```

## Slide Types

- `hero` - Opening slide with big impact
- `bullet-list` - Classic format (1-8 bullets)
- `stat-trio` - Three metrics
- `two-column` - Split content

## Themes

- `executive` - Professional, corporate, high contrast
- `minimal` - Clean, modern, generous whitespace

## Why Prezvik?

- ✅ Type-safe schema validation
- ✅ Adaptive layout engine
- ✅ Professional design system
- ✅ Flow-based positioning
- ✅ Visual polish layer

## Development

```bash
pnpm install
pnpm build
node dist/index.js --help
```
