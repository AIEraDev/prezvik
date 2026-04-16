# @kyro/renderer-pptx

PowerPoint (PPTX) renderer for Kyro layout trees.

## Overview

This package renders positioned and themed LayoutTree structures into PowerPoint (.pptx) files. It is the final stage in the Kyro pipeline that converts layout nodes with computed coordinates into presentation slides.

## Features

- **Positioned Layout Rendering**: Renders layout trees with `_rect` coordinates
- **Coordinate Conversion**: Converts percentage-based coordinates (0-100) to PowerPoint units
- **Text Rendering**: Supports font family, size, weight, color, and alignment
- **Background Rendering**: Applies background colors to slides and text boxes
- **Standard Slide Dimensions**: Uses 16:9 widescreen format (10" × 5.625")

## Installation

```bash
pnpm add @kyro/renderer-pptx
```

## Usage

### Basic Rendering

```typescript
import { renderPPTXToFile } from "@kyro/renderer-pptx";
import type { LayoutTree } from "@kyro/layout";

const tree: LayoutTree = {
  root: {
    id: "text1",
    type: "text",
    content: "Hello, World!",
    text: {
      fontSize: 36,
      fontWeight: "bold",
      align: "center",
    },
    _rect: {
      x: 10,
      y: 40,
      width: 80,
      height: 20,
    },
  },
};

await renderPPTXToFile([tree], "output.pptx");
```

### Multiple Slides

```typescript
const slides: LayoutTree[] = [
  {
    root: {
      id: "slide1",
      type: "text",
      content: "Slide 1",
      text: { fontSize: 48, align: "center" },
      _rect: { x: 10, y: 40, width: 80, height: 20 },
    },
  },
  {
    root: {
      id: "slide2",
      type: "text",
      content: "Slide 2",
      text: { fontSize: 48, align: "center" },
      _rect: { x: 10, y: 40, width: 80, height: 20 },
    },
  },
];

await renderPPTXToFile(slides, "presentation.pptx");
```

### With Background Colors

```typescript
const tree: LayoutTree = {
  background: "F0F0F0", // Light gray slide background
  root: {
    id: "text1",
    type: "text",
    content: "Text with background",
    text: {
      fontSize: 24,
    },
    box: {
      backgroundColor: "FFFF00", // Yellow text box
    },
    _rect: { x: 10, y: 10, width: 80, height: 20 },
  },
};

await renderPPTXToFile([tree], "colored.pptx");
```

## Coordinate System

The renderer uses a **percentage-based coordinate system** (0-100) for both axes:

- **X-axis**: 0 = left edge, 100 = right edge
- **Y-axis**: 0 = top edge, 100 = bottom edge
- **Width**: 0-100 (percentage of slide width)
- **Height**: 0-100 (percentage of slide height)

### Conversion to PowerPoint Units

The renderer converts percentage coordinates to inches, which pptxgenjs then converts to EMUs (English Metric Units):

- **Slide Width**: 10 inches (9,144,000 EMUs)
- **Slide Height**: 5.625 inches (5,143,500 EMUs)
- **Aspect Ratio**: 16:9 (widescreen)

### Conversion Functions

```typescript
import { pctXtoIn, pctYtoIn } from "@kyro/renderer-pptx/utils/units";

// Convert X coordinate (horizontal)
const xInches = pctXtoIn(50); // 5 inches (50% of 10")

// Convert Y coordinate (vertical)
const yInches = pctYtoIn(50); // 2.8125 inches (50% of 5.625")
```

## Contract: \_rect Property Required

**CRITICAL**: All layout nodes MUST have a `_rect` property computed by the positioning engine before rendering.

The renderer will throw an error if `_rect` is missing:

```
Error: [renderer-pptx] Node "node-id" has no _rect.
Did you forget to call resolveLayout() before rendering?
```

### Example: Correct Usage

```typescript
import { PositioningEngine } from "@kyro/layout";
import { renderPPTXToFile } from "@kyro/renderer-pptx";

// 1. Create layout tree (without _rect)
const layoutTree = createLayoutTree();

// 2. Position the tree (adds _rect to all nodes)
const positioningEngine = new PositioningEngine();
const positionedTree = positioningEngine.positionTree(layoutTree);

// 3. Render to PPTX
await renderPPTXToFile([positionedTree], "output.pptx");
```

## Supported Node Types

### Text Node

```typescript
{
  type: "text",
  content: "Text content",
  text: {
    fontSize: 24,
    fontFamily?: "Arial",
    fontWeight?: "bold" | "normal",
    italic?: boolean,
    color?: "FF0000", // Hex color (no #)
    align?: "left" | "center" | "right",
    lineSpacingMultiple?: 1.15,
  },
  box?: {
    backgroundColor?: "FFFF00",
    borderColor?: "000000",
    borderWidth?: 0.5,
  },
  _rect: { x: 10, y: 10, width: 80, height: 20 },
}
```

### Image Node

```typescript
{
  type: "image",
  src: "path/to/image.png", // or data:image/png;base64,...
  objectFit?: "contain" | "cover",
  _rect: { x: 10, y: 10, width: 80, height: 60 },
}
```

### Shape Node

```typescript
{
  type: "shape",
  shape: "rect" | "ellipse" | "line" | "rounded-rect",
  fill?: "FF0000",
  stroke?: "000000",
  strokeWidth?: 0.5,
  _rect: { x: 10, y: 10, width: 30, height: 30 },
}
```

### Container Node

```typescript
{
  type: "container",
  children: [
    // Child nodes with _rect
  ],
  _rect: { x: 0, y: 0, width: 100, height: 100 },
}
```

## Testing

Run the test suite:

```bash
pnpm test
```

The test suite includes:

- **\_rect property validation**: Ensures error handling for missing coordinates
- **Coordinate conversion**: Verifies percentage-to-inches conversion accuracy
- **Text rendering**: Tests font properties, alignment, and styling
- **Background rendering**: Tests slide and text box backgrounds
- **Integration tests**: Creates actual PPTX files and verifies validity

Test output files are created in `test-output/` directory.

## API Reference

### `renderPPTX(slides: LayoutTree[]): Promise<PptxGenJS>`

Renders layout trees to a PptxGenJS instance.

**Parameters:**

- `slides`: Array of positioned layout trees (one per slide)

**Returns:** Promise resolving to PptxGenJS instance

**Throws:** Error if any node is missing `_rect` property

### `renderPPTXToFile(slides: LayoutTree[], fileName?: string): Promise<void>`

Renders layout trees and saves to a file.

**Parameters:**

- `slides`: Array of positioned layout trees
- `fileName`: Output file path (default: "output.pptx")

**Returns:** Promise resolving when file is written

## Architecture

The renderer follows a **dumb executor** pattern:

- **Zero positioning logic**: All coordinates come from `_rect`
- **No layout decisions**: Layout engine handles composition
- **Pure rendering**: Converts layout nodes to PowerPoint shapes

This separation ensures:

- Clear responsibility boundaries
- Testable components
- Renderer independence (can swap PPTX for PDF, Web, etc.)

## Dependencies

- `pptxgenjs`: PowerPoint generation library
- `@kyro/layout`: Layout types and interfaces
- `@kyro/schema`: Blueprint schema definitions

## License

MIT
