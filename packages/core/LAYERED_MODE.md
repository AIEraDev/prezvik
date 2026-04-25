# Layered Rendering Mode

## Overview

Kyro supports two rendering modes:

1. **Layered Mode** (default): The new three-layer architecture (Theme → Visual → Export)
2. **Legacy Mode** (DEPRECATED): The original monolithic rendering approach

**⚠️ DEPRECATION NOTICE**: Legacy mode is deprecated and will be removed in v2.0 (Q3 2026). Please migrate to layered mode.

The layered mode introduces a modular pipeline with clear separation of concerns:

- **Theme Layer**: Color palette generation, gradients, and blend modes
- **Visual Layer**: Procedural background and shape generation
- **Export Layer**: Multi-format rendering (PPTX, HTML)

## Using Layered Mode (Default)

Layered mode is now the default. No configuration is needed:

```typescript
import { generateDeck } from "@kyro/core";

// Uses layered mode by default
await generateDeck(schema, "output.pptx");
```

### Explicit Configuration

You can explicitly specify layered mode if desired:

```typescript
await generateDeck(schema, "output.pptx", { mode: "layered" });
```

## Using Legacy Mode (Deprecated)

**⚠️ WARNING**: Legacy mode is deprecated and will be removed in v2.0.

### Method 1: Environment Variable

```bash
# Enable legacy mode (not recommended)
export KYRO_PIPELINE_MODE=legacy

# Run your application
npm run dev
```

### Method 2: Function Parameter

```typescript
import { generateDeck } from "@kyro/core";

// Use legacy mode (deprecated)
await generateDeck(schema, "output.pptx", { mode: "legacy" });
```

**Note**: You will see deprecation warnings when using legacy mode.

## Configuration Priority

The pipeline mode is determined in this order (highest to lowest priority):

1. Function parameter (`options.mode`)
2. Environment variable (`KYRO_PIPELINE_MODE`)
3. Configuration API (`updateConfig`)
4. Default value (`layered`)

## Additional Configuration Options

### Performance Monitoring

```bash
# Enable/disable performance monitoring (default: true)
export KYRO_ENABLE_PERFORMANCE_MONITORING=true
```

### Caching

```bash
# Enable/disable caching (default: true)
export KYRO_ENABLE_CACHING=true
```

### Log Level

```bash
# Set log level: debug, info, warn, error (default: info)
export KYRO_LOG_LEVEL=debug
```

## Monitoring and Debugging

### Performance Metrics

When layered mode is enabled, the pipeline reports performance metrics:

```typescript
const result = await pipeline.execute(layoutTrees, themeSpec, "pptx");

console.log("Performance Report:", result.performance);
// Output:
// {
//   phases: {
//     theme: { count: 1, totalTime: 50, avgTime: 50, ... },
//     visual: { count: 1, totalTime: 300, avgTime: 300, ... },
//     export: { count: 1, totalTime: 800, avgTime: 800, ... }
//   }
// }
```

### Error Rates

Monitor error rates by checking the pipeline result:

```typescript
const result = await pipeline.execute(layoutTrees, themeSpec, "pptx");

if (!result.success) {
  console.error("Pipeline failed:", result.error);
  console.error("Failed phase:", result.error.phase);
}
```

### Debug Logging

Enable debug logging to see detailed execution information:

```bash
export KYRO_LOG_LEVEL=debug
```

## Testing Both Modes

To compare output between legacy and layered modes:

```typescript
import { generateDeck } from "@kyro/core";

// Generate with legacy mode
await generateDeck(schema, "output-legacy.pptx", { mode: "legacy" });

// Generate with layered mode
await generateDeck(schema, "output-layered.pptx", { mode: "layered" });

// Compare the outputs manually or use the comparison tool (see below)
```

## Comparison Tool

A comparison tool is available to generate presentations in both modes and compare outputs:

```bash
# Run the comparison tool
npm run compare-modes -- --schema path/to/schema.json --output comparison-report
```

See `scripts/compare-modes.ts` for more details.

## Known Limitations

### Layered Mode

- Currently supports PPTX and HTML output formats
- PDF export is planned but not yet implemented
- Some advanced PowerPoint features may not be fully supported

### Legacy Mode (Deprecated)

- **DEPRECATED**: Will be removed in v2.0 (Q3 2026)
- No new features will be added to legacy mode
- Migration to layered mode is required
- See [Migration Guide](../docs/migration-guide.md) for details

## Migration Guide

**Layered mode is now the default.** Most users don't need to do anything.

### If You Were Using Legacy Mode Explicitly

Remove explicit legacy mode configuration:

```typescript
// Before (deprecated)
await generateDeck(schema, "output.pptx", { mode: "legacy" });

// After (uses default layered mode)
await generateDeck(schema, "output.pptx");
```

### Testing the Migration

Compare outputs to ensure visual similarity:

```bash
npm run compare-modes -- --schema your-schema.json
```

### Full Migration Guide

See the complete [Migration Guide](../docs/migration-guide.md) for detailed instructions.

## Troubleshooting

### Issue: Layered mode is slower than legacy mode

**Solution**: Ensure caching is enabled:

```bash
export KYRO_ENABLE_CACHING=true
```

### Issue: Visual differences between modes

**Solution**: This is expected during the transition period. The layered mode uses procedural generation which may produce slightly different visuals. Use the comparison tool to identify specific differences.

### Issue: Pipeline fails in layered mode

**Solution**: Check the error phase and message:

```typescript
if (!result.success) {
  console.error("Failed phase:", result.error.phase);
  console.error("Error:", result.error.message);
}
```

Enable debug logging for more details:

```bash
export KYRO_LOG_LEVEL=debug
```

## Support

For issues or questions about layered mode:

1. Check the [Design Document](.kiro/specs/layered-presentation-architecture/design.md)
2. Review the [Requirements](.kiro/specs/layered-presentation-architecture/requirements.md)
3. Open an issue with the `layered-mode` label

## Roadmap

- [x] Phase 6: Gradual rollout
- [x] Switch default mode to layered
- [x] Deprecate legacy mode
- [ ] Remove legacy mode (v2.0 - Q3 2026)
