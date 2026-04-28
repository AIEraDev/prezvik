# Layout Engine - Positioning Engine

## Overview

The Positioning Engine converts relative layout trees into absolute coordinates. It computes explicit x/y positions for all layout nodes, enabling renderers to place elements precisely.

## Key Features

- **Percentage-based coordinates**: Uses 0-100 range for renderer independence
- **Multiple layout modes**: Flow (vertical/horizontal), Grid, and Absolute positioning
- **Padding and margin support**: Proper box model implementation
- **Height estimation**: Automatic height calculation for text nodes
- **Nested layouts**: Recursive positioning for complex hierarchies

## Usage

```typescript
import { PositioningEngine } from "@prezvik/layout/v1";
import type { LayoutTree } from "@prezvik/layout";

// Create engine
const engine = new PositioningEngine();

// Position layout trees
const positioned = engine.position(layoutTrees);

// Access computed coordinates
const rect = positioned[0].root._rect;
console.log(rect); // { x: 0, y: 0, width: 100, height: 100 }
```

## Layout Modes

### Flow Layout (Vertical)

Stacks children vertically with gap spacing:

```typescript
{
  type: "container",
  layout: {
    type: "flow",
    direction: "vertical",
    gap: 10
  },
  children: [...]
}
```

### Flow Layout (Horizontal)

Arranges children side-by-side:

```typescript
{
  type: "container",
  layout: {
    type: "flow",
    direction: "horizontal",
    gap: 5
  },
  children: [...]
}
```

### Grid Layout

Positions children in rows and columns:

```typescript
{
  type: "container",
  layout: {
    type: "grid",
    columns: 3,
    columnGap: 10,
    rowGap: 10
  },
  children: [...]
}
```

### Absolute Layout

Uses explicit coordinates when provided:

```typescript
{
  type: "container",
  layout: {
    type: "absolute"
  },
  children: [
    {
      id: "positioned",
      type: "text",
      _rect: { x: 10, y: 20, width: 30, height: 40 },
      ...
    }
  ]
}
```

## Coordinate System

- **Origin**: Top-left corner (0, 0)
- **Range**: 0-100 for both x/y and width/height
- **Units**: Percentage-based (renderer converts to native units)
- **Storage**: Computed rectangles stored in `node._rect` property

## Padding and Margin

### Padding

Applied to container bounds before positioning children:

```typescript
{
  type: "container",
  padding: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  children: [...]
}
```

### Margin

External spacing around nodes (respected by positioning engine):

```typescript
{
  type: "text",
  margin: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  },
  ...
}
```

## Height Estimation

The engine automatically estimates heights for text nodes based on:

- Font size
- Content length
- Character width (estimated at 0.6 × font size)
- Line height (1.5 × font size)

For containers with flow layout, height is calculated as the sum of children heights plus gaps.

## Testing

Comprehensive unit tests cover:

- Flow layout (vertical and horizontal)
- Grid layout (2, 3, 4 columns)
- Absolute positioning
- Padding application
- Margin handling
- Height estimation
- Edge cases (empty containers, single child, many children)

Run tests:

```bash
pnpm test
```

## Implementation Details

### Core Algorithm

1. Start with root node and full slide bounds (0-100)
2. Apply padding to get content bounds
3. Position children based on layout mode:
   - **Flow**: Stack sequentially with gap spacing
   - **Grid**: Calculate cell dimensions and position in rows/columns
   - **Absolute**: Use explicit coordinates or fall back to parent bounds
4. Recursively position nested containers
5. Store computed rectangle in `node._rect`

### Performance

- O(n) complexity where n is total number of nodes
- Single pass through tree
- No backtracking or iteration
- Efficient for large presentations (100+ nodes)

## Examples

See `positioning-engine.example.ts` for complete examples of:

- Simple vertical flow layout
- Grid layout with statistics
- Nested containers
- Padding and margin usage

## Integration

The Positioning Engine is part of the Prezvik v1 pipeline:

```
Blueprint → Layout Engine → Positioning Engine → Theme Resolver → Renderer
```

It bridges the gap between relative layout trees (from Layout Engine) and absolute coordinates (required by renderers).

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **4.1**: Computes absolute x/y coordinates for all layout nodes
- **4.2**: Computes width and height dimensions for all layout nodes
- **4.3**: Handles flow layout mode with sequential positioning and gap spacing
- **4.4**: Handles grid layout mode with rows and columns
- **4.5**: Handles absolute layout mode with explicit coordinates
- **4.6**: Respects padding values when positioning children
- **4.7**: Respects margin values when calculating node boundaries
- **4.8**: Uses percentage-based coordinates (0-100)
- **4.9**: Stores computed rectangles in `node._rect` property
- **4.10**: Returns LayoutTree with all nodes having valid `_rect` values
