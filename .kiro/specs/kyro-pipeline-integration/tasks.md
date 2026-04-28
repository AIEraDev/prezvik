# Implementation Plan: Prezvik Pipeline Integration

## Overview

This implementation plan establishes a complete, testable end-to-end pipeline that transforms user prompts into rendered PPTX presentations. The pipeline integrates existing components (Blueprint schema, LayoutEngine, PrezVikAI) into a cohesive workflow: **Intent → Blueprint → Layout → Positioning → Theming → Rendering**.

The implementation follows a phased approach:

1. **Phase 1**: Foundation (Positioning Engine, Theme Resolver)
2. **Phase 2**: Blueprint Generation (Generator, Validation, Mock Mode)
3. **Phase 3**: Pipeline Integration (Orchestrator, Magic Command)
4. **Phase 4**: Testing and Refinement

## Tasks

- [x] 1. Implement Positioning Engine
  - [x] 1.1 Create PositioningEngine class with core positioning logic
    - Create `packages/layout/src/v2/positioning-engine.ts`
    - Implement `position(trees: LayoutTree[]): LayoutTree[]` method
    - Implement `positionTree(tree: LayoutTree): LayoutTree` method
    - Implement `positionNode(node: LayoutNode, bounds: Rectangle): void` method
    - Use percentage-based coordinates (0-100 for x/y, width/height)
    - Store computed rectangles in `node._rect` property
    - _Requirements: 4.1, 4.2, 4.8, 4.9, 4.10_

  - [x] 1.2 Implement flow layout positioning
    - Implement `positionFlowChildren(node: ContainerNode, bounds: Rectangle): void`
    - Handle vertical flow: stack children with gap spacing
    - Handle horizontal flow: arrange children side-by-side
    - Respect gap values from layout configuration
    - _Requirements: 4.3, 4.6_

  - [x] 1.3 Implement grid layout positioning
    - Implement `positionGridChildren(node: ContainerNode, bounds: Rectangle): void`
    - Calculate cell dimensions based on column count
    - Position children in rows and columns
    - Apply column and row gap spacing
    - _Requirements: 4.4, 4.6_

  - [x] 1.4 Implement absolute layout positioning
    - Implement `positionAbsoluteChildren(node: ContainerNode, bounds: Rectangle): void`
    - Use explicit coordinates when provided
    - Fall back to parent bounds if coordinates missing
    - _Requirements: 4.5_

  - [x] 1.5 Implement padding and margin support
    - Implement `applyPadding(bounds: Rectangle, padding?: Spacing): Rectangle`
    - Apply padding to container bounds before positioning children
    - Respect margin values when calculating node boundaries
    - _Requirements: 4.6, 4.7_

  - [x] 1.6 Implement height estimation for text nodes
    - Implement `estimateHeight(node: LayoutNode, width: number): number`
    - Calculate height based on font size and content length
    - Estimate line count based on character width
    - Handle container height as sum of children
    - _Requirements: 4.2_

  - [x] 1.7 Write unit tests for Positioning Engine
    - Test flow layout (vertical and horizontal)
    - Test grid layout with various column counts (2, 3, 4)
    - Test absolute positioning with explicit coordinates
    - Test padding application to bounding rectangles
    - Test margin calculation for node boundaries
    - Test height estimation for text nodes with different content lengths
    - Test percentage coordinate calculations (0-100 range)
    - Test edge cases: empty containers, single child, many children

- [x] 2. Implement Theme Resolver
  - [x] 2.1 Create ThemeResolver class with theme application logic
    - Create `packages/design/src/theme-resolver.ts`
    - Implement `apply(trees: LayoutTree[], themeName?: string): LayoutTree[]` method
    - Implement `applyToTree(tree: LayoutTree, theme: Theme): LayoutTree` method
    - Implement `applyToNode(node: LayoutNode, theme: Theme): void` method
    - _Requirements: 5.1, 5.4_

  - [x] 2.2 Implement theme loading and registry
    - Implement `loadTheme(name: string): Theme` method
    - Create theme registry with existing themes (executive, minimal, modern)
    - Define Theme interface with colors and typography
    - Support default theme when no theme specified
    - _Requirements: 5.4, 5.5_

  - [x] 2.3 Implement font role resolution
    - Resolve font roles (title, body, display, code) to actual font families
    - Apply font weights from theme configuration
    - Preserve explicit font overrides from Blueprint
    - _Requirements: 5.2_

  - [x] 2.4 Implement color role resolution
    - Resolve color roles to actual color values from theme palette
    - Apply background colors to slide root containers
    - Apply default text color when not specified
    - Preserve explicit color overrides from Blueprint
    - _Requirements: 5.3, 5.6, 5.7_

  - [x] 2.5 Write unit tests for Theme Resolver
    - Test theme loading by name (executive, minimal, modern)
    - Test font role resolution (title, body, display, code)
    - Test color role resolution (primary, secondary, accent)
    - Test default theme application when no theme specified
    - Test theme override behavior (explicit styles preserved)
    - Test missing theme handling (fallback to default)

- [ ] 3. Checkpoint - Verify foundation components
  - Ensure all tests pass for Positioning Engine and Theme Resolver
  - Manually test positioning with sample layout trees
  - Verify theme application produces expected styling
  - Ask the user if questions arise

- [x] 4. Implement Blueprint Generator
  - [x] 4.1 Create BlueprintGenerator class
    - Create `packages/ai/src/blueprint/generator.ts`
    - Implement `generate(prompt: string, options?: BlueprintGeneratorOptions): Promise<PrezVikBlueprint>` method
    - Define BlueprintGeneratorOptions interface (provider, temperature, maxTokens)
    - _Requirements: 1.1, 1.6_

  - [x] 4.2 Design system prompt for Blueprint v2 generation
    - Implement `buildSystemPrompt(): string` method
    - Include Blueprint v2 schema definition in prompt
    - Provide examples of valid Blueprint structures
    - Specify output format requirements (JSON only)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 4.3 Implement prompt analysis and meta inference
    - Implement `inferMeta(prompt: string): BlueprintMeta` method
    - Extract goal (inform, persuade, educate, pitch, report) from prompt keywords
    - Extract tone (formal, modern, bold, minimal, friendly) from prompt style
    - Extract audience from prompt context
    - Generate title from prompt topic
    - _Requirements: 1.2_

  - [x] 4.4 Implement JSON parsing and error handling
    - Implement `parseResponse(text: string): PrezVikBlueprint` method
    - Extract JSON from LLM response (handle markdown code blocks)
    - Handle malformed JSON with descriptive errors
    - Throw BlueprintGenerationError on parsing failures
    - _Requirements: 1.1, 1.6_

  - [x] 4.5 Write unit tests for Blueprint Generator
    - Test prompt parsing and meta inference with example prompts
    - Test JSON extraction from LLM responses with sample responses
    - Test error handling for invalid AI responses (malformed JSON, missing fields)
    - Mock PrezVikAI to avoid API calls in tests

- [x] 5. Implement Validation Layer
  - [x] 5.1 Create validation functions using Zod
    - Create `packages/schema/src/v2/validator.ts`
    - Implement `validateBlueprint(json: unknown): ValidationResult` function
    - Define ValidationResult interface (success, data, errors)
    - Define ValidationError interface (path, message, code)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 5.2 Implement error formatting for Zod errors
    - Implement `formatZodError(error: ZodError): ValidationError[]` function
    - Convert Zod error paths to readable field paths
    - Generate actionable error messages
    - Include error codes for programmatic handling
    - _Requirements: 2.3, 2.6_

  - [x] 5.3 Add validation for all Blueprint v2 components
    - Implement `validateSlide(slide: unknown): ValidationResult` function
    - Implement `validateContentBlock(block: unknown): ValidationResult` function
    - Verify required fields (version, meta, slides) are present
    - Verify slide content blocks match discriminated union types
    - Verify layout types are valid enum values
    - _Requirements: 2.4, 2.5, 2.6_

  - [x] 5.4 Write unit tests for Validation Layer
    - Test valid Blueprint v2 structures (minimal, complex, all content types)
    - Test invalid structures (missing required fields, wrong types, invalid enums)
    - Test error message formatting (readable paths, actionable messages)
    - Test each content block type validation (heading, text, bullets, quote, stat, code)
    - Test discriminated union validation for content blocks

- [x] 6. Implement Mock Mode for Blueprint Generation
  - [x] 6.1 Create template-based Blueprint generator
    - Implement `generateFromTemplate(prompt: string): PrezVikBlueprint` method in BlueprintGenerator
    - Implement `extractKeywords(prompt: string): Keywords` method
    - Parse prompt for slide count, topic, presentation type
    - _Requirements: 8.3_

  - [x] 6.2 Create Blueprint templates
    - Create template for pitch decks (hero, problem, solution, traction, closing)
    - Create template for reports (hero, section, data, content, closing)
    - Create template for training (hero, content, content, content, closing)
    - Create template for generic presentations (hero, content, content, closing)
    - _Requirements: 8.3_

  - [x] 6.3 Implement template selection and filling
    - Implement `selectTemplate(keywords: Keywords): BlueprintTemplate` method
    - Implement `fillTemplate(template: BlueprintTemplate, keywords: Keywords): PrezVikBlueprint` method
    - Fill template with extracted content from prompt
    - Ensure generated Blueprint is valid v2 format
    - _Requirements: 8.3, 9.1, 9.6_

  - [x] 6.4 Write unit tests for Mock Mode
    - Test keyword extraction from various prompts
    - Test template selection based on keywords
    - Test template filling with extracted content
    - Verify generated Blueprints pass validation

- [x] 7. Checkpoint - Verify Blueprint generation and validation
  - Test Blueprint generation with mock mode (no API key)
  - Test Blueprint generation with real AI (optional, requires API key)
  - Verify all generated Blueprints pass validation
  - Test error handling for invalid AI responses
  - Ask the user if questions arise

- [x] 8. Update PPTX Renderer for positioned layouts
  - [x] 8.1 Ensure renderer reads \_rect property from nodes
    - Update PPTXRenderer to read `node._rect` for positioning
    - Add error handling for missing `_rect` property
    - Log warning if `_rect` is missing on any node
    - _Requirements: 6.1, 6.3_

  - [x] 8.2 Implement coordinate conversion (percentage to EMUs)
    - Implement `percentageToEMU(percentage: number, dimension: number): number` helper
    - Convert x/y coordinates from 0-100 percentage to PowerPoint EMUs
    - Convert width/height from 0-100 percentage to PowerPoint EMUs
    - Use standard slide dimensions (10:16 aspect ratio)
    - _Requirements: 6.2, 6.3_

  - [x] 8.3 Verify text rendering with positioned coordinates
    - Ensure text boxes are created at coordinates from `_rect`
    - Apply font family, size, weight, and color from text node properties
    - Apply text alignment (left, center, right) from text node properties
    - _Requirements: 6.4, 6.5_

  - [x] 8.4 Verify container background rendering
    - Render container backgrounds when specified in layout tree
    - Apply background colors from theme or explicit styling
    - _Requirements: 6.6_

  - [x] 8.5 Write integration tests for PPTX rendering
    - Test rendering of positioned layout trees
    - Verify PPTX files are created and valid
    - Test coordinate conversion accuracy
    - Test text rendering with various fonts and sizes
    - Test background rendering

- [x] 9. Implement Pipeline Orchestrator
  - [x] 9.1 Create Pipeline class with stage orchestration
    - Create `packages/core/src/pipeline/orchestrator.ts`
    - Implement `execute(prompt: string, options: PipelineOptions): Promise<void>` method
    - Define PipelineOptions interface (outputPath, themeName, provider, mockMode)
    - Define PipelineContext interface for tracking state
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 9.2 Implement stage 1: Blueprint generation
    - Call BlueprintGenerator.generate() with prompt
    - Handle BlueprintGenerationError with context
    - Log stage entry and success
    - Store Blueprint in pipeline context
    - _Requirements: 7.1, 7.5, 10.1_

  - [x] 9.3 Implement stage 2: Blueprint validation
    - Call validateBlueprint() with generated Blueprint
    - Handle validation errors with field paths
    - Log validation success
    - Store validated Blueprint in context
    - _Requirements: 7.1, 7.5, 10.2_

  - [x] 9.4 Implement stage 3: Layout generation
    - Call LayoutEngineV2.generateLayout() with validated Blueprint
    - Handle LayoutError with slide/node context
    - Log layout generation success
    - Store layout trees in context
    - _Requirements: 7.1, 7.5, 10.3_

  - [x] 9.5 Implement stage 4: Coordinate positioning
    - Call PositioningEngine.position() with layout trees
    - Handle PositioningError with node/layout mode context
    - Log positioning success
    - Store positioned trees in context
    - _Requirements: 7.1, 7.5, 10.4_

  - [x] 9.6 Implement stage 5: Theme application
    - Call ThemeResolver.apply() with positioned trees and theme name
    - Handle ThemeError with theme name context
    - Log theming success
    - Store themed trees in context
    - _Requirements: 7.1, 7.5, 10.5_

  - [x] 9.7 Implement stage 6: PPTX rendering
    - Call PPTXRenderer.render() with themed trees and output path
    - Handle RenderError with node type/ID context
    - Log rendering success with output path
    - Verify output file exists
    - _Requirements: 7.1, 7.5, 7.7, 10.6_

  - [x] 9.8 Implement error handling and logging
    - Catch errors at each stage boundary
    - Wrap errors with stage context (stage name, relevant IDs)
    - Log errors with actionable messages
    - Include stack traces in error output
    - Stop pipeline on first error (fail fast)
    - _Requirements: 7.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 9.9 Write integration tests for Pipeline Orchestrator
    - Test complete pipeline with mock AI (no API key required)
    - Test pipeline with real AI (optional, requires API key)
    - Test error propagation through stages (fail at each stage, verify error context)
    - Test output file generation (PPTX file created, correct size)
    - Verify pipeline completes in under 30 seconds for 5-slide deck

- [x] 10. Update Magic Command to use new pipeline
  - [x] 10.1 Integrate Pipeline Orchestrator into magic command
    - Update `apps/cli/src/commands/magic.ts`
    - Replace existing deck generation with Pipeline.execute()
    - Pass prompt, output path, and theme name to pipeline
    - Remove legacy v0 deck.json dependencies
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.1, 9.2_

  - [x] 10.2 Add CLI options for pipeline configuration
    - Add `--mock` flag to enable mock mode (no API key required)
    - Add `--provider <name>` option to specify AI provider
    - Keep existing `--theme <name>` option for theme selection
    - Keep existing `--output <file>` option for output path
    - _Requirements: 7.3, 7.4, 8.3_

  - [x] 10.3 Implement progress logging for each pipeline stage
    - Log "Generating Blueprint from prompt..."
    - Log "Validating Blueprint..."
    - Log "Generating layout..."
    - Log "Positioning elements..."
    - Log "Applying theme..."
    - Log "Rendering PPTX..."
    - Log total execution time
    - _Requirements: 7.5, 7.8_

  - [x] 10.4 Implement error reporting with stage context
    - Catch pipeline errors and display stage name
    - Display error message with context (IDs, names, etc.)
    - Display stack trace in verbose mode
    - Exit with error code on failure
    - _Requirements: 7.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 10.5 Write integration tests for Magic Command
    - Test command execution with mock mode
    - Test command execution with real AI (optional)
    - Test CLI option parsing (--mock, --provider, --theme, --output)
    - Test progress logging output
    - Test error reporting with various failure scenarios
    - Verify PPTX output file is created and valid

- [ ] 11. Checkpoint - Verify end-to-end pipeline
  - Run magic command with mock mode: `prezvik magic "Create a 3-slide presentation about AI" --mock`
  - Run magic command with real AI (if API key available)
  - Verify PPTX file is created and opens in PowerPoint/Keynote
  - Verify slide count matches prompt
  - Verify text content matches Blueprint
  - Verify positioning looks correct (visual inspection)
  - Verify theme is applied correctly
  - Ask the user if questions arise

- [x] 12. Create comprehensive test suite
  - [x] 12.1 Write unit tests for all new components
    - Positioning Engine unit tests (flow, grid, absolute layouts)
    - Theme Resolver unit tests (theme loading, font/color resolution)
    - Blueprint Generator unit tests (prompt parsing, JSON extraction)
    - Validation Layer unit tests (valid/invalid Blueprints)
    - Mock Mode unit tests (template selection, filling)

  - [x] 12.2 Write integration tests for pipeline stages
    - Blueprint → Layout transformation test
    - Layout → Positioning transformation test
    - Positioning → Theming transformation test
    - Theming → Rendering transformation test
    - End-to-end pipeline test with mock AI
    - End-to-end pipeline test with real AI (optional)

  - [x] 12.3 Create test data and fixtures
    - Sample prompts for various presentation types
    - Sample Blueprints (minimal, complex, invalid)
    - Expected layout trees for validation
    - Expected PPTX output characteristics

- [x] 13. Documentation and cleanup
  - [x] 13.1 Update README with pipeline architecture
    - Document pipeline stages and data flow
    - Add architecture diagram
    - Explain Blueprint v2 format
    - Document coordinate system (percentage-based)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 13.2 Create usage examples and guides
    - Add example: Basic usage with mock mode
    - Add example: Using custom themes
    - Add example: Programmatic pipeline usage
    - Add example: Error handling patterns
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.3_

  - [x] 13.3 Document error messages and troubleshooting
    - List common errors and solutions
    - Document error codes and meanings
    - Add troubleshooting guide for each pipeline stage
    - Document API key setup for AI providers
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 13.4 Add inline code documentation
    - Add JSDoc comments to all public methods
    - Document interfaces and types
    - Add usage examples in comments
    - Document coordinate system and units

- [x] 14. Final checkpoint - Verify all requirements met
  - Review requirements document and verify all acceptance criteria are met
  - Run full test suite (unit + integration)
  - Test pipeline with various prompts and themes
  - Verify PPTX output quality (open files, check positioning, verify themes)
  - Verify error handling works correctly at each stage
  - Verify performance: pipeline completes in under 30 seconds
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability (e.g., _Requirements: 1.1, 1.2_)
- Checkpoints ensure incremental validation at key milestones
- The implementation uses TypeScript throughout
- Mock mode enables testing without API keys
- Percentage-based coordinates (0-100) ensure renderer independence
- Blueprint v2 format is used exclusively (no legacy v0 deck.json)
