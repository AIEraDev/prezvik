# Design Document: Kyro v1 Pipeline Integration

## Overview

The Kyro v1 Pipeline Integration establishes a complete, testable end-to-end pipeline that transforms user prompts into rendered PPTX presentations. This design integrates existing components (Blueprint v2 schema, LayoutEngineV2, KyroAI) into a cohesive workflow that validates the core Kyro architecture: **Intent → Blueprint → Layout → Positioning → Theming → Rendering**.

### Key Design Goals

1. **Blueprint v2 Compliance**: Use only Blueprint v2 format (no legacy v0 deck.json)
2. **Coordinate Positioning**: Add explicit x/y coordinates to layout nodes for renderer consumption
3. **Local Testability**: Execute pipeline without external dependencies (Google API)
4. **Clear Error Handling**: Provide actionable diagnostics at each pipeline stage
5. **Extensibility**: Design for future multi-target rendering (Canva, Web, PDF)

### Architecture Diagram

```
User Prompt
    ↓
[1] Blueprint Generator (KyroAI)
    ↓
[2] Validation Layer (Zod)
    ↓
[3] Layout Engine v2
    ↓
[4] Positioning Engine ← NEW COMPONENT
    ↓
[5] Theme Resolver
    ↓
[6] PPTX Renderer
    ↓
Output File (.pptx)
```

## Architecture

### Component Responsibilities

#### 1. Blueprint Generator

- **Input**: User prompt (string)
- **Output**: Blueprint v2 JSON
- **Responsibility**: Transform natural language intent into structured Blueprint IR
- **Implementation**: Uses KyroAI with structured prompts

#### 2. Validation Layer

- **Input**: Blueprint v2 JSON
- **Output**: Validated Blueprint object or error list
- **Responsibility**: Ensure Blueprint conforms to KyroBlueprintSchema
- **Implementation**: Zod schema validation

#### 3. Layout Engine v2

- **Input**: Validated Blueprint
- **Output**: LayoutTree[] (unpositioned)
- **Responsibility**: Apply layout rules and create node hierarchy
- **Implementation**: Existing LayoutEngineV2 class

#### 4. Positioning Engine (NEW)

- **Input**: LayoutTree[] (unpositioned)
- **Output**: LayoutTree[] (positioned with \_rect)
- **Responsibility**: Compute absolute x/y coordinates for all nodes
- **Implementation**: New PositioningEngine class

#### 5. Theme Resolver

- **Input**: LayoutTree[] (positioned)
- **Output**: LayoutTree[] (themed)
- **Responsibility**: Apply theme tokens (colors, fonts) to nodes
- **Implementation**: New ThemeResolver class

#### 6. PPTX Renderer

- **Input**: LayoutTree[] (positioned + themed)
- **Output**: .pptx file
- **Responsibility**: Render layout nodes to PowerPoint shapes
- **Implementation**: Existing PPTXRenderer

### Data Flow

```typescript
// Stage 1: Blueprint Generation
const blueprintJSON = await kyroAI.generateBlueprint(prompt);

// Stage 2: Validation
const blueprint = validateBlueprint(blueprintJSON);

// Stage 3: Layout Generation
const layoutTrees = layoutEngine.generateLayout(blueprint);

// Stage 4: Positioning (NEW)
const positionedTrees = positioningEngine.position(layoutTrees);

// Stage 5: Theming
const themedTrees = themeResolver.apply(positionedTrees, themeName);

// Stage 6: Rendering
await pptxRenderer.render(themedTrees, outputPath);
```

## Components and Interfaces

### 1. Blueprint Generator

**Location**: `packages/ai/src/blueprint/generator.ts`

```typescript
export interface BlueprintGeneratorOptions {
  provider?: string;
  temperature?: number;
  maxTokens?: number;
}

export class BlueprintGenerator {
  constructor(private kyroAI: KyroAI) {}

  async generate(prompt: string, options?: BlueprintGeneratorOptions): Promise<KyroBlueprint> {
    // Generate Blueprint v2 JSON from prompt
    // Use structured prompt with examples
    // Parse and return Blueprint object
  }
}
```

**Key Methods**:

- `generate(prompt, options)`: Main generation method
- `buildSystemPrompt()`: Construct system prompt with Blueprint v2 schema
- `parseResponse(text)`: Extract JSON from LLM response
- `inferMeta(prompt)`: Derive meta fields (goal, tone, audience) from prompt

### 2. Validation Layer

**Location**: `packages/schema/src/v2/validator.ts`

```typescript
export interface ValidationResult {
  success: boolean;
  data?: KyroBlueprint;
  errors?: ValidationError[];
}

export interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

export function validateBlueprint(json: unknown): ValidationResult {
  const result = KyroBlueprintSchema.safeParse(json);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map(formatZodError),
  };
}
```

**Key Functions**:

- `validateBlueprint(json)`: Main validation function
- `formatZodError(error)`: Convert Zod errors to readable format
- `validateSlide(slide)`: Validate individual slide
- `validateContentBlock(block)`: Validate content block

### 3. Layout Engine v2 (Existing)

**Location**: `packages/layout/src/v2/layout-engine.ts`

**No changes required** - existing implementation already creates LayoutTree structures with proper node hierarchy. The engine creates nodes with layout modes (flow, grid, absolute) but does not compute coordinates.

### 4. Positioning Engine (NEW)

**Location**: `packages/layout/src/v2/positioning-engine.ts`

```typescript
export interface PositioningOptions {
  slideWidth?: number; // Default: 100 (percentage)
  slideHeight?: number; // Default: 100 (percentage)
  unit?: "percentage" | "pixels";
}

export class PositioningEngine {
  constructor(private options: PositioningOptions = {}) {}

  /**
   * Position all layout trees
   */
  position(trees: LayoutTree[]): LayoutTree[] {
    return trees.map((tree) => this.positionTree(tree));
  }

  /**
   * Position a single layout tree
   */
  private positionTree(tree: LayoutTree): LayoutTree {
    const positioned = { ...tree };
    this.positionNode(positioned.root, {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    return positioned;
  }

  /**
   * Position a node and its children
   */
  private positionNode(node: LayoutNode, bounds: Rectangle): void {
    // Apply padding to bounds
    const contentBounds = this.applyPadding(bounds, node.padding);

    // Position based on layout mode
    if (node.type === "container" && node.layout) {
      switch (node.layout.type) {
        case "flow":
          this.positionFlowChildren(node, contentBounds);
          break;
        case "grid":
          this.positionGridChildren(node, contentBounds);
          break;
        case "absolute":
          this.positionAbsoluteChildren(node, contentBounds);
          break;
      }
    }

    // Set node rectangle
    node._rect = bounds;
  }

  /**
   * Position children in flow layout
   */
  private positionFlowChildren(node: ContainerNode, bounds: Rectangle): void {
    const layout = node.layout as FlowLayout;
    const gap = layout.gap || 0;

    if (layout.direction === "vertical") {
      let currentY = bounds.y;
      const childWidth = bounds.width;

      for (const child of node.children) {
        const childHeight = this.estimateHeight(child, childWidth);

        this.positionNode(child, {
          x: bounds.x,
          y: currentY,
          width: childWidth,
          height: childHeight,
        });

        currentY += childHeight + gap;
      }
    } else {
      // Horizontal flow
      let currentX = bounds.x;
      const childHeight = bounds.height;
      const childWidth = bounds.width / node.children.length;

      for (const child of node.children) {
        this.positionNode(child, {
          x: currentX,
          y: bounds.y,
          width: childWidth - gap,
          height: childHeight,
        });

        currentX += childWidth;
      }
    }
  }

  /**
   * Position children in grid layout
   */
  private positionGridChildren(node: ContainerNode, bounds: Rectangle): void {
    const layout = node.layout as GridLayout;
    const columns = layout.columns;
    const columnGap = layout.columnGap || 0;
    const rowGap = layout.rowGap || 0;

    const cellWidth = (bounds.width - (columns - 1) * columnGap) / columns;
    const rows = Math.ceil(node.children.length / columns);
    const cellHeight = (bounds.height - (rows - 1) * rowGap) / rows;

    node.children.forEach((child, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      this.positionNode(child, {
        x: bounds.x + col * (cellWidth + columnGap),
        y: bounds.y + row * (cellHeight + rowGap),
        width: cellWidth,
        height: cellHeight,
      });
    });
  }

  /**
   * Position children with absolute positioning
   */
  private positionAbsoluteChildren(node: ContainerNode, bounds: Rectangle): void {
    // Children use explicit coordinates if provided
    for (const child of node.children) {
      const childRect = child._rect || {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      };

      this.positionNode(child, childRect);
    }
  }

  /**
   * Estimate height for a node
   */
  private estimateHeight(node: LayoutNode, width: number): number {
    if (node.type === "text") {
      // Estimate based on font size and content length
      const textNode = node as TextNode;
      const fontSize = textNode.text.fontSize;
      const lineHeight = fontSize * 1.5;
      const charsPerLine = Math.floor(width / (fontSize * 0.6));
      const lines = Math.ceil(textNode.content.length / charsPerLine);
      return lines * lineHeight;
    }

    if (node.type === "container") {
      // Sum of children heights + gaps
      const container = node as ContainerNode;
      if (container.layout?.type === "flow") {
        const gap = (container.layout as FlowLayout).gap || 0;
        return container.children.reduce((sum, child) => {
          return sum + this.estimateHeight(child, width) + gap;
        }, 0);
      }
    }

    // Default height
    return 10; // 10% of slide height
  }

  /**
   * Apply padding to bounds
   */
  private applyPadding(bounds: Rectangle, padding?: Spacing): Rectangle {
    if (!padding) return bounds;

    return {
      x: bounds.x + padding.left,
      y: bounds.y + padding.top,
      width: bounds.width - padding.left - padding.right,
      height: bounds.height - padding.top - padding.bottom,
    };
  }
}
```

**Key Methods**:

- `position(trees)`: Main entry point for positioning
- `positionNode(node, bounds)`: Recursive positioning algorithm
- `positionFlowChildren()`: Handle vertical/horizontal flow layouts
- `positionGridChildren()`: Handle grid layouts
- `positionAbsoluteChildren()`: Handle absolute positioning
- `estimateHeight()`: Estimate node height based on content
- `applyPadding()`: Apply padding to bounding rectangle

**Coordinate System**:

- Uses percentage-based coordinates (0-100 for x/y, 0-100 for width/height)
- Renderer-independent (works for PPTX, Web, PDF)
- Origin (0,0) is top-left corner
- All nodes get `_rect` property with computed coordinates

### 5. Theme Resolver

**Location**: `packages/design/src/theme-resolver.ts`

```typescript
export interface ThemeResolverOptions {
  defaultTheme?: string;
}

export class ThemeResolver {
  constructor(private options: ThemeResolverOptions = {}) {}

  /**
   * Apply theme to layout trees
   */
  apply(trees: LayoutTree[], themeName?: string): LayoutTree[] {
    const theme = this.loadTheme(themeName || this.options.defaultTheme || "executive");
    return trees.map((tree) => this.applyToTree(tree, theme));
  }

  /**
   * Apply theme to a single tree
   */
  private applyToTree(tree: LayoutTree, theme: Theme): LayoutTree {
    const themed = { ...tree };

    // Apply background
    if (theme.colors.background) {
      themed.background = theme.colors.background;
    }

    // Apply to nodes
    this.applyToNode(themed.root, theme);

    return themed;
  }

  /**
   * Apply theme to a node
   */
  private applyToNode(node: LayoutNode, theme: Theme): void {
    if (node.type === "text") {
      const textNode = node as TextNode;

      // Resolve font role
      if (textNode.text.fontRole) {
        const fontConfig = theme.typography[textNode.text.fontRole];
        if (fontConfig) {
          textNode.text.fontFamily = fontConfig.family;
          textNode.text.fontWeight = fontConfig.weight;
        }
      }

      // Resolve color role
      if (textNode.text.colorRole) {
        textNode.text.color = theme.colors[textNode.text.colorRole];
      }

      // Apply default text color if not set
      if (!textNode.text.color) {
        textNode.text.color = theme.colors.text || "#000000";
      }
    }

    // Recurse to children
    if (node.type === "container") {
      const container = node as ContainerNode;
      container.children.forEach((child) => this.applyToNode(child, theme));
    }
  }

  /**
   * Load theme by name
   */
  private loadTheme(name: string): Theme {
    // Load from theme registry
    // For now, return default theme structure
    return {
      name,
      colors: {
        background: "#FFFFFF",
        text: "#1A1A1A",
        primary: "#2563EB",
        secondary: "#64748B",
        accent: "#F59E0B",
      },
      typography: {
        title: { family: "Inter", weight: "bold" },
        body: { family: "Inter", weight: "normal" },
        display: { family: "Inter", weight: "bold" },
        code: { family: "Fira Code", weight: "normal" },
      },
    };
  }
}

export interface Theme {
  name: string;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    [key: string]: string;
  };
  typography: {
    [role: string]: {
      family: string;
      weight: "normal" | "bold";
    };
  };
}
```

**Key Methods**:

- `apply(trees, themeName)`: Main entry point
- `applyToTree(tree, theme)`: Apply theme to single tree
- `applyToNode(node, theme)`: Apply theme to node recursively
- `loadTheme(name)`: Load theme configuration

### 6. PPTX Renderer (Existing)

**Location**: `packages/renderer-pptx/src/renderer/pptx-renderer.ts`

**Required Changes**:

- Ensure renderer reads `_rect` property from nodes
- Convert percentage coordinates to PowerPoint units (EMUs)
- Handle missing `_rect` gracefully with error message

## Data Models

### Blueprint v2 (Existing)

Defined in `packages/schema/src/v2/blueprint.ts`:

```typescript
interface KyroBlueprint {
  version: "2.0";
  meta: BlueprintMeta;
  theme?: ThemeHints;
  slides: Slide[];
}

interface Slide {
  id: string;
  type: SlideType;
  intent: string;
  layout: LayoutType;
  content: ContentBlock[];
  media?: MediaBlock[];
  styling?: SlideStyle;
  animation?: AnimationHint;
}
```

### LayoutTree (Existing)

Defined in `packages/layout/src/types.ts`:

```typescript
interface LayoutTree {
  root: LayoutNode;
  background?: string;
}

interface LayoutNode {
  id: string;
  type: string;
  _rect?: Rectangle; // Added by positioning engine
  margin?: Spacing;
  padding?: Spacing;
}

interface Rectangle {
  x: number; // 0-100 (percentage)
  y: number; // 0-100 (percentage)
  width: number; // 0-100 (percentage)
  height: number; // 0-100 (percentage)
}
```

### Pipeline Context

```typescript
interface PipelineContext {
  prompt: string;
  options: PipelineOptions;
  stages: {
    blueprint?: KyroBlueprint;
    layoutTrees?: LayoutTree[];
    positionedTrees?: LayoutTree[];
    themedTrees?: LayoutTree[];
  };
  errors: PipelineError[];
  startTime: number;
}

interface PipelineOptions {
  outputPath: string;
  themeName?: string;
  provider?: string;
  mockMode?: boolean;
}

interface PipelineError {
  stage: string;
  message: string;
  details?: any;
  stack?: string;
}
```

## Error Handling

### Error Types

```typescript
class BlueprintGenerationError extends Error {
  constructor(
    message: string,
    public prompt: string,
    public aiError?: Error,
  ) {
    super(message);
    this.name = "BlueprintGenerationError";
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public errors: ValidationError[],
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

class LayoutError extends Error {
  constructor(
    message: string,
    public slideId?: string,
    public nodeId?: string,
  ) {
    super(message);
    this.name = "LayoutError";
  }
}

class PositioningError extends Error {
  constructor(
    message: string,
    public nodeId: string,
    public layoutMode?: string,
  ) {
    super(message);
    this.name = "PositioningError";
  }
}

class ThemeError extends Error {
  constructor(
    message: string,
    public themeName: string,
  ) {
    super(message);
    this.name = "ThemeError";
  }
}

class RenderError extends Error {
  constructor(
    message: string,
    public nodeType?: string,
    public nodeId?: string,
  ) {
    super(message);
    this.name = "RenderError";
  }
}
```

### Error Handling Strategy

1. **Catch at Stage Boundaries**: Each pipeline stage catches and wraps errors
2. **Preserve Context**: Include relevant IDs, names, and state in error objects
3. **Fail Fast**: Stop pipeline on first error (no partial outputs)
4. **Detailed Logging**: Log stage entry/exit and error details
5. **User-Friendly Messages**: Convert technical errors to actionable messages

### Example Error Flow

```typescript
try {
  // Stage 1: Blueprint Generation
  log.info("Generating Blueprint from prompt...");
  const blueprint = await generator.generate(prompt);
  log.success("Blueprint generated");
} catch (error) {
  if (error instanceof BlueprintGenerationError) {
    log.error(`Blueprint generation failed: ${error.message}`);
    log.info(`Prompt: ${error.prompt}`);
    if (error.aiError) {
      log.error(`AI Error: ${error.aiError.message}`);
    }
  }
  throw error;
}
```

## Testing Strategy

### Unit Tests

**Blueprint Generator**:

- Test prompt parsing and meta inference
- Test JSON extraction from LLM responses
- Test error handling for invalid AI responses
- Mock KyroAI to avoid API calls

**Validation Layer**:

- Test valid Blueprint v2 structures
- Test invalid structures (missing fields, wrong types)
- Test error message formatting
- Test each content block type validation

**Positioning Engine**:

- Test flow layout (vertical and horizontal)
- Test grid layout with various column counts
- Test absolute positioning
- Test padding and margin application
- Test height estimation for text nodes
- Test percentage coordinate calculations

**Theme Resolver**:

- Test theme loading
- Test font role resolution
- Test color role resolution
- Test default theme application
- Test theme override behavior

### Integration Tests

**End-to-End Pipeline**:

- Test complete pipeline with mock AI
- Test pipeline with real AI (optional, requires API key)
- Test error propagation through stages
- Test output file generation
- Verify PPTX files open in PowerPoint

**Stage Integration**:

- Test Blueprint → Layout transformation
- Test Layout → Positioning transformation
- Test Positioning → Theming transformation
- Test Theming → Rendering transformation

### Test Data

**Sample Prompts**:

```typescript
const testPrompts = ["Create a 3-slide presentation about AI in education", "Make a pitch deck for a SaaS startup with 5 slides", "Generate a report on Q4 sales performance"];
```

**Sample Blueprints**:

- Minimal valid Blueprint (1 slide, basic content)
- Complex Blueprint (10 slides, all content types)
- Invalid Blueprints (missing fields, wrong types)

**Expected Outputs**:

- Valid PPTX files that open without errors
- Correct slide count
- Correct text content
- Correct positioning (visual inspection)

### Testing Without External Dependencies

**Mock Mode**:

```typescript
if (options.mockMode) {
  // Use template-based generation instead of AI
  blueprint = generateFromTemplate(prompt);
} else {
  // Use real AI
  blueprint = await kyroAI.generate(prompt);
}
```

**Template-Based Generation**:

- Parse prompt for keywords (slides, topic, type)
- Select appropriate template
- Fill template with extracted content
- Return valid Blueprint v2

## Implementation Plan

### Phase 1: Foundation (Week 1)

1. **Create Positioning Engine**
   - Implement `PositioningEngine` class
   - Implement flow layout positioning
   - Implement grid layout positioning
   - Add unit tests

2. **Create Theme Resolver**
   - Implement `ThemeResolver` class
   - Create theme registry
   - Add unit tests

3. **Update PPTX Renderer**
   - Ensure `_rect` property is read
   - Add coordinate conversion (percentage → EMUs)
   - Add error handling for missing `_rect`

### Phase 2: Blueprint Generation (Week 2)

1. **Create Blueprint Generator**
   - Implement `BlueprintGenerator` class
   - Design system prompt with Blueprint v2 schema
   - Implement JSON parsing and validation
   - Add unit tests with mocked AI

2. **Create Validation Layer**
   - Implement `validateBlueprint()` function
   - Implement error formatting
   - Add comprehensive unit tests

3. **Create Mock Mode**
   - Implement template-based generation
   - Create prompt parser
   - Add templates for common use cases

### Phase 3: Pipeline Integration (Week 3)

1. **Create Pipeline Orchestrator**
   - Implement `Pipeline` class
   - Wire all stages together
   - Add error handling and logging
   - Add integration tests

2. **Update Magic Command**
   - Integrate new pipeline
   - Add CLI options (theme, mock mode)
   - Add progress logging
   - Test end-to-end

3. **Documentation**
   - Update README with pipeline architecture
   - Add usage examples
   - Document error messages
   - Create troubleshooting guide

### Phase 4: Testing and Refinement (Week 4)

1. **Comprehensive Testing**
   - Run integration tests
   - Test with various prompts
   - Verify PPTX output quality
   - Fix positioning issues

2. **Performance Optimization**
   - Profile pipeline execution
   - Optimize slow stages
   - Add caching where appropriate

3. **Error Message Refinement**
   - Review all error messages
   - Make messages actionable
   - Add suggestions for common errors

## Future Enhancements

### Multi-Target Rendering

Once positioning engine is stable, add renderers for:

- **Web**: React-based slide viewer
- **PDF**: Print-ready export
- **Canva**: API integration for editable designs

### Advanced Positioning

- **Auto-sizing**: Automatically adjust node sizes based on content
- **Collision Detection**: Prevent overlapping nodes
- **Alignment Guides**: Snap nodes to alignment guides
- **Responsive Layouts**: Adjust layouts for different aspect ratios

### Theme System

- **Theme Marketplace**: User-contributed themes
- **Theme Editor**: Visual theme customization
- **Brand Kits**: Company-specific design systems
- **Dynamic Theming**: AI-generated themes from prompts

### Animation System

- **Animation Engine**: Apply animation hints to nodes
- **Transition System**: Smooth transitions between slides
- **Interactive Elements**: Clickable elements and navigation

## Success Criteria

### Functional Requirements

✅ Pipeline generates valid Blueprint v2 from prompts  
✅ Validation catches all schema violations  
✅ Layout engine creates proper node hierarchies  
✅ Positioning engine adds coordinates to all nodes  
✅ Theme resolver applies consistent styling  
✅ PPTX renderer produces valid PowerPoint files  
✅ Pipeline completes in under 30 seconds  
✅ Mock mode works without API keys

### Quality Requirements

✅ All unit tests pass  
✅ Integration tests pass  
✅ PPTX files open in PowerPoint and Keynote  
✅ Text is readable and properly positioned  
✅ Layouts match Blueprint intent  
✅ Error messages are actionable  
✅ Code is documented and maintainable

### Performance Requirements

✅ Blueprint generation: < 10 seconds  
✅ Validation: < 100ms  
✅ Layout generation: < 500ms  
✅ Positioning: < 500ms  
✅ Theming: < 100ms  
✅ Rendering: < 5 seconds  
✅ Total pipeline: < 30 seconds

---

**Status**: Design complete, ready for implementation  
**Next Step**: Begin Phase 1 implementation (Positioning Engine + Theme Resolver)

### Why Property-Based Testing Does NOT Apply

This feature is **not suitable for property-based testing** because:

1. **Infrastructure Integration**: The pipeline integrates external services (AI APIs), file I/O (PPTX rendering), and configuration management - these are integration concerns, not pure logic
2. **External Dependencies**: AI generation depends on external API behavior that doesn't vary meaningfully with input structure
3. **Side-Effect Heavy**: Most operations involve side effects (file writes, API calls, state mutations)
4. **Configuration Validation**: Many requirements test one-time setup and configuration, not universal properties

**Testing Approach**: Use **unit tests** for pure logic components (positioning calculations, validation) and **integration tests** for pipeline orchestration and file output verification.

### Unit Tests

**Blueprint Generator**:

- Test prompt parsing and meta inference with example prompts
- Test JSON extraction from LLM responses with sample responses
- Test error handling for invalid AI responses (malformed JSON, missing fields)
- Mock KyroAI to avoid API calls in tests
- Test template-based generation in mock mode

**Validation Layer**:

- Test valid Blueprint v2 structures (minimal, complex, all content types)
- Test invalid structures (missing required fields, wrong types, invalid enums)
- Test error message formatting (readable paths, actionable messages)
- Test each content block type validation (heading, text, bullets, quote, stat, code)
- Test discriminated union validation for content blocks

**Positioning Engine** (Pure Logic - Good for Unit Tests):

- Test flow layout positioning (vertical and horizontal)
- Test grid layout with various column counts (2, 3, 4)
- Test absolute positioning with explicit coordinates
- Test padding application to bounding rectangles
- Test margin calculation for node boundaries
- Test height estimation for text nodes with different content lengths
- Test percentage coordinate calculations (0-100 range)
- Test edge cases: empty containers, single child, many children

**Theme Resolver**:

- Test theme loading by name (executive, minimal, modern)
- Test font role resolution (title, body, display, code)
- Test color role resolution (primary, secondary, accent)
- Test default theme application when no theme specified
- Test theme override behavior (explicit styles preserved)
- Test missing theme handling (fallback to default)

### Integration Tests

**End-to-End Pipeline**:

- Test complete pipeline with mock AI (no API key required)
- Test pipeline with real AI (optional, requires API key, marked as integration)
- Test error propagation through stages (fail at each stage, verify error context)
- Test output file generation (PPTX file created, correct size)
- Verify PPTX files open in PowerPoint/Keynote without errors
- Test performance: pipeline completes in under 30 seconds for 5-slide deck

**Stage Integration**:

- Test Blueprint → Layout transformation (valid Blueprint produces LayoutTree[])
- Test Layout → Positioning transformation (all nodes get \_rect property)
- Test Positioning → Theming transformation (theme tokens applied correctly)
- Test Theming → Rendering transformation (PPTX file matches themed layout)

**Error Handling Integration**:

- Test Blueprint generation failure (invalid AI response)
- Test validation failure (malformed Blueprint)
- Test layout generation failure (unsupported content block)
- Test positioning failure (invalid layout mode)
- Test theming failure (missing theme)
- Test rendering failure (invalid node type)
- Verify error messages include stage context and actionable information

### Test Data

**Sample Prompts**:

```typescript
const testPrompts = ["Create a 3-slide presentation about AI in education", "Make a pitch deck for a SaaS startup with 5 slides", "Generate a report on Q4 sales performance", "Build a training deck on cybersecurity best practices"];
```

**Sample Blueprints**:

```typescript
// Minimal valid Blueprint (1 slide, basic content)
const minimalBlueprint = {
  version: "2.0",
  meta: {
    title: "Test Presentation",
    goal: "inform",
    tone: "modern",
  },
  slides: [
    {
      id: "s1",
      type: "hero",
      intent: "Introduce topic",
      layout: "center_focus",
      content: [
        {
          type: "heading",
          value: "Test Title",
          level: "h1",
        },
      ],
    },
  ],
};

// Complex Blueprint (multiple slides, all content types)
// Invalid Blueprints (missing fields, wrong types, invalid enums)
```

**Expected Outputs**:

- Valid PPTX files that open without errors
- Correct slide count matches Blueprint
- Correct text content matches Blueprint content blocks
- Correct positioning (visual inspection or coordinate verification)
- Correct theming (colors and fonts match theme)

### Testing Without External Dependencies

**Mock Mode Implementation**:

```typescript
export class BlueprintGenerator {
  async generate(prompt: string, options: { mockMode?: boolean } = {}) {
    if (options.mockMode) {
      // Use template-based generation instead of AI
      return this.generateFromTemplate(prompt);
    } else {
      // Use real AI
      return this.generateWithAI(prompt);
    }
  }

  private generateFromTemplate(prompt: string): KyroBlueprint {
    // Parse prompt for keywords (slides, topic, type)
    const keywords = this.extractKeywords(prompt);

    // Select appropriate template
    const template = this.selectTemplate(keywords);

    // Fill template with extracted content
    return this.fillTemplate(template, keywords);
  }
}
```

**Template-Based Generation**:

- Parse prompt for keywords: slide count, topic, presentation type
- Select template based on keywords (pitch, report, training, etc.)
- Fill template with extracted content
- Return valid Blueprint v2 structure
- Ensures tests can run without API keys

### Test Execution Strategy

**Fast Tests (Unit Tests)**:

- Run on every commit
- No external dependencies
- Complete in < 5 seconds
- Mock all I/O and API calls

**Slow Tests (Integration Tests)**:

- Run before merge/deploy
- May require API keys (optional)
- Complete in < 60 seconds
- Test actual file output and pipeline execution

**Visual Tests (Manual)**:

- Open generated PPTX files in PowerPoint
- Verify layout matches intent
- Check text readability
- Verify theme consistency
- Run periodically or on major changes
