# Background Theme Rendering Fix - Bugfix Design

## Overview

The bug prevents background themes from being applied to generated PowerPoint files. The system has complete theme infrastructure (ThemeSpec, ThemeAgent, static fallback themes) and the PPTX renderer fully supports applying backgrounds, but the core `generateDeck` function fails to generate or pass the ThemeSpec to the renderer. This results in all slides having blank/white backgrounds instead of professionally styled backgrounds with appropriate dark/light modes and colors.

The fix requires integrating ThemeAgent into the `generateDeck` pipeline to generate a ThemeSpec from the blueprint and passing it through to the renderer. This is a minimal, targeted change that activates existing infrastructure without modifying the renderer or theme generation logic.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when `generateDeck` is called with a valid blueprint but no ThemeSpec is generated or passed to the renderer
- **Property (P)**: The desired behavior - slides should have background colors applied based on ThemeSpec (darkBg for dark mode, lightBg for light mode)
- **Preservation**: Existing rendering behavior (header bands, decorations, text colors, layout) that must remain unchanged by the fix
- **generateDeck**: The function in `packages/core/src/deck.ts` that orchestrates the full pipeline from schema to PPTX file
- **ThemeAgent**: The class in `packages/design/src/theme-agent.ts` that generates ThemeSpec using AI or falls back to static themes
- **ThemeSpec**: The data structure containing palette (colors), typography (fonts), and slideRhythm (per-slide theme configuration)
- **renderPPTXToFile**: The function in `packages/renderer-pptx/src/renderer/pptx-renderer.ts` that accepts layouts and optional ThemeSpec to generate PPTX files
- **slideRhythm**: Array of SlideTheme objects in ThemeSpec, one per slide, defining backgroundMode, accentColor, headerStyle, and decorations

## Bug Details

### Bug Condition

The bug manifests when `generateDeck` is called with a valid blueprint. The function generates layouts, polishes them, resolves them, and passes them to `renderPPTXToFile`, but it never generates a ThemeSpec or passes it as the third parameter. The renderer has conditional logic `if (slideTheme && themeSpec)` that applies backgrounds, but this condition always evaluates to false because `themeSpec` is undefined.

**Formal Specification:**

```
FUNCTION isBugCondition(input)
  INPUT: input of type { blueprint: Blueprint, outputPath: string }
  OUTPUT: boolean

  RETURN input.blueprint IS valid
         AND generateDeck(input.blueprint, input.outputPath) is called
         AND NO ThemeSpec is generated inside generateDeck
         AND renderPPTXToFile is called WITHOUT themeSpec parameter
         AND resulting PPTX has NO background colors applied
END FUNCTION
```

### Examples

- **Example 1**: User generates a 5-slide executive presentation via web UI
  - Expected: Slides alternate between navy dark backgrounds and off-white light backgrounds
  - Actual: All slides have blank/white backgrounds with no styling
- **Example 2**: User generates a 3-slide pitch deck with hero, content, and closing slides
  - Expected: Hero slide has dark navy background, content slide has light background, closing slide has dark background
  - Actual: All three slides are blank/white with no background colors
- **Example 3**: CLI user runs `kyro generate input.json output.pptx`
  - Expected: Generated PPTX has professional theme with appropriate background colors per slide
  - Actual: Generated PPTX has no background colors, appears unfinished
- **Edge Case**: Blueprint with single slide
  - Expected: Single slide gets appropriate background color based on slide type (dark for hero/closing/data, light for content)
  - Actual: Single slide has no background color

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- Header bands must continue to render correctly when `headerStyle: "band"` is set in SlideTheme
- Decorative shapes (left-bar, oval, bottom-bar, etc.) must continue to render correctly based on SlideTheme decorations array
- Text color selection (textOnDark vs textOnLight) must continue to work based on backgroundMode
- Font selection (displayFont for titles, bodyFont for body text) must continue to work correctly
- Layout generation, polishing, and resolution must remain unchanged
- Image and shape rendering must remain unchanged
- Slide number rendering must continue to work correctly

**Scope:** All rendering logic that does NOT involve background color application should be completely unaffected by this fix. This includes:

- All text rendering (font selection, color selection, sizing, positioning)
- All image rendering (URL validation, placeholder rendering, sizing)
- All shape rendering (type mapping, fill, stroke)
- All decoration rendering (left-bar, oval, bottom-bar, etc.)
- All layout computation (\_rect calculation)
- All polishing logic (hierarchy, rhythm, balance, whitespace)

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is clear:

1. **Missing ThemeAgent Integration**: The `generateDeck` function has a comment `// Apply theme (design tokens)` but no implementation. ThemeAgent is never instantiated or called.

2. **Missing ThemeSpec Parameter**: The call to `renderPPTXToFile(layouts, outputPath)` only passes two parameters. The third parameter (themeSpec) is never provided.

3. **Incomplete Pipeline**: The pipeline comment in `generateDeck` mentions "Theme" as step 3, but this step is not implemented. The code jumps from layout generation directly to polishing without theme generation.

4. **No Blueprint Access**: Even if ThemeAgent were instantiated, the original blueprint/schema is not preserved after layout generation, making it impossible to pass to ThemeAgent later in the pipeline.

## Correctness Properties

Property 1: Bug Condition - Background Colors Applied

_For any_ valid blueprint passed to generateDeck, the fixed function SHALL generate a ThemeSpec using ThemeAgent (with static fallback), pass it to renderPPTXToFile, and produce a PPTX file where each slide has a background color applied according to its SlideTheme backgroundMode (darkBg for dark mode, lightBg for light mode).

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

Property 2: Preservation - Rendering Behavior Unchanged

_For any_ rendering operation that does NOT involve background color application (text rendering, image rendering, shape rendering, decoration rendering, layout computation), the fixed code SHALL produce exactly the same result as the original code, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `packages/core/src/deck.ts`

**Function**: `generateDeck`

**Specific Changes**:

1. **Import ThemeAgent**: Add import statement at the top of the file

   ```typescript
   import { ThemeAgent } from "@kyro/design";
   ```

2. **Instantiate ThemeAgent**: Create ThemeAgent instance before layout generation

   ```typescript
   const themeAgent = new ThemeAgent();
   ```

3. **Generate ThemeSpec**: Call ThemeAgent.generateTheme() with the blueprint before layout generation

   ```typescript
   console.log(`  [generateDeck] Generating theme...`);
   const themeSpec = await themeAgent.generateTheme(schema, { fallbackTheme: "executive" });
   console.log(`  [generateDeck] Theme generated: ${themeSpec.palette.primary}`);
   ```

4. **Pass ThemeSpec to Renderer**: Update the renderPPTXToFile call to include themeSpec as third parameter

   ```typescript
   await renderPPTXToFile(layouts, outputPath, themeSpec);
   ```

5. **Update Function Signature**: Change generateDeck to async if not already (it already is)
   - No change needed, function is already async

**Implementation Order**:

1. Add import statement
2. Instantiate ThemeAgent after logging starts
3. Generate ThemeSpec after logging but before layout generation
4. Pass themeSpec to renderPPTXToFile call

**No Changes Required**:

- `renderPPTXToFile` already accepts optional themeSpec parameter
- `ThemeAgent.generateTheme()` already handles fallback to static themes
- Renderer already has complete logic for applying backgrounds based on themeSpec

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that generated PPTX files have no background colors.

**Test Plan**: Generate PPTX files using the UNFIXED `generateDeck` function with various blueprints. Inspect the generated files (manually or programmatically) to verify that slides have no background colors. This confirms the bug exists and validates our understanding of the defect.

**Test Cases**:

1. **Single Hero Slide Test**: Generate PPTX with one hero slide (will have no background on unfixed code)
2. **Multi-Slide Executive Test**: Generate PPTX with 5 slides using executive theme pattern (will have no backgrounds on unfixed code)
3. **Mixed Slide Types Test**: Generate PPTX with hero, content, data, and closing slides (will have no backgrounds on unfixed code)
4. **Edge Case - Empty Blueprint**: Generate PPTX with zero slides (may fail or produce empty file on unfixed code)

**Expected Counterexamples**:

- All generated PPTX files will have slides with no background colors (blank/white)
- Possible observation: Header bands and decorations may still render (if themeSpec fallback logic exists elsewhere)
- Confirms root cause: ThemeSpec is not being generated or passed to renderer

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (valid blueprints), the fixed function produces the expected behavior (backgrounds applied).

**Pseudocode:**

```
FOR ALL blueprint WHERE isValidBlueprint(blueprint) DO
  themeSpec := generateTheme(blueprint)
  pptx := generateDeck_fixed(blueprint, "output.pptx")

  FOR EACH slide IN pptx DO
    slideTheme := themeSpec.slideRhythm[slide.index]
    expectedBg := slideTheme.backgroundMode === "dark"
                  ? themeSpec.palette.darkBg
                  : themeSpec.palette.lightBg

    ASSERT slide.background.color === expectedBg
  END FOR
END FOR
```

**Testing Approach**: Generate PPTX files with the FIXED code and verify that:

1. ThemeSpec is generated (check logs or add assertions)
2. ThemeSpec is passed to renderer (check logs or add assertions)
3. Each slide has a background color matching its SlideTheme backgroundMode
4. Background colors match the palette (darkBg or lightBg)

**Test Cases**:

1. **Single Hero Slide Test**: Verify hero slide has dark background (darkBg color)
2. **Multi-Slide Executive Test**: Verify slides alternate between dark and light backgrounds according to executive theme rhythm
3. **Mixed Slide Types Test**: Verify hero/closing/data slides have dark backgrounds, content slides have light backgrounds
4. **Fallback Theme Test**: Verify that if AI generation fails, static theme is used and backgrounds are still applied

### Preservation Checking

**Goal**: Verify that for all rendering operations where the bug condition does NOT hold (non-background rendering), the fixed function produces the same result as the original function.

**Pseudocode:**

```
FOR ALL blueprint WHERE isValidBlueprint(blueprint) DO
  pptx_original := generateDeck_original(blueprint, "original.pptx")
  pptx_fixed := generateDeck_fixed(blueprint, "fixed.pptx")

  FOR EACH slide IN pptx_original DO
    slide_fixed := pptx_fixed[slide.index]

    // Verify non-background elements are identical
    ASSERT slide.headerBand === slide_fixed.headerBand
    ASSERT slide.decorations === slide_fixed.decorations
    ASSERT slide.textNodes === slide_fixed.textNodes
    ASSERT slide.imageNodes === slide_fixed.imageNodes
    ASSERT slide.shapeNodes === slide_fixed.shapeNodes
    ASSERT slide.slideNumber === slide_fixed.slideNumber
  END FOR
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:

- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-background rendering

**Test Plan**: Generate PPTX files with both UNFIXED and FIXED code using identical blueprints. Compare the rendered elements (excluding background colors) to verify they are identical. This ensures the fix does not introduce regressions.

**Test Cases**:

1. **Text Rendering Preservation**: Verify that text content, font selection, color selection, sizing, and positioning are identical between unfixed and fixed versions
2. **Image Rendering Preservation**: Verify that images render in the same positions with the same sizing and object-fit behavior
3. **Decoration Rendering Preservation**: Verify that left-bars, ovals, bottom-bars, and other decorations render identically
4. **Header Band Preservation**: Verify that header bands render identically (position, size, color)
5. **Slide Number Preservation**: Verify that slide numbers render identically (position, size, color)
6. **Layout Preservation**: Verify that \_rect values for all nodes are identical (layout computation unchanged)

### Unit Tests

- Test ThemeAgent instantiation in generateDeck
- Test ThemeSpec generation with valid blueprint
- Test ThemeSpec fallback when AI generation fails
- Test that themeSpec parameter is passed to renderPPTXToFile
- Test background color application for dark mode slides
- Test background color application for light mode slides
- Test edge case: empty blueprint (zero slides)
- Test edge case: single slide blueprint

### Property-Based Tests

- Generate random blueprints with varying slide counts (1-20 slides) and verify backgrounds are applied correctly
- Generate random slide type combinations (hero, content, data, closing) and verify background mode assignment
- Generate random theme palettes and verify correct darkBg/lightBg selection
- Test preservation: generate random blueprints and verify non-background elements are identical between unfixed and fixed versions

### Integration Tests

- Test full pipeline: schema → validation → layout → theme → polish → rendering → file output
- Test web UI flow: user submits blueprint, receives PPTX with backgrounds applied
- Test CLI flow: user runs `kyro generate`, receives PPTX with backgrounds applied
- Test that generated PPTX files open correctly in PowerPoint/Google Slides with backgrounds visible
- Test visual regression: compare screenshots of slides before and after fix (backgrounds should be added, everything else identical)
