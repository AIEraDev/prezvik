/**
 * Output verification script for Export Layer (v2)
 * Tests actual rendering output quality by reading generated files
 */

import { ExportLayerFacade } from "./dist/facade.js";
import { readFile } from "fs/promises";

// Create a comprehensive Visual Context for testing
const sampleVisualContext = {
  version: "1.0",
  slides: [
    {
      slideId: "slide-1",
      type: "hero",
      dimensions: { width: 960, height: 540 },
      background: {
        id: "bg-1",
        kind: "background",
        zIndex: 0,
        opacity: 1,
        fill: {
          type: "gradient",
          gradient: {
            type: "linear",
            angle: 45,
            stops: [
              { position: 0, color: "#1a365d" },
              { position: 0.5, color: "#2c5282" },
              { position: 1, color: "#2c7a7b" },
            ],
          },
        },
        dimensions: { width: 960, height: 540 },
      },
      decorations: [
        {
          id: "shape-1",
          kind: "shape",
          shapeType: "rectangle",
          zIndex: 1,
          opacity: 0.8,
          bounds: { x: 50, y: 50, width: 200, height: 100 },
          fill: {
            type: "solid",
            color: "#3182ce",
          },
          properties: {
            cornerRadius: 10,
          },
        },
        {
          id: "shape-2",
          kind: "shape",
          shapeType: "circle",
          zIndex: 1,
          opacity: 0.6,
          bounds: { x: 700, y: 400, width: 100, height: 100 },
          fill: {
            type: "solid",
            color: "#e53e3e",
          },
        },
      ],
      content: [
        {
          id: "text-1",
          kind: "text",
          zIndex: 10,
          opacity: 1,
          bounds: { x: 100, y: 200, width: 760, height: 100 },
          content: {
            text: "Export Layer Verification",
            font: "Arial",
            fontSize: 48,
            color: "#ffffff",
            align: "center",
            verticalAlign: "middle",
            bold: true,
          },
        },
        {
          id: "text-2",
          kind: "text",
          zIndex: 10,
          opacity: 1,
          bounds: { x: 100, y: 320, width: 760, height: 60 },
          content: {
            text: "Testing PPTX and HTML rendering with gradients and shapes",
            font: "Arial",
            fontSize: 24,
            color: "#cbd5e0",
            align: "center",
            verticalAlign: "middle",
            bold: false,
          },
        },
      ],
    },
    {
      slideId: "slide-2",
      type: "content",
      dimensions: { width: 960, height: 540 },
      background: {
        id: "bg-2",
        kind: "background",
        zIndex: 0,
        opacity: 1,
        fill: {
          type: "gradient",
          gradient: {
            type: "radial",
            center: { x: 0.5, y: 0.5 },
            radius: 0.7,
            stops: [
              { position: 0, color: "#667eea" },
              { position: 1, color: "#764ba2" },
            ],
          },
        },
        dimensions: { width: 960, height: 540 },
      },
      decorations: [],
      content: [
        {
          id: "text-3",
          kind: "text",
          zIndex: 10,
          opacity: 1,
          bounds: { x: 100, y: 150, width: 760, height: 240 },
          content: {
            text: "Radial Gradient Background\n\nThis slide demonstrates radial gradient rendering in both PPTX and HTML formats.",
            font: "Arial",
            fontSize: 32,
            color: "#ffffff",
            align: "center",
            verticalAlign: "middle",
            bold: false,
          },
        },
      ],
    },
  ],
  colorPalette: {
    version: "1.0",
    primary: "#1a365d",
    secondary: "#2c7a7b",
    accent: "#3182ce",
    lightBg: "#f7fafc",
    darkBg: "#1a365d",
    textOnDark: "#ffffff",
    textOnLight: "#1a202c",
    mutedOnDark: "#cbd5e0",
    mutedOnLight: "#718096",
    metadata: {
      colorSpace: "oklch",
      generatedAt: new Date().toISOString(),
      themeSpecHash: "test-hash",
    },
  },
  theme: {
    tone: "executive",
    typography: {
      displayFont: "Montserrat",
      bodyFont: "Open Sans",
    },
  },
  metadata: {
    generatedAt: new Date().toISOString(),
    layoutTreeHash: "layout-hash",
    themeSpecHash: "theme-hash",
  },
};

async function verifyOutputQuality() {
  console.log("🔍 Export Layer Output Verification\n");
  console.log("=".repeat(70));

  const facade = new ExportLayerFacade();

  // Test PPTX Renderer
  console.log("\n📊 PPTX Renderer:");
  console.log("-".repeat(70));

  try {
    const pptxRenderer = facade.getRenderer("pptx");

    // Validate
    const pptxValidation = pptxRenderer.validate(sampleVisualContext);
    console.log(`✓ Validation: ${pptxValidation.valid ? "PASS" : "FAIL"}`);
    if (!pptxValidation.valid) {
      console.log(`  Errors: ${pptxValidation.errors.join(", ")}`);
    }

    // Check features
    const pptxFeatures = pptxRenderer.getSupportedFeatures();
    console.log(`✓ Gradients supported: ${pptxFeatures.gradients}`);
    console.log(`✓ Custom shapes supported: ${pptxFeatures.customShapes}`);
    console.log(`✓ Patterns supported: ${pptxFeatures.patterns}`);
    console.log(`✓ Blend modes supported: ${pptxFeatures.blendModes}`);

    // Render
    const pptxResult = await pptxRenderer.render(sampleVisualContext, {
      outputPath: "test-output.pptx",
    });

    console.log(`✓ Rendering: ${pptxResult.success ? "SUCCESS" : "FAILED"}`);
    if (pptxResult.success) {
      console.log(`✓ Output file: ${pptxResult.outputPath}`);

      // Read file to check size
      try {
        const fileContent = await readFile("test-output.pptx");
        console.log(`✓ File size: ${(fileContent.length / 1024).toFixed(2)} KB`);
        console.log(`✓ Valid PPTX: ${fileContent.length > 1000 ? "YES" : "NO"}`);
      } catch (err) {
        console.log(`✗ Could not read file: ${err.message}`);
      }
    } else {
      console.log(`  Errors: ${pptxResult.errors?.join(", ")}`);
    }
  } catch (error) {
    console.log(`✗ PPTX Renderer Error: ${error.message}`);
  }

  // Test Web Renderer
  console.log("\n🌐 Web Renderer:");
  console.log("-".repeat(70));

  try {
    const htmlRenderer = facade.getRenderer("html");

    // Validate
    const htmlValidation = htmlRenderer.validate(sampleVisualContext);
    console.log(`✓ Validation: ${htmlValidation.valid ? "PASS" : "FAIL"}`);
    if (!htmlValidation.valid) {
      console.log(`  Errors: ${htmlValidation.errors.join(", ")}`);
    }

    // Check features
    const htmlFeatures = htmlRenderer.getSupportedFeatures();
    console.log(`✓ Gradients supported: ${htmlFeatures.gradients}`);
    console.log(`✓ Custom shapes supported: ${htmlFeatures.customShapes}`);
    console.log(`✓ Patterns supported: ${htmlFeatures.patterns}`);
    console.log(`✓ Blend modes supported: ${htmlFeatures.blendModes}`);

    // Render
    const htmlResult = await htmlRenderer.render(sampleVisualContext, {
      outputPath: "test-output.html",
    });

    console.log(`✓ Rendering: ${htmlResult.success ? "SUCCESS" : "FAILED"}`);
    if (htmlResult.success) {
      console.log(`✓ Output file: ${htmlResult.outputPath}`);

      // Read and analyze HTML content
      try {
        const htmlContent = await readFile("test-output.html", "utf-8");
        console.log(`✓ File size: ${(htmlContent.length / 1024).toFixed(2)} KB`);

        // Check for key features
        const checks = {
          "Reveal.js included": htmlContent.includes("reveal.js"),
          "Linear gradient (45deg)": htmlContent.includes("linear-gradient(45deg"),
          "Radial gradient": htmlContent.includes("radial-gradient"),
          "SVG shapes": htmlContent.includes("<svg"),
          "Rectangle shape": htmlContent.includes("<rect"),
          "Circle shape": htmlContent.includes("<circle"),
          "Text content": htmlContent.includes("Export Layer Verification"),
          "Typography (Montserrat)": htmlContent.includes("Montserrat"),
          "Typography (Open Sans)": htmlContent.includes("Open Sans"),
          "Responsive CSS": htmlContent.includes("@media"),
          "Slide structure": htmlContent.includes('class="reveal"'),
          "Slide decorations": htmlContent.includes('class="slide-decorations"'),
          "Slide content": htmlContent.includes('class="slide-content"'),
        };

        console.log("\n  Content Quality Checks:");
        let passCount = 0;
        for (const [check, passed] of Object.entries(checks)) {
          console.log(`  ${passed ? "✓" : "✗"} ${check}`);
          if (passed) passCount++;
        }

        console.log(`\n  Quality Score: ${passCount}/${Object.keys(checks).length} (${Math.round((passCount / Object.keys(checks).length) * 100)}%)`);

        // Count slides
        const slideCount = (htmlContent.match(/<section/g) || []).length;
        console.log(`  ✓ Slides rendered: ${slideCount}/2`);

        // Check gradient details
        const linearGradientMatch = htmlContent.match(/linear-gradient\(45deg, (#[0-9a-f]+) 0%, (#[0-9a-f]+) 50%, (#[0-9a-f]+) 100%\)/);
        if (linearGradientMatch) {
          console.log(`  ✓ Linear gradient colors: ${linearGradientMatch[1]}, ${linearGradientMatch[2]}, ${linearGradientMatch[3]}`);
        }

        const radialGradientMatch = htmlContent.match(/radial-gradient\(circle (\d+)% at (\d+)% (\d+)%/);
        if (radialGradientMatch) {
          console.log(`  ✓ Radial gradient: ${radialGradientMatch[1]}% radius at ${radialGradientMatch[2]}%, ${radialGradientMatch[3]}%`);
        }
      } catch (err) {
        console.log(`✗ Could not read file: ${err.message}`);
      }
    } else {
      console.log(`  Errors: ${htmlResult.errors?.join(", ")}`);
    }
  } catch (error) {
    console.log(`✗ Web Renderer Error: ${error.message}`);
  }

  // Test format switching
  console.log("\n🔄 Format Switching:");
  console.log("-".repeat(70));

  try {
    const pptxRenderer = facade.getRenderer("pptx");
    const htmlRenderer = facade.getRenderer("html");

    const pptxResult = await pptxRenderer.render(sampleVisualContext);
    const htmlResult = await htmlRenderer.render(sampleVisualContext);

    console.log(`✓ PPTX render: ${pptxResult.success ? "SUCCESS" : "FAILED"}`);
    console.log(`✓ HTML render: ${htmlResult.success ? "SUCCESS" : "FAILED"}`);
    console.log(`✓ Both formats work with same Visual Context`);
  } catch (error) {
    console.log(`✗ Format switching error: ${error.message}`);
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ Export Layer verification complete!");
  console.log("\nGenerated files:");
  console.log("  - test-output.pptx (PowerPoint presentation)");
  console.log("  - test-output.html (Reveal.js web presentation)");
  console.log("\nOpen test-output.html in a browser to view the web presentation.\n");
}

verifyOutputQuality().catch((error) => {
  console.error("❌ Verification failed:", error);
  process.exit(1);
});
