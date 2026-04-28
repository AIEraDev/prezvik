# Requirements Document

## Introduction

The Prezvik v1 Pipeline Integration feature establishes a complete, testable end-to-end pipeline that transforms user prompts into rendered PPTX presentations. This feature integrates existing components (Blueprint v2 schema, LayoutEngineV2, AI adapters) into a cohesive, locally executable workflow that validates the core Prezvik architecture: Intent → Blueprint → Layout → Positioning → Theming → Rendering.

The pipeline must be testable without external dependencies (Google API credentials) and must produce valid Blueprint v2 JSON (not legacy v0 deck.json format). A critical gap exists in the current LayoutEngineV2: it creates unpositioned layout nodes without explicit x/y coordinates, which renderers require. This feature adds coordinate positioning to complete the layout-to-render bridge.

## Glossary

- **Pipeline**: The complete transformation sequence from user prompt to rendered presentation file
- **Blueprint_v2**: The Prezvik intermediate representation (IR) defined in packages/schema/src/v2/blueprint.ts
- **LayoutEngineV2**: The layout engine in packages/layout/src/v2/layout-engine.ts that transforms Blueprint into layout trees
- **LayoutTree**: The positioned node tree structure with explicit coordinates (x, y, width, height)
- **PrezVikAI**: The AI adapter layer in packages/ai that routes requests to OpenAI, Anthropic, or Groq
- **PPTX_Renderer**: The PowerPoint renderer in packages/renderer-pptx
- **Magic_Command**: The CLI command in apps/cli/src/commands/magic.ts
- **Positioning_Engine**: The new component that converts relative layout nodes to absolute coordinates
- **Theme_Resolver**: The design system component that applies theme tokens to layout nodes
- **Validation_Layer**: The Zod schema validation for Blueprint v2 structures

## Requirements

### Requirement 1: Blueprint v2 Generation from User Prompt

**User Story:** As a developer, I want to generate valid Blueprint v2 JSON from a user prompt, so that I can use the modern IR format instead of legacy deck.json.

#### Acceptance Criteria

1. WHEN a user prompt is provided, THE PrezVikAI SHALL generate Blueprint v2 JSON conforming to PrezVikBlueprintSchema
2. THE Blueprint_Generator SHALL include meta fields (title, goal, tone, audience) derived from the prompt
3. THE Blueprint_Generator SHALL assign appropriate slide types (hero, content, section, etc.) based on content intent
4. THE Blueprint_Generator SHALL assign layout types (center_focus, two_column, etc.) based on slide type and content structure
5. THE Blueprint_Generator SHALL structure content as typed blocks (heading, text, bullets, quote, stat, code) not raw text
6. WHEN the generated Blueprint is invalid, THE Validation_Layer SHALL return descriptive error messages with field paths

### Requirement 2: Blueprint Validation

**User Story:** As a developer, I want to validate generated Blueprint v2 JSON, so that I can catch schema errors before layout processing.

#### Acceptance Criteria

1. THE Validation_Layer SHALL validate Blueprint v2 JSON using PrezVikBlueprintSchema from @prezvik/schema/v2
2. WHEN validation succeeds, THE Validation_Layer SHALL return the parsed Blueprint object
3. WHEN validation fails, THE Validation_Layer SHALL return error messages indicating which fields are invalid
4. THE Validation_Layer SHALL verify all required fields (version, meta, slides) are present
5. THE Validation_Layer SHALL verify slide content blocks match discriminated union types
6. THE Validation_Layer SHALL verify layout types are valid enum values

### Requirement 3: Layout Tree Generation

**User Story:** As a developer, I want to transform validated Blueprint v2 into a layout tree, so that I can prepare content for coordinate positioning.

#### Acceptance Criteria

1. THE LayoutEngineV2 SHALL transform Blueprint v2 slides into LayoutTree structures
2. THE LayoutEngineV2 SHALL apply layout rules from LAYOUT_RULES based on slide layout type
3. THE LayoutEngineV2 SHALL create container nodes with flow, grid, or absolute layout modes
4. THE LayoutEngineV2 SHALL create text nodes with font roles, sizes, and alignment from layout rules
5. THE LayoutEngineV2 SHALL compose center, split, grid, and aligned layouts according to composition rules
6. THE LayoutEngineV2 SHALL convert content blocks (heading, text, bullets, quote, stat, code) into appropriate layout nodes

### Requirement 4: Coordinate Positioning Engine

**User Story:** As a developer, I want to convert relative layout trees into absolute coordinates, so that renderers can place elements at explicit x/y positions.

#### Acceptance Criteria

1. THE Positioning_Engine SHALL compute absolute x/y coordinates for all layout nodes
2. THE Positioning_Engine SHALL compute width and height dimensions for all layout nodes
3. WHEN a layout node has flow layout mode, THE Positioning_Engine SHALL position children sequentially with gap spacing
4. WHEN a layout node has grid layout mode, THE Positioning_Engine SHALL position children in rows and columns
5. WHEN a layout node has absolute layout mode, THE Positioning_Engine SHALL use explicit coordinates if provided
6. THE Positioning_Engine SHALL respect padding values when positioning children within containers
7. THE Positioning_Engine SHALL respect margin values when calculating node boundaries
8. THE Positioning_Engine SHALL use percentage-based coordinates (0-100 for x/y, 0-100 for width/height) for renderer independence
9. THE Positioning_Engine SHALL store computed rectangles in node.\_rect property
10. WHEN positioning is complete, THE Positioning_Engine SHALL return a LayoutTree with all nodes having valid \_rect values

### Requirement 5: Theme Application

**User Story:** As a developer, I want to apply theme tokens to positioned layout trees, so that slides have consistent colors, fonts, and styling.

#### Acceptance Criteria

1. THE Theme_Resolver SHALL apply theme tokens to layout nodes based on theme name
2. THE Theme_Resolver SHALL resolve font roles (title, body, display, code) to actual font families and weights
3. THE Theme_Resolver SHALL resolve color roles to actual color values from theme palette
4. WHEN no theme is specified, THE Theme_Resolver SHALL apply a default theme
5. THE Theme_Resolver SHALL support existing themes (executive, minimal, modern)
6. THE Theme_Resolver SHALL preserve explicit styling overrides from Blueprint
7. THE Theme_Resolver SHALL apply background colors to slide root containers

### Requirement 6: PPTX Rendering

**User Story:** As a developer, I want to render positioned, themed layout trees to PPTX files, so that I can verify the pipeline output locally.

#### Acceptance Criteria

1. THE PPTX_Renderer SHALL render LayoutTree structures to PowerPoint files
2. THE PPTX_Renderer SHALL create slides with 10:16 aspect ratio (standard widescreen)
3. THE PPTX_Renderer SHALL position text boxes at coordinates specified in node.\_rect
4. THE PPTX_Renderer SHALL apply font family, size, weight, and color from text node properties
5. THE PPTX_Renderer SHALL apply text alignment (left, center, right) from text node properties
6. THE PPTX_Renderer SHALL render container backgrounds when specified
7. THE PPTX_Renderer SHALL write valid .pptx files that open in PowerPoint and Keynote

### Requirement 7: End-to-End Pipeline Integration

**User Story:** As a developer, I want to execute the complete pipeline from prompt to PPTX, so that I can test the entire Prezvik architecture.

#### Acceptance Criteria

1. THE Magic_Command SHALL execute the pipeline: prompt → Blueprint → validation → layout → positioning → theming → PPTX
2. THE Magic_Command SHALL accept a user prompt as input
3. THE Magic_Command SHALL accept an output file path parameter
4. THE Magic_Command SHALL accept an optional theme name parameter
5. THE Magic_Command SHALL log each pipeline stage (generation, validation, layout, positioning, theming, rendering)
6. WHEN any pipeline stage fails, THE Magic_Command SHALL report the error with stage context
7. WHEN the pipeline succeeds, THE Magic_Command SHALL output a valid PPTX file
8. THE Magic_Command SHALL complete execution in under 30 seconds for a 5-slide presentation

### Requirement 8: Local Testing Without External Dependencies

**User Story:** As a developer, I want to test the pipeline locally without Google API credentials, so that I can validate the architecture without external service dependencies.

#### Acceptance Criteria

1. THE Pipeline SHALL render to PPTX format without requiring Google Slides API credentials
2. THE Pipeline SHALL use local AI providers (OpenAI, Anthropic, Groq) with API keys
3. WHEN no AI API key is available, THE Pipeline SHALL support a mock mode with template-based generation
4. THE Pipeline SHALL not require network access for layout, positioning, theming, or rendering stages
5. THE Pipeline SHALL produce verifiable output (PPTX files that can be opened and inspected)

### Requirement 9: Blueprint v2 Compliance

**User Story:** As a developer, I want to ensure the pipeline uses Blueprint v2 format exclusively, so that I avoid legacy v0 deck.json dependencies.

#### Acceptance Criteria

1. THE Pipeline SHALL NOT generate or consume v0 deck.json format
2. THE Pipeline SHALL use PrezVikBlueprintSchema from @prezvik/schema/v2 for all validation
3. THE Pipeline SHALL use Blueprint v2 slide types (hero, section, content, comparison, grid, quote, data, callout, closing)
4. THE Pipeline SHALL use Blueprint v2 layout types (center_focus, two_column, three_column, split_screen, grid_2x2, hero_overlay, timeline, stat_highlight, image_dominant)
5. THE Pipeline SHALL use Blueprint v2 content blocks (heading, text, bullets, quote, stat, code)
6. THE Pipeline SHALL set version field to "2.0" in all generated Blueprints

### Requirement 10: Error Handling and Diagnostics

**User Story:** As a developer, I want clear error messages at each pipeline stage, so that I can debug issues quickly.

#### Acceptance Criteria

1. WHEN Blueprint generation fails, THE Pipeline SHALL report the AI error with prompt context
2. WHEN validation fails, THE Pipeline SHALL report Zod validation errors with field paths
3. WHEN layout generation fails, THE Pipeline SHALL report the failing slide ID and content block
4. WHEN positioning fails, THE Pipeline SHALL report the failing node ID and layout mode
5. WHEN theming fails, THE Pipeline SHALL report the missing theme name or token
6. WHEN rendering fails, THE Pipeline SHALL report the failing node type and properties
7. THE Pipeline SHALL include stack traces in error output for debugging
