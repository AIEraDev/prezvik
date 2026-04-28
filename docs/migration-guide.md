# Migration Guide: Legacy to Layered Mode

## Overview

Prezvik has transitioned from a monolithic rendering approach (legacy mode) to a modern three-layer architecture (layered mode). As of the latest version, **layered mode is now the default**, and **legacy mode is deprecated** and will be removed in v2.0.

## What Changed?

### Legacy Mode (Deprecated)

- Monolithic rendering pipeline
- Theme and rendering tightly coupled
- Single output format (PPTX only)
- Limited visual generation capabilities

### Layered Mode (Default)

- Three-layer architecture: Theme → Visual → Export
- Procedural background and shape generation
- Multiple output formats (PPTX, HTML)
- Improved performance with caching
- Better error handling and debugging

## Timeline

- **Current**: Layered mode is the default
- **v2.0 (Q3 2026)**: Legacy mode will be removed entirely

## How to Migrate

### Option 1: Use Default (Recommended)

Simply remove any explicit `mode` configuration. Layered mode is now the default:

```typescript
// Before (legacy mode)
await generateDeck(schema, outputPath, { mode: "legacy" });

// After (layered mode - default)
await generateDeck(schema, outputPath);
```

### Option 2: Explicit Configuration

Explicitly set layered mode if you want to be clear:

```typescript
await generateDeck(schema, outputPath, { mode: "layered" });
```

### Option 3: Environment Variable

Set the environment variable:

```bash
export PREZVIK_PIPELINE_MODE=layered
```

## Staying on Legacy Mode (Temporary)

If you need to stay on legacy mode temporarily, you can:

### Via Code

```typescript
await generateDeck(schema, outputPath, { mode: "legacy" });
```

### Via Environment Variable

```bash
export PREZVIK_PIPELINE_MODE=legacy
```

**Note**: You will see deprecation warnings when using legacy mode.

## Breaking Changes

### None for Most Users

The layered mode produces visually similar output to legacy mode. Most users should see no breaking changes.

### Potential Differences

1. **Background Generation**: Layered mode uses procedural generation, which may produce slightly different backgrounds
2. **Performance**: Layered mode is generally faster due to caching
3. **Error Messages**: Error messages are more detailed in layered mode

## Testing Your Migration

1. **Generate with both modes** and compare outputs:

```typescript
// Generate with legacy mode
await generateDeck(schema, "output-legacy.pptx", { mode: "legacy" });

// Generate with layered mode
await generateDeck(schema, "output-layered.pptx", { mode: "layered" });
```

2. **Compare the outputs** visually in PowerPoint

3. **Check performance** - layered mode should be faster for multi-slide presentations

## Comparison Script

Use the built-in comparison script to test both modes:

```bash
npm run compare-modes -- path/to/schema.json
```

This will generate presentations in both modes and provide a performance comparison.

## Benefits of Layered Mode

- **Better Performance**: Caching reduces redundant operations
- **Procedural Generation**: Unique backgrounds and decorations for each presentation
- **Multiple Formats**: Export to PPTX, HTML, and more
- **Better Debugging**: Visual Context intermediate representation
- **Extensibility**: Easy to add new renderers and visual generators

## Need Help?

- **Issues**: Report migration issues on GitHub
- **Questions**: Ask in Discussions
- **Documentation**: See the full architecture docs in `.kiro/specs/layered-presentation-architecture/`

## Deprecation Timeline

| Version        | Status                             | Action Required          |
| -------------- | ---------------------------------- | ------------------------ |
| Current        | Legacy deprecated, layered default | Migrate to layered mode  |
| v1.9 (Q2 2026) | Final warning                      | Remove legacy mode usage |
| v2.0 (Q3 2026) | Legacy removed                     | Must use layered mode    |

## Summary

- **Default mode is now layered** - no action needed for most users
- **Legacy mode is deprecated** - will be removed in v2.0
- **Migration is straightforward** - usually just remove explicit mode configuration
- **Output is visually similar** - minimal differences in most cases
- **Performance is improved** - especially for multi-slide presentations

Start using layered mode today to take advantage of improved performance and features!
