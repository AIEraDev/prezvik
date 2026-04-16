/**
 * Example usage of the Validation Layer
 *
 * This file demonstrates how to use the validator in real applications
 */

import { validateBlueprint, validateSlide, validateContentBlock } from "./validator.js";

// Example 1: Validate a complete Blueprint
function exampleValidateBlueprint() {
  const blueprint = {
    version: "2.0",
    meta: {
      title: "My Presentation",
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
            value: "Welcome",
            level: "h1",
          },
        ],
      },
    ],
  };

  const result = validateBlueprint(blueprint);

  if (result.success) {
    console.log("✓ Blueprint is valid");
    console.log("Data:", result.data);
  } else {
    console.error("✗ Blueprint validation failed:");
    result.errors?.forEach((error) => {
      console.error(`  - ${error.path.join(".")}: ${error.message}`);
    });
  }
}

// Example 2: Validate a single slide
function exampleValidateSlide() {
  const slide = {
    id: "s1",
    type: "content",
    intent: "Show key points",
    layout: "two_column",
    content: [
      {
        type: "bullets",
        items: [{ text: "Point 1" }, { text: "Point 2" }],
      },
    ],
  };

  const result = validateSlide(slide);

  if (result.success) {
    console.log("✓ Slide is valid");
  } else {
    console.error("✗ Slide validation failed");
  }
}

// Example 3: Validate a content block
function exampleValidateContentBlock() {
  const contentBlock = {
    type: "stat",
    value: 1000,
    label: "Users",
    prefix: "+",
    visualWeight: "hero",
  };

  const result = validateContentBlock(contentBlock);

  if (result.success) {
    console.log("✓ Content block is valid");
  } else {
    console.error("✗ Content block validation failed");
  }
}

// Example 4: Handle validation errors programmatically
function exampleErrorHandling() {
  const invalidBlueprint = {
    version: "1.0", // Wrong version
    meta: {
      title: "Test",
      goal: "invalid_goal", // Invalid enum
      tone: "modern",
    },
    slides: [],
  };

  const result = validateBlueprint(invalidBlueprint);

  if (!result.success) {
    // Group errors by field
    const errorsByField = new Map<string, string[]>();

    result.errors?.forEach((error) => {
      const field = error.path.join(".");
      if (!errorsByField.has(field)) {
        errorsByField.set(field, []);
      }
      errorsByField.get(field)!.push(error.message);
    });

    // Display errors grouped by field
    console.error("Validation errors:");
    errorsByField.forEach((messages, field) => {
      console.error(`\n${field}:`);
      messages.forEach((msg) => console.error(`  - ${msg}`));
    });
  }
}

// Example 5: Validate user input from API
export async function exampleAPIValidation(userInput: unknown) {
  // Validate unknown input from API
  const result = validateBlueprint(userInput);

  if (!result.success) {
    // Return 400 Bad Request with validation errors
    return {
      status: 400,
      body: {
        error: "Invalid Blueprint",
        details: result.errors,
      },
    };
  }

  // Process valid Blueprint
  return {
    status: 200,
    body: {
      message: "Blueprint accepted",
      blueprint: result.data,
    },
  };
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("=== Example 1: Validate Blueprint ===");
  exampleValidateBlueprint();

  console.log("\n=== Example 2: Validate Slide ===");
  exampleValidateSlide();

  console.log("\n=== Example 3: Validate Content Block ===");
  exampleValidateContentBlock();

  console.log("\n=== Example 4: Error Handling ===");
  exampleErrorHandling();
}
