# Example Schemas

This directory contains example schemas for testing and demonstration purposes.

## Available Examples

### demo-schema.json

A simple 4-slide presentation demonstrating the layered architecture:

- **Slide 1 (Hero)**: Title slide
- **Slide 2 (Content)**: Three-layer architecture explanation
- **Slide 3 (Data)**: Performance metrics
- **Slide 4 (Closing)**: Closing slide

**Usage:**

```bash
# Generate with legacy mode
npm run compare-modes -- --schema examples/demo-schema.json --output comparison-report

# Or use directly with generateDeck
node -e "
const { generateDeck } = require('@kyro/core');
const schema = require('./examples/demo-schema.json');
generateDeck(schema, 'output.pptx', { mode: 'layered' });
"
```

## Creating Your Own Schemas

Schemas follow the Kyro Blueprint v2.0 format. See `packages/schema` for the full specification.

### Basic Structure

```json
{
  "version": "2.0",
  "meta": {
    "title": "Your Presentation Title",
    "language": "en",
    "goal": "inform",
    "tone": "modern"
  },
  "slides": [
    {
      "id": "slide-1",
      "type": "hero",
      "intent": "Slide purpose",
      "layout": "center_focus",
      "content": [
        {
          "type": "heading",
          "value": "Your Title",
          "level": "h1",
          "emphasis": "high"
        }
      ]
    }
  ]
}
```

### Slide Types

- `hero`: Title/hero slides with large headings
- `content`: Content slides with text and bullets
- `data`: Data slides with stats and metrics
- `closing`: Closing slides

### Layout Types

- `center_focus`: Centered content
- `two_column`: Two-column layout
- `grid_2x2`: 2x2 grid layout

### Content Types

- `heading`: Headings (h1, h2)
- `text`: Body text
- `bullets`: Bullet point lists
- `stat`: Statistics/metrics

## Testing

Use the comparison tool to test your schemas:

```bash
npm run compare-modes -- --schema examples/your-schema.json --output report
```

This will generate presentations in both legacy and layered modes and provide a detailed comparison report.
