# Requirements Document

## Introduction

This document specifies requirements for implementing a layered architecture for Prezvik presentation generation. The architecture separates concerns into three distinct layers: Theme/Color Layer, Visual Generation Layer, and Export/Rendering Layer. This separation enables procedural generation of backgrounds, gradients, shapes, and spacing rules on top of a constrained layout system, moving beyond template-based approaches to create a true theme engine.

The layered architecture will replace the current monolithic rendering approach with a modular stack that provides clear separation between color/theme management, visual element generation, and output format rendering.

## Glossary

- **Theme_Layer**: The foundational layer responsible for color palette generation, interpolation, gradients, and blend modes using Culori or Chroma.js
- **Visual_Layer**: The middle layer responsible for procedurally generating backgrounds, geometric styling, fills, patterns, gradients, and shapes using Konva or Fabric.js
- **Export_Layer**: The top layer responsible for rendering to output formats (PPTX via PptxGenJS, web preview via Slidev/reveal.js)
- **Theme_Engine**: The system that procedurally generates backgrounds, gradients, shapes, and spacing rules based on theme specifications
- **Layout_Tree**: The positioned node tree structure containing slide elements with computed coordinates
- **ThemeSpec**: A theme specification object containing color palettes, typography, and decoration rules
- **Visual_Context**: An intermediate representation containing theme-resolved colors and procedurally generated visual elements
- **Renderer**: A component that converts Visual_Context to a specific output format (PPTX, HTML, etc.)
- **Pipeline**: The orchestrator that coordinates all layers from Blueprint to final output
- **Culori**: A comprehensive color library supporting CSS Color Level 4 formats, interpolation, gradients, and blend modes
- **Chroma_js**: A color manipulation library focused on color conversions and color scales
- **Konva**: A 2D canvas library supporting fills with colors, patterns, linear gradients, and radial gradients
- **Fabric_js**: A canvas library supporting gradients and SVG reference elements
- **PptxGenJS**: A library for generating PowerPoint presentations with built-in shape and theme support
- **Slidev**: A web-based presentation framework with theme system support
- **Reveal_js**: A web-based presentation framework with support for various slide backgrounds

## Requirements

### Requirement 1: Theme/Color Layer Implementation

**User Story:** As a presentation designer, I want a dedicated theme layer that handles all color operations, so that color management is centralized and consistent across all visual elements.

#### Acceptance Criteria

1. THE Theme_Layer SHALL provide color palette generation from base colors
2. THE Theme_Layer SHALL support color interpolation between any two colors
3. THE Theme_Layer SHALL generate linear gradients with configurable stops and directions
4. THE Theme_Layer SHALL generate radial gradients with configurable stops and center points
5. THE Theme_Layer SHALL support CSS Color Level 4 formats (rgb, hsl, oklch, etc.)
6. THE Theme_Layer SHALL apply blend modes to combine colors (multiply, screen, overlay, etc.)
7. WHEN a ThemeSpec is provided, THE Theme_Layer SHALL resolve all semantic color roles to concrete color values
8. THE Theme_Layer SHALL export a color palette object containing primary, secondary, accent, background, and text colors
9. FOR ALL color operations, applying the same inputs SHALL produce identical outputs (deterministic color generation)

### Requirement 2: Visual Generation Layer Implementation

**User Story:** As a presentation designer, I want a visual generation layer that creates backgrounds and shapes procedurally, so that presentations have unique, high-quality visual elements without relying on templates.

#### Acceptance Criteria

1. THE Visual_Layer SHALL generate procedural backgrounds based on theme specifications
2. THE Visual_Layer SHALL create geometric shapes (rectangles, circles, polygons, paths)
3. THE Visual_Layer SHALL apply fills to shapes using solid colors from Theme_Layer
4. THE Visual_Layer SHALL apply pattern fills to shapes
5. THE Visual_Layer SHALL apply linear gradient fills to shapes using gradients from Theme_Layer
6. THE Visual_Layer SHALL apply radial gradient fills to shapes using gradients from Theme_Layer
7. WHEN a Layout_Tree is provided, THE Visual_Layer SHALL generate visual elements for each node
8. THE Visual_Layer SHALL output a Visual_Context containing all generated visual elements
9. THE Visual_Layer SHALL support canvas-based rendering for visual element generation
10. FOR ALL Layout_Tree inputs with the same ThemeSpec, generating visuals twice SHALL produce equivalent Visual_Context outputs (idempotent visual generation)

### Requirement 3: Export/Rendering Layer Implementation

**User Story:** As a developer, I want multiple rendering backends, so that I can export presentations to different formats and preview them in different environments.

#### Acceptance Criteria

1. THE Export_Layer SHALL provide a PPTX renderer using PptxGenJS
2. THE Export_Layer SHALL provide a web preview renderer using Slidev or Reveal_js
3. WHEN a Visual_Context is provided, THE PPTX_Renderer SHALL convert it to a valid PPTX file
4. WHEN a Visual_Context is provided, THE Web_Renderer SHALL convert it to HTML slides
5. THE PPTX_Renderer SHALL support PowerPoint built-in shapes
6. THE PPTX_Renderer SHALL support PowerPoint theme and scheme definitions
7. THE Web_Renderer SHALL support color backgrounds from Theme_Layer
8. THE Web_Renderer SHALL support image backgrounds
9. THE Web_Renderer SHALL support video backgrounds
10. THE Export_Layer SHALL define a common Renderer interface that all renderers implement
11. FOR ALL Visual_Context inputs, rendering to PPTX then opening in PowerPoint SHALL display all visual elements correctly (valid PPTX output)

### Requirement 4: Layer Integration and Pipeline

**User Story:** As a developer, I want the three layers to integrate seamlessly into the existing pipeline, so that the layered architecture works with the current Blueprint-to-PPTX flow.

#### Acceptance Criteria

1. THE Pipeline SHALL execute Theme_Layer before Visual_Layer
2. THE Pipeline SHALL execute Visual_Layer before Export_Layer
3. WHEN a Layout_Tree is provided, THE Pipeline SHALL pass it through Theme_Layer, Visual_Layer, and Export_Layer in sequence
4. THE Pipeline SHALL pass Theme_Layer output (color palette) to Visual_Layer
5. THE Pipeline SHALL pass Visual_Layer output (Visual_Context) to Export_Layer
6. THE Pipeline SHALL maintain backward compatibility with existing generateDeck function
7. WHEN an error occurs in any layer, THE Pipeline SHALL provide clear error messages indicating which layer failed
8. THE Pipeline SHALL log execution time for each layer
9. FOR ALL valid Layout_Tree inputs, executing the pipeline SHALL produce a valid output file (end-to-end integration)

### Requirement 5: Theme Engine Procedural Generation

**User Story:** As a presentation designer, I want the theme engine to procedurally generate backgrounds, gradients, and shapes, so that each presentation has unique visual styling without manual design work.

#### Acceptance Criteria

1. THE Theme_Engine SHALL generate background styles based on ThemeSpec tone (executive, minimal, modern)
2. THE Theme_Engine SHALL generate gradient directions based on slide type (hero, section, content)
3. THE Theme_Engine SHALL generate geometric decoration shapes for hero slides
4. THE Theme_Engine SHALL generate spacing rules based on ThemeSpec
5. WHEN a slide type is "hero", THE Theme_Engine SHALL generate a gradient background
6. WHEN a slide type is "section", THE Theme_Engine SHALL generate a solid or subtle gradient background
7. WHEN a slide type is "content", THE Theme_Engine SHALL generate a minimal background
8. THE Theme_Engine SHALL apply decoration shapes (circles, rectangles, lines) to slides based on theme tone
9. THE Theme_Engine SHALL ensure decoration shapes do not overlap with content areas
10. FOR ALL ThemeSpec inputs with the same tone and slide type, generating backgrounds twice SHALL produce visually similar but not identical results (controlled randomness)

### Requirement 6: Color Library Selection and Integration

**User Story:** As a developer, I want to use a robust color library for the Theme Layer, so that color operations are accurate and support modern color spaces.

#### Acceptance Criteria

1. THE Theme_Layer SHALL use Culori or Chroma_js for color operations
2. THE Theme_Layer SHALL support color space conversions (RGB, HSL, OKLCH)
3. THE Theme_Layer SHALL support color interpolation in perceptually uniform color spaces
4. THE Theme_Layer SHALL generate color scales with configurable steps
5. WHEN two colors are provided, THE Theme_Layer SHALL interpolate between them smoothly
6. THE Theme_Layer SHALL support alpha channel (transparency) in all color operations
7. THE Theme_Layer SHALL validate color input formats and return descriptive errors for invalid colors
8. FOR ALL color pairs, interpolating from color A to color B at position 0.5 SHALL produce a perceptually middle color (accurate interpolation)

### Requirement 7: Visual Library Selection and Integration

**User Story:** As a developer, I want to use a canvas library for the Visual Layer, so that I can generate complex visual elements programmatically.

#### Acceptance Criteria

1. THE Visual_Layer SHALL use Konva or Fabric_js for canvas operations
2. THE Visual_Layer SHALL support shape creation (rectangles, circles, polygons, paths)
3. THE Visual_Layer SHALL support gradient fills (linear and radial)
4. THE Visual_Layer SHALL support pattern fills
5. THE Visual_Layer SHALL export visual elements as SVG or raster images
6. WHEN a shape is created, THE Visual_Layer SHALL apply fills from Theme_Layer
7. THE Visual_Layer SHALL support shape transformations (scale, rotate, translate)
8. THE Visual_Layer SHALL support shape layering (z-index)
9. FOR ALL shapes with gradient fills, exporting to SVG SHALL preserve gradient definitions (gradient export)

### Requirement 8: Renderer Interface and Abstraction

**User Story:** As a developer, I want a common renderer interface, so that I can add new output formats without modifying the core pipeline.

#### Acceptance Criteria

1. THE Export_Layer SHALL define a Renderer interface with a render method
2. THE Renderer interface SHALL accept Visual_Context as input
3. THE Renderer interface SHALL return a file path or buffer as output
4. THE PPTX_Renderer SHALL implement the Renderer interface
5. THE Web_Renderer SHALL implement the Renderer interface
6. THE Pipeline SHALL accept a renderer parameter to select output format
7. WHEN a new renderer is implemented, THE Pipeline SHALL support it without code changes to other layers
8. THE Renderer interface SHALL define error handling methods
9. FOR ALL Renderer implementations, calling render with the same Visual_Context SHALL produce equivalent output (renderer consistency)

### Requirement 9: Parser and Serializer for Visual Context

**User Story:** As a developer, I want to serialize and parse Visual_Context objects, so that I can cache intermediate results and debug the pipeline.

#### Acceptance Criteria

1. THE Visual_Layer SHALL provide a serializer that converts Visual_Context to JSON
2. THE Visual_Layer SHALL provide a parser that converts JSON to Visual_Context
3. THE Serializer SHALL handle all Visual_Context properties (colors, shapes, gradients, patterns)
4. THE Parser SHALL validate JSON structure and return descriptive errors for invalid input
5. THE Parser SHALL support the Visual_Context schema version 1.0
6. THE Pretty_Printer SHALL format Visual_Context objects as readable JSON with indentation
7. FOR ALL valid Visual_Context objects, parsing then serializing then parsing SHALL produce an equivalent object (round-trip property)
8. WHEN invalid JSON is provided, THE Parser SHALL return a descriptive error message indicating the validation failure

### Requirement 10: Migration Path from Current Architecture

**User Story:** As a developer, I want a clear migration path from the current architecture to the layered architecture, so that I can adopt the new system incrementally without breaking existing functionality.

#### Acceptance Criteria

1. THE Pipeline SHALL support a legacy mode that uses the current rendering approach
2. THE Pipeline SHALL support a layered mode that uses the new three-layer architecture
3. WHEN legacy mode is enabled, THE Pipeline SHALL bypass Theme_Layer and Visual_Layer
4. WHEN layered mode is enabled, THE Pipeline SHALL execute all three layers
5. THE Pipeline SHALL provide a configuration option to select rendering mode
6. THE Pipeline SHALL maintain the same public API (generateDeck function signature)
7. WHEN both modes are available, THE Pipeline SHALL produce equivalent output for the same input
8. THE Pipeline SHALL log which rendering mode is active
9. FOR ALL Blueprint inputs, generating with legacy mode and layered mode SHALL produce visually similar presentations (output equivalence)

### Requirement 11: Performance and Optimization

**User Story:** As a user, I want the layered architecture to maintain fast generation times, so that the improved visual quality does not come at the cost of performance.

#### Acceptance Criteria

1. THE Theme_Layer SHALL complete color operations in under 100ms per slide
2. THE Visual_Layer SHALL complete visual generation in under 500ms per slide
3. THE Export_Layer SHALL complete rendering in under 1000ms per slide
4. THE Pipeline SHALL complete end-to-end generation in under 5 seconds for a 10-slide presentation
5. THE Visual_Layer SHALL cache generated visual elements for reuse across similar slides
6. THE Theme_Layer SHALL cache color palettes for reuse across slides
7. WHEN the same ThemeSpec is used for multiple slides, THE Theme_Layer SHALL reuse the cached color palette
8. WHEN similar visual elements are needed, THE Visual_Layer SHALL reuse cached elements
9. FOR ALL 10-slide presentations, generating twice in sequence SHALL show improved performance on the second run due to caching (cache effectiveness)

### Requirement 12: Testing and Validation

**User Story:** As a developer, I want comprehensive tests for the layered architecture, so that I can ensure correctness and catch regressions early.

#### Acceptance Criteria

1. THE Theme_Layer SHALL have unit tests for color palette generation
2. THE Theme_Layer SHALL have unit tests for color interpolation
3. THE Theme_Layer SHALL have unit tests for gradient generation
4. THE Visual_Layer SHALL have unit tests for shape creation
5. THE Visual_Layer SHALL have unit tests for fill application
6. THE Export_Layer SHALL have integration tests for PPTX rendering
7. THE Export_Layer SHALL have integration tests for web rendering
8. THE Pipeline SHALL have end-to-end tests for the complete layered flow
9. THE Visual_Context Parser SHALL have property-based tests for round-trip serialization
10. FOR ALL color interpolation operations, the output color SHALL be between the input colors in the chosen color space (interpolation bounds property)
