# ExportLayerFacade Usage Guide

## Overview

The `ExportLayerFacade` provides a simplified interface to the Export Layer subsystem. It manages renderer instances and provides access to renderers by format.

## Installation

The facade is exported from the `@kyro/export-layer` package:

```typescript
import { ExportLayerFacade } from "@kyro/export-layer";
```

## Basic Usage

### Creating a Facade Instance

```typescript
import { ExportLayerFacade } from "@kyro/export-layer";

const facade = new ExportLayerFacade();
```

The facade automatically initializes renderers for all supported formats:

- `"pptx"`: PPTXRenderer for PowerPoint output
- `"html"`: WebRenderer for web preview output

### Getting a Renderer

```typescript
// Get PPTX renderer
const pptxRenderer = facade.getRenderer("pptx");

// Get HTML renderer
const htmlRenderer = facade.getRenderer("html");
```

### Rendering Visual Context

```typescript
import { ExportLayerFacade } from "@kyro/export-layer";
import type { VisualContext } from "@kyro/visual-layer";

const facade = new ExportLayerFacade();
const visualContext: VisualContext = /* ... */;

// Render to PPTX file
const pptxRenderer = facade.getRenderer("pptx");
const pptxResult = await pptxRenderer.render(visualContext, {
  outputPath: "output.pptx"
});

// Render to HTML buffer
const htmlRenderer = facade.getRenderer("html");
const htmlResult = await htmlRenderer.render(visualContext);
const htmlBuffer = htmlResult.buffer;
```

## Error Handling

The facade throws descriptive errors for unsupported formats:

```typescript
try {
  const renderer = facade.getRenderer("pdf"); // Unsupported format
} catch (error) {
  console.error(error.message);
  // Output: "No renderer available for format: pdf. Supported formats: pptx, html"
}
```

## Renderer Interface

All renderers returned by the facade implement the `Renderer` interface:

```typescript
interface Renderer {
  render(visualContext: VisualContext, options?: RenderOptions): Promise<RenderResult>;
  validate(visualContext: VisualContext): ValidationResult;
  getSupportedFeatures(): FeatureSupport;
}
```

### Validating Visual Context

Before rendering, you can validate the Visual Context:

```typescript
const renderer = facade.getRenderer("pptx");
const validation = renderer.validate(visualContext);

if (!validation.valid) {
  console.error("Validation errors:", validation.errors);
  console.warn("Validation warnings:", validation.warnings);
}
```

### Checking Supported Features

Different renderers support different features:

```typescript
const pptxRenderer = facade.getRenderer("pptx");
const features = pptxRenderer.getSupportedFeatures();

console.log("Gradients:", features.gradients); // true
console.log("Patterns:", features.patterns); // false
console.log("Blend modes:", features.blendModes); // false
console.log("Custom shapes:", features.customShapes); // true
```

## Integration with Pipeline

The facade is designed to be used by the Pipeline Controller:

```typescript
import { ExportLayerFacade } from "@kyro/export-layer";
import type { VisualContext } from "@kyro/visual-layer";

class PipelineController {
  private exportLayer: ExportLayerFacade;

  constructor() {
    this.exportLayer = new ExportLayerFacade();
  }

  async executeExportLayer(visualContext: VisualContext, format: "pptx" | "html", options?: RenderOptions) {
    const renderer = this.exportLayer.getRenderer(format);

    // Validate before rendering
    const validation = renderer.validate(visualContext);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // Render
    const result = await renderer.render(visualContext, options);

    if (!result.success) {
      throw new Error(`Rendering failed: ${result.errors?.join(", ")}`);
    }

    return result;
  }
}
```

## Requirements Satisfied

- **Requirement 3.10**: Export Layer provides PPTX and web preview renderers
- **Requirement 8.6**: Common Renderer interface with getRenderer(format) method
- **Requirement 8.9**: Descriptive error for unsupported formats

## See Also

- [Renderer Interface](./src/renderer-interface.ts)
- [PPTX Renderer](./src/pptx-renderer.ts)
- [Web Renderer](./src/web-renderer.ts)
