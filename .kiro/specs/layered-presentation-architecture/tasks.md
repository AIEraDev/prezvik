# Implementation Plan: Layered Presentation Architecture

## Overview

This implementation plan follows the 6-phase migration strategy outlined in the design document. The architecture introduces three distinct layers (Theme, Visual, Export) with a pipeline orchestrator, moving from the current monolithic rendering approach to a modular, extensible system that enables procedural generation of backgrounds, gradients, and shapes.

The implementation uses TypeScript and integrates with the existing Kyro codebase, maintaining backward compatibility through a dual-mode pipeline (legacy/layered) during the migration period.

## Tasks

### Phase 1: Foundation (Weeks 1-2)

- [x] 1. Create package structure and install dependencies
  - [x] 1.1 Create `@kyro/theme-layer` package with TypeScript configuration
    - Create `packages/theme-layer/` directory structure
    - Add `package.json` with dependencies: `culori@^3.3.0`
    - Configure `tsconfig.json` for TypeScript compilation
    - Set up exports in `src/index.ts`
    - _Requirements: 10.1, 6.1_
  - [x] 1.2 Create `@kyro/visual-layer` package with TypeScript configuration
    - Create `packages/visual-layer/` directory structure
    - Add `package.json` with dependencies: `konva@^9.3.0`
    - Configure `tsconfig.json` for TypeScript compilation
    - Set up exports in `src/index.ts`
    - _Requirements: 10.1, 7.1_
  - [x] 1.3 Create `@kyro/export-layer` package with TypeScript configuration
    - Create `packages/export-layer/` directory structure
    - Add `package.json` (uses existing `pptxgenjs` from `@kyro/renderer-pptx`)
    - Configure `tsconfig.json` for TypeScript compilation
    - Set up exports in `src/index.ts`
    - _Requirements: 10.1, 3.10_
  - [x] 1.4 Create `@kyro/pipeline` package with TypeScript configuration
    - Create `packages/pipeline/` directory structure
    - Add `package.json` with dependencies on theme-layer, visual-layer, export-layer
    - Configure `tsconfig.json` for TypeScript compilation
    - Set up exports in `src/index.ts`
    - _Requirements: 10.1, 4.1_

- [x] 2. Define core data models and interfaces
  - [x] 2.1 Define `ColorPalette` interface in `@kyro/theme-layer`
    - Create `src/models/color-palette.ts`
    - Define `ColorPalette` interface with version, semantic colors, scales, metadata
    - Define `ColorSpace` type (rgb, hsl, oklch, lab)
    - Export from package index
    - _Requirements: 1.8, 6.2_
  - [x] 2.2 Define `VisualContext` interface in `@kyro/visual-layer`
    - Create `src/models/visual-context.ts`
    - Define `VisualContext` interface with slides, colorPalette, theme, metadata
    - Define `SlideVisualContext` interface
    - Define `Dimensions`, `Point`, `Rect` utility types
    - Export from package index
    - _Requirements: 2.8, 9.1_
  - [x] 2.3 Define `VisualElement` types in `@kyro/visual-layer`
    - Create `src/models/visual-element.ts`
    - Define base `VisualElement` interface
    - Define `BackgroundElement`, `ShapeElement`, `ContentElement` interfaces
    - Define `Fill` types (SolidFill, GradientFill, PatternFill)
    - Define `Stroke`, `TextContent`, `ImageContent` interfaces
    - Export from package index
    - _Requirements: 2.8, 2.2_
  - [x] 2.4 Define `Renderer` interface in `@kyro/export-layer`
    - Create `src/renderer-interface.ts`
    - Define `Renderer` interface with render(), validate(), getSupportedFeatures() methods
    - Define `RenderOptions`, `RenderResult`, `ValidationResult`, `FeatureSupport` interfaces
    - Export from package index
    - _Requirements: 3.10, 8.1_

- [x] 3. Implement dual-mode pipeline controller
  - [x] 3.1 Create `PipelineController` class in `@kyro/pipeline`
    - Create `src/pipeline-controller.ts`
    - Implement constructor accepting layer facades, cache manager, performance monitor
    - Implement `execute()` method with mode parameter (legacy/layered)
    - Add error handling for each phase
    - Add performance monitoring hooks
    - _Requirements: 4.1, 10.1_
  - [x] 3.2 Implement legacy mode execution path
    - Create `executeThemeLayer()`, `executeVisualLayer()`, `executeExportLayer()` private methods
    - Implement legacy mode that bypasses new layers
    - Ensure backward compatibility with existing `generateDeck()` function
    - _Requirements: 10.3, 10.6_
  - [x] 3.3 Update `@kyro/core` to support dual-mode pipeline
    - Modify `packages/kyro-core/src/generator/index.ts` (or equivalent)
    - Add `mode` parameter to `generateDeck()` function
    - Default to 'legacy' mode initially
    - Add logging to indicate which mode is active
    - _Requirements: 10.6, 10.8_
  - [x] 3.4 Write unit tests for pipeline controller
    - Test dual-mode switching
    - Test error handling in each phase
    - Test performance monitoring
    - _Requirements: 12.8_

- [x] 4. Checkpoint - Verify foundation is stable
  - Ensure all packages build successfully
  - Ensure all existing tests pass
  - Ensure pipeline controller can execute in legacy mode
  - Ask the user if questions arise

### Phase 2: Theme Layer Implementation (Weeks 3-4)

- [x] 5. Implement color palette generation
  - [x] 5.1 Implement `ColorPaletteGenerator` class
    - Create `packages/theme-layer/src/palette-generator.ts`
    - Implement `generatePalette(themeSpec: ThemeSpec): ColorPalette` method
    - Use Culori's `interpolate()` for color interpolation
    - Support OKLCH color space for perceptual uniformity
    - Validate input colors and throw `ColorParseError` for invalid formats
    - _Requirements: 1.1, 1.7, 6.1_
  - [x] 5.2 Implement `generateScale()` method for color scales
    - Add `generateScale(startColor, endColor, steps, colorSpace)` method
    - Use Culori for interpolation in specified color space
    - Return array of interpolated colors
    - _Requirements: 1.2, 6.4_
  - [x] 5.3 Write unit tests for ColorPaletteGenerator
    - Test palette generation from ThemeSpec
    - Test color scale generation
    - Test invalid color format handling
    - Test OKLCH interpolation produces perceptually uniform results
    - _Requirements: 12.1, 12.2_

- [x] 6. Implement gradient generation
  - [x] 6.1 Implement `GradientGenerator` class
    - Create `packages/theme-layer/src/gradient-generator.ts`
    - Implement `generateLinear(stops, angle): LinearGradient` method
    - Implement `generateRadial(stops, center, radius): RadialGradient` method
    - Validate stop positions (0-1 range) and color formats
    - _Requirements: 1.3, 1.4, 6.3_
  - [x] 6.2 Write unit tests for GradientGenerator
    - Test linear gradient generation
    - Test radial gradient generation
    - Test stop position validation
    - _Requirements: 12.3_

- [x] 7. Implement blend mode engine
  - [x] 7.1 Implement `BlendModeEngine` class
    - Create `packages/theme-layer/src/blend-mode-engine.ts`
    - Implement `blend(baseColor, blendColor, mode, opacity): string` method
    - Use Culori's blend mode functions
    - Support common blend modes (multiply, screen, overlay, darken, lighten)
    - Convert colors to RGB for blending
    - _Requirements: 1.6, 6.1_
  - [x] 7.2 Write unit tests for BlendModeEngine
    - Test each blend mode
    - Test alpha channel preservation
    - Test invalid blend mode handling

- [x] 8. Implement caching for Theme Layer
  - [x] 8.1 Create `CacheManager` class in `@kyro/pipeline`
    - Create `packages/pipeline/src/cache-manager.ts`
    - Implement `get<T>(namespace, key): T | undefined` method
    - Implement `set<T>(namespace, key, value): void` method
    - Implement LRU eviction when cache reaches max size
    - Implement TTL-based expiration (default 1 hour)
    - _Requirements: 11.6, 11.7_
  - [x] 8.2 Implement cache key hashing
    - Add `hashThemeSpec(themeSpec): string` method
    - Add `hashLayoutTrees(layoutTrees): string` method
    - Use simple hash function for cache keys
    - _Requirements: 11.7_
  - [x] 8.3 Integrate caching into Theme Layer
    - Modify `PipelineController.executeThemeLayer()` to check cache before generation
    - Store generated palettes in cache
    - Log cache hits/misses
    - _Requirements: 11.6, 11.7_

- [x] 9. Create Theme Layer facade
  - [x] 9.1 Implement `ThemeLayerFacade` class
    - Create `packages/theme-layer/src/facade.ts`
    - Accept ColorPaletteGenerator, GradientGenerator, BlendModeEngine in constructor
    - Implement `generatePalette(themeSpec): Promise<ColorPalette>` method
    - Export from package index
    - _Requirements: 1.1, 4.4_

- [x] 10. Checkpoint - Verify Theme Layer works
  - Ensure Theme Layer generates valid ColorPalette from ThemeSpec
  - Ensure color interpolation produces perceptually uniform results
  - Ensure caching reduces redundant color generation
  - Ask the user if questions arise

### Phase 3: Visual Layer Implementation (Weeks 5-7)

- [x] 11. Implement background generation
  - [x] 11.1 Implement `BackgroundGenerator` class
    - Create `packages/visual-layer/src/background-generator.ts`
    - Implement `generateBackground(slideType, colorPalette, dimensions): BackgroundElement` method
    - Hero slides: generate gradient backgrounds with 45° or 135° angles
    - Section slides: generate solid or subtle gradient backgrounds
    - Content slides: generate minimal backgrounds (solid light color)
    - Use colors from ColorPalette based on slide type
    - _Requirements: 2.1, 5.5, 5.6, 5.7_
  - [x] 11.2 Write unit tests for BackgroundGenerator
    - Test gradient background for hero slides
    - Test solid background for content slides
    - Test background uses colors from ColorPalette
    - _Requirements: 12.4_

- [x] 12. Implement shape generation
  - [x] 12.1 Implement `ShapeGenerator` class
    - Create `packages/visual-layer/src/shape-generator.ts`
    - Implement `generateShapes(slideType, colorPalette, contentBounds, themeTone): ShapeElement[]` method
    - Use Konva to create geometric shapes (rectangles, circles, polygons, lines)
    - Executive tone: rectangles and lines
    - Minimal tone: circles and subtle shapes
    - Modern tone: polygons and dynamic shapes
    - _Requirements: 2.2, 5.3, 7.2_
  - [x] 12.2 Implement collision detection to avoid content overlap
    - Add collision detection logic to ensure shapes don't overlap with contentBounds
    - Use spatial indexing (simple bounding box checks) for efficiency
    - Skip shapes that would overlap with content
    - _Requirements: 5.9, 2.2_
  - [x] 12.3 Write unit tests for ShapeGenerator
    - Test shapes don't overlap with content bounds
    - Test different shapes for different theme tones
    - Test shape generation for different slide types
    - _Requirements: 12.5_

- [x] 13. Implement fill engine
  - [x] 13.1 Implement `FillEngine` class
    - Create `packages/visual-layer/src/fill-engine.ts`
    - Implement `createSolidFill(color): SolidFill` method
    - Implement `createGradientFill(gradient): GradientFill` method
    - Implement `createPatternFill(pattern): PatternFill` method
    - Convert gradient definitions to Konva gradient objects
    - _Requirements: 2.3, 2.4, 2.5, 2.6_
  - [x] 13.2 Write unit tests for FillEngine
    - Test solid fill creation
    - Test gradient fill creation
    - Test pattern fill creation

- [x] 14. Implement theme engine orchestration
  - [x] 14.1 Implement `ThemeEngine` class
    - Create `packages/visual-layer/src/theme-engine.ts`
    - Implement `generateVisuals(layoutNode, colorPalette, slideType, themeTone): VisualElement[]` method
    - Delegate to BackgroundGenerator for backgrounds
    - Delegate to ShapeGenerator for decoration shapes
    - Apply decoration rules based on slide type and theme tone
    - Ensure decorations don't overlap with content areas
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.8, 5.9_
  - [x] 14.2 Write unit tests for ThemeEngine
    - Test visual generation for different slide types
    - Test decoration rules for different theme tones
    - Test content overlap prevention

- [x] 15. Implement Visual Context builder
  - [x] 15.1 Implement `VisualContextBuilder` class
    - Create `packages/visual-layer/src/visual-context-builder.ts`
    - Implement `build(layoutTrees, visualElements, colorPalette): VisualContext` method
    - Merge layout nodes with visual elements
    - Preserve layout tree structure
    - Add metadata (generatedAt, layoutTreeHash, themeSpecHash)
    - Validate completeness
    - _Requirements: 2.8, 4.5_
  - [x] 15.2 Implement layout-to-content conversion
    - Add helper method to convert LayoutNode to ContentElement[]
    - Extract text content from layout nodes
    - Extract image content from layout nodes
    - Recursively process children
    - _Requirements: 2.7_

- [x] 16. Implement Visual Context serialization
  - [x] 16.1 Add JSON serialization support
    - Ensure VisualContext can be serialized to JSON with `JSON.stringify()`
    - Ensure VisualContext can be parsed from JSON with `JSON.parse()`
    - _Requirements: 9.1, 9.2_
  - [x] 16.2 Write property-based tests for serialization round-trip
    - **Property 1: Round-trip consistency**
    - **Validates: Requirements 9.7**
    - Use fast-check to generate arbitrary VisualContext objects
    - Test that parsing then serializing then parsing produces equivalent object
    - Test edge cases (empty arrays, special characters)
    - _Requirements: 9.7, 12.9_

- [x] 17. Create Visual Layer facade
  - [x] 17.1 Implement `VisualLayerFacade` class
    - Create `packages/visual-layer/src/facade.ts`
    - Accept ThemeEngine, VisualContextBuilder in constructor
    - Implement `generateSlideVisuals(layoutTree, colorPalette, slideTheme, themeTone): Promise<SlideVisualContext>` method
    - Separate visual elements by type (background, decorations, content)
    - Export from package index
    - _Requirements: 2.7, 4.5_

- [x] 18. Checkpoint - Verify Visual Layer works
  - Ensure Visual Layer generates complete VisualContext
  - Ensure backgrounds vary appropriately by slide type
  - Ensure decorations don't overlap with content
  - Ensure Visual Context can be serialized to JSON
  - Ask the user if questions arise

### Phase 4: Export Layer Implementation (Weeks 8-9)

- [x] 19. Implement PPTX renderer
  - [x] 19.1 Implement `PPTXRenderer` class
    - Create `packages/export-layer/src/pptx-renderer.ts`
    - Implement `Renderer` interface
    - Implement `render(visualContext, options): Promise<RenderResult>` method
    - Implement `validate(visualContext): ValidationResult` method
    - Implement `getSupportedFeatures(): FeatureSupport` method
    - _Requirements: 3.1, 3.3, 8.4_
  - [x] 19.2 Implement gradient conversion for PPTX
    - Add private `convertGradient(gradient): any` method
    - Convert LinearGradient to PptxGenJS gradient format
    - Convert RadialGradient to PptxGenJS gradient format
    - Map color stops to PptxGenJS format
    - _Requirements: 3.5, 7.9_
  - [x] 19.3 Implement shape conversion for PPTX
    - Add private `convertShape(shape): any` method
    - Convert ShapeElement to PptxGenJS shape
    - Map shape types (rectangle, circle, polygon, line) to PptxGenJS shapes
    - Apply fills and strokes
    - _Requirements: 3.5, 2.2_
  - [x] 19.4 Implement text and image rendering for PPTX
    - Convert ContentElement (text) to PptxGenJS text boxes
    - Convert ContentElement (image) to PptxGenJS images
    - Preserve layout bounds and styling
    - _Requirements: 3.3_
  - [x] 19.5 Write integration tests for PPTX renderer
    - Test rendering Visual Context to PPTX
    - Test gradient conversion
    - Test shape conversion
    - Test output file is valid PPTX
    - _Requirements: 12.6, 3.11_

- [x] 20. Implement web renderer
  - [x] 20.1 Implement `WebRenderer` class
    - Create `packages/export-layer/src/web-renderer.ts`
    - Implement `Renderer` interface
    - Implement `render(visualContext, options): Promise<RenderResult>` method using Reveal.js
    - Implement `validate(visualContext): ValidationResult` method
    - Implement `getSupportedFeatures(): FeatureSupport` method
    - _Requirements: 3.2, 3.4, 8.5_
  - [x] 20.2 Implement HTML/CSS generation for web
    - Add private `generateHTML(visualContext): string` method
    - Generate Reveal.js HTML structure
    - Convert shapes to SVG elements
    - Add responsive design considerations
    - _Requirements: 3.4, 3.7, 3.8, 3.9_
  - [x] 20.3 Implement gradient conversion for CSS
    - Add private `generateCSS(visualContext): string` method
    - Convert LinearGradient to CSS linear-gradient()
    - Convert RadialGradient to CSS radial-gradient()
    - Generate CSS for all visual elements
    - _Requirements: 3.7, 7.9_
  - [x] 20.4 Write integration tests for web renderer
    - Test rendering Visual Context to HTML
    - Test gradient conversion to CSS
    - Test shape conversion to SVG
    - _Requirements: 12.7_

- [x] 21. Create Export Layer facade
  - [x] 21.1 Implement `ExportLayerFacade` class
    - Create `packages/export-layer/src/facade.ts`
    - Initialize renderers map with PPTXRenderer and WebRenderer
    - Implement `getRenderer(format): Renderer` method
    - Throw error for unsupported formats
    - Export from package index
    - _Requirements: 3.10, 8.6_

- [x] 22. Checkpoint - Verify Export Layer works
  - Ensure PPTXRenderer produces valid PPTX files
  - Ensure WebRenderer produces valid HTML slides
  - Ensure output quality matches or exceeds current renderer
  - Ask the user if questions arise

### Phase 5: Integration and Testing (Weeks 10-11)

- [x] 23. Integrate all layers into pipeline
  - [x] 23.1 Complete pipeline controller implementation
    - Update `packages/pipeline/src/pipeline-controller.ts`
    - Implement `executeThemeLayer()` with caching
    - Implement `executeVisualLayer()` with slide iteration
    - Implement `executeExportLayer()` with renderer selection
    - Add error handling with `ErrorHandler` class
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 23.2 Implement error handling
    - Create `packages/pipeline/src/error-handler.ts`
    - Implement `handleThemeError()` method with fallback to default palette
    - Implement `handleVisualError()` method with fallback to minimal visuals
    - Implement `handleExportError()` method with fallback to PPTX
    - Define custom error types (ColorParseError, ShapeGenerationError, etc.)
    - _Requirements: 4.7_
  - [x] 23.3 Implement performance monitoring
    - Create `packages/pipeline/src/performance-monitor.ts`
    - Implement `startPhase()` and `endPhase()` methods
    - Track execution time for each layer
    - Implement `getReport()` to return performance metrics
    - _Requirements: 4.8, 11.1, 11.2, 11.3, 11.4_

- [x] 24. Update generateDeck() function for layered mode
  - [x] 24.1 Implement layered mode execution path
    - Update `packages/kyro-core/src/generator/index.ts` (or equivalent)
    - Create `generateDeckLayered()` function
    - Instantiate PipelineController with all layer facades
    - Execute pipeline with layoutTrees, themeSpec, and output format
    - Handle pipeline errors and return results
    - _Requirements: 4.6, 10.4, 10.5_
  - [x] 24.2 Add configuration option for rendering mode
    - Add `mode` parameter to `generateDeck()` options
    - Default to 'legacy' mode initially
    - Log which rendering mode is active
    - _Requirements: 10.5, 10.8_

- [x] 25. Write end-to-end integration tests
  - [x] 25.1 Write end-to-end pipeline tests
    - Test complete pipeline execution from Blueprint to PPTX
    - Test all three layers execute in sequence
    - Test error handling in each phase
    - Test performance monitoring
    - _Requirements: 12.8, 4.9_
  - [x] 25.2 Write dual-mode comparison tests
    - Generate presentations in both legacy and layered modes
    - Compare output quality
    - Verify visual similarity
    - _Requirements: 10.9_

- [x] 26. Performance optimization
  - [x] 26.1 Profile each layer and identify bottlenecks
    - Run performance tests for Theme Layer (target: < 100ms per slide)
    - Run performance tests for Visual Layer (target: < 500ms per slide)
    - Run performance tests for Export Layer (target: < 1000ms per slide)
    - Run end-to-end test for 10-slide presentation (target: < 5 seconds)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  - [x] 26.2 Optimize Theme Layer
    - Verify color palette caching is working
    - Pre-compute common color scales
    - Use lookup tables for frequently used interpolations
    - _Requirements: 11.6, 11.7_
  - [x] 26.3 Optimize Visual Layer
    - Implement shape generation caching by slide type and theme tone
    - Optimize collision detection with spatial indexing
    - Reuse Konva stage across slides
    - _Requirements: 11.5, 11.8_
  - [x] 26.4 Optimize Export Layer
    - Batch PptxGenJS operations
    - Reuse shape definitions across slides
    - Cache converted gradients
    - _Requirements: 11.4_

- [x] 27. Checkpoint - Verify integration is complete
  - Ensure end-to-end pipeline executes successfully
  - Ensure performance meets requirements (< 5s for 10 slides)
  - Ensure visual output quality is equivalent or better
  - Ensure all tests pass in both modes
  - Ask the user if questions arise

### Phase 6: Gradual Rollout (Weeks 12-14)

- [x] 28. Enable layered mode for testing
  - [x] 28.1 Add feature flag for layered mode
    - Add environment variable or configuration option to enable layered mode
    - Update documentation on how to enable layered mode
    - Monitor error rates and performance in layered mode
    - _Requirements: 10.5_
  - [x] 28.2 Create comparison tool for A/B testing
    - Create script to generate presentations in both modes
    - Compare output files
    - Generate visual diff reports
    - _Requirements: 10.9_

- [x] 29. Fix issues and refine visual generation
  - [x] 29.1 Address bugs found in testing
    - Fix any rendering errors
    - Fix any visual quality issues
    - Fix any performance issues
    - _Requirements: 10.7_
  - [x] 29.2 Refine procedural generation algorithms
    - Adjust background generation for better aesthetics
    - Adjust decoration shape placement
    - Fine-tune color palette generation
    - _Requirements: 5.10_

- [x] 30. Switch default mode to layered
  - [x] 30.1 Update default mode in generateDeck()
    - Change default mode from 'legacy' to 'layered'
    - Update documentation
    - Announce change to users
    - _Requirements: 10.5_
  - [x] 30.2 Deprecate legacy mode
    - Add deprecation warning when legacy mode is used
    - Set timeline for legacy mode removal
    - Provide migration guide
    - _Requirements: 10.1_

- [x] 31. Final checkpoint - Verify rollout is successful
  - Ensure layered mode is stable in production
  - Ensure error rates are acceptable
  - Ensure performance is acceptable
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at the end of each phase
- The implementation follows the 6-phase migration strategy from the design document
- TypeScript is used throughout for type safety and consistency with the existing codebase
- The dual-mode pipeline ensures backward compatibility during migration
- Performance targets: Theme Layer < 100ms, Visual Layer < 500ms, Export Layer < 1000ms per slide
- Property-based tests are only used for Visual Context serialization (round-trip property)
- Unit tests and integration tests cover component behaviors and layer interactions
