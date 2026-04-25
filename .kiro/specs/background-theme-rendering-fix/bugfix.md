# Bugfix Requirements Document

## Introduction

Background themes are not being applied to generated PowerPoint (.pptx) files on the web application. The system has a complete theme infrastructure (ThemeSpec, ThemeAgent, static fallback themes) and the PPTX renderer has full support for applying backgrounds, but the core `generateDeck` function fails to generate or pass the ThemeSpec to the renderer. This results in all slides having no background color applied, regardless of the theme configuration.

**Impact:** Users receive PowerPoint files with blank/white backgrounds instead of the professionally styled backgrounds (dark/light modes with appropriate colors) that the system is designed to provide.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN `generateDeck` is called with a blueprint THEN no ThemeSpec is generated or retrieved

1.2 WHEN `renderPPTXToFile` is invoked from `generateDeck` THEN the `themeSpec` parameter is undefined (not passed)

1.3 WHEN the PPTX renderer processes slides THEN the condition `if (slideTheme && themeSpec)` evaluates to false

1.4 WHEN the background application logic is reached THEN it is skipped entirely, leaving slides with no background

1.5 WHEN the fallback `tree.background` is checked THEN it is also undefined, resulting in completely blank slide backgrounds

### Expected Behavior (Correct)

2.1 WHEN `generateDeck` is called with a blueprint THEN a ThemeSpec SHALL be generated using ThemeAgent with static fallback

2.2 WHEN ThemeAgent generates a theme THEN it SHALL return a ThemeSpec containing palette (with darkBg/lightBg) and slideRhythm

2.3 WHEN `renderPPTXToFile` is invoked THEN the generated ThemeSpec SHALL be passed as the third parameter

2.4 WHEN the PPTX renderer processes each slide THEN it SHALL retrieve the corresponding SlideTheme from `themeSpec.slideRhythm[i]`

2.5 WHEN a SlideTheme has `backgroundMode: "dark"` THEN the renderer SHALL apply `themeSpec.palette.darkBg` as the slide background color

2.6 WHEN a SlideTheme has `backgroundMode: "light"` THEN the renderer SHALL apply `themeSpec.palette.lightBg` as the slide background color

### Unchanged Behavior (Regression Prevention)

3.1 WHEN slides are rendered with a valid ThemeSpec THEN header bands, decorations, and slide numbers SHALL CONTINUE TO be rendered correctly

3.2 WHEN ThemeAgent fails to generate a theme THEN the system SHALL CONTINUE TO fall back to static themes (executive, bold, minimal)

3.3 WHEN text nodes are rendered THEN font selection (displayFont for titles, bodyFont for body) SHALL CONTINUE TO work correctly

3.4 WHEN text colors are applied THEN textOnDark/textOnLight selection based on backgroundMode SHALL CONTINUE TO work correctly

3.5 WHEN the layout pipeline runs THEN layout generation, polishing, and resolution SHALL CONTINUE TO work without modification

3.6 WHEN images and shapes are rendered THEN their rendering logic SHALL CONTINUE TO work unchanged
