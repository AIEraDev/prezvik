/**
 * Test Fixtures for Pipeline Testing
 *
 * Provides sample data for testing:
 * - Sample prompts for various presentation types
 * - Sample Blueprints (minimal, complex, invalid)
 * - Expected layout trees for validation
 * - Expected PPTX output characteristics
 */

import type { PrezVikBlueprint } from "@prezvik/schema";
import type { LayoutTree, ContainerNode, TextNode } from "@prezvik/layout";

/**
 * Sample Prompts for Various Presentation Types
 */
export const SAMPLE_PROMPTS = {
  // Pitch Deck Prompts
  pitch: ["Create a 5-slide pitch deck for our AI startup", "Make a presentation to persuade investors about our SaaS product", "Generate a startup pitch for a fintech company", "Build a pitch deck for a healthcare technology startup with 7 slides"],

  // Report Prompts
  report: ["Create a report on Q4 sales performance", "Generate a quarterly business review presentation", "Make a summary of annual results with 6 slides", "Build a financial report presentation for stakeholders"],

  // Training Prompts
  training: ["Create a training deck on cybersecurity best practices", "Make a course presentation about Python programming", "Generate a learning presentation on project management", "Build an employee onboarding presentation with 8 slides"],

  // Educational Prompts
  educational: ["Create a 3-slide presentation about AI in education", "Make a presentation to teach students about climate change", "Generate an educational deck on world history", "Build a lecture presentation on quantum physics"],

  // Generic Prompts
  generic: ["Create a presentation about machine learning", "Make a 4-slide deck about our company vision", "Generate a presentation on digital transformation", "Build a presentation about remote work best practices"],

  // Edge Cases
  edgeCases: [
    "", // Empty prompt
    "Create a presentation", // Minimal prompt
    "Make a 1-slide presentation", // Single slide
    "Generate a 20-slide comprehensive presentation on artificial intelligence and its impact on society", // Long prompt
  ],
};

/**
 * Sample Blueprints
 */

// Minimal Valid Blueprint (1 slide, basic content)
export const MINIMAL_BLUEPRINT: PrezVikBlueprint = {
  version: "2.0",
  meta: {
    title: "Minimal Test Presentation",
    language: "en",
    goal: "inform",
    tone: "modern",
  },
  slides: [
    {
      id: "slide-1",
      type: "hero",
      intent: "Introduce topic",
      layout: "center_focus",
      content: [
        {
          type: "heading",
          value: "Test Title",
          level: "h1",
          emphasis: "high",
        },
      ],
    },
  ],
};

// Complex Blueprint (multiple slides, all content types)
export const COMPLEX_BLUEPRINT: PrezVikBlueprint = {
  version: "2.0",
  meta: {
    title: "Complex Test Presentation",
    subtitle: "A comprehensive test",
    author: "Test Author",
    audience: "Developers",
    goal: "educate",
    tone: "formal",
    language: "en",
  },
  theme: {
    name: "executive",
    primaryColor: "#2563EB",
    fontPairing: "Inter",
  },
  slides: [
    {
      id: "slide-1",
      type: "hero",
      intent: "Title slide",
      layout: "center_focus",
      content: [
        {
          type: "heading",
          value: "Complex Presentation",
          level: "h1",
          emphasis: "high",
        },
        {
          type: "text",
          value: "A comprehensive test of all features",
          emphasis: "medium",
        },
      ],
    },
    {
      id: "slide-2",
      type: "section",
      intent: "Section divider",
      layout: "center_focus",
      content: [
        {
          type: "heading",
          value: "Section 1: Content Types",
          level: "h1",
          emphasis: "high",
        },
      ],
    },
    {
      id: "slide-3",
      type: "content",
      intent: "Show bullet points",
      layout: "two_column",
      content: [
        {
          type: "heading",
          value: "Key Points",
          level: "h2",
          emphasis: "high",
        },
        {
          type: "bullets",
          items: [{ text: "First point", icon: "✓", highlight: true }, { text: "Second point", icon: "→" }, { text: "Third point" }, { text: "Fourth point", highlight: true }],
        },
      ],
    },
    {
      id: "slide-4",
      type: "quote",
      intent: "Show testimonial",
      layout: "center_focus",
      content: [
        {
          type: "quote",
          text: "This is an excellent product that has transformed our workflow",
          author: "Jane Smith",
          role: "CTO, TechCorp",
        },
      ],
    },
    {
      id: "slide-5",
      type: "data",
      intent: "Show statistics",
      layout: "grid_2x2",
      content: [
        {
          type: "stat",
          value: 10000,
          label: "Active Users",
          prefix: "+",
          visualWeight: "hero",
        },
        {
          type: "stat",
          value: "99.9%",
          label: "Uptime",
          suffix: " SLA",
          visualWeight: "emphasis",
        },
        {
          type: "stat",
          value: 50,
          label: "Countries",
          visualWeight: "normal",
        },
        {
          type: "stat",
          value: "24/7",
          label: "Support",
          visualWeight: "normal",
        },
      ],
    },
    {
      id: "slide-6",
      type: "content",
      intent: "Show code example",
      layout: "center_focus",
      content: [
        {
          type: "heading",
          value: "Code Example",
          level: "h2",
          emphasis: "high",
        },
        {
          type: "code",
          code: 'function hello() {\n  console.log("Hello, World!");\n}',
          language: "javascript",
        },
      ],
    },
    {
      id: "slide-7",
      type: "closing",
      intent: "Call to action",
      layout: "center_focus",
      content: [
        {
          type: "heading",
          value: "Thank You",
          level: "h1",
          emphasis: "high",
        },
        {
          type: "text",
          value: "Questions?",
          emphasis: "medium",
        },
      ],
    },
  ],
};

// Invalid Blueprints for testing error handling
export const INVALID_BLUEPRINTS = {
  missingVersion: {
    meta: {
      title: "Test",
      language: "en",
      goal: "inform",
      tone: "modern",
    },
    slides: [],
  },

  wrongVersion: {
    version: "1.0",
    meta: {
      title: "Test",
      language: "en",
      goal: "inform",
      tone: "modern",
    },
    slides: [],
  },

  missingMeta: {
    version: "2.0",
    slides: [],
  },

  missingSlides: {
    version: "2.0",
    meta: {
      title: "Test",
      language: "en",
      goal: "inform",
      tone: "modern",
    },
  },

  invalidGoal: {
    version: "2.0",
    meta: {
      title: "Test",
      language: "en",
      goal: "invalid_goal",
      tone: "modern",
    },
    slides: [],
  },

  invalidTone: {
    version: "2.0",
    meta: {
      title: "Test",
      language: "en",
      goal: "inform",
      tone: "invalid_tone",
    },
    slides: [],
  },

  invalidSlideType: {
    version: "2.0",
    meta: {
      title: "Test",
      language: "en",
      goal: "inform",
      tone: "modern",
    },
    slides: [
      {
        id: "s1",
        type: "invalid_type",
        intent: "Test",
        layout: "center_focus",
        content: [],
      },
    ],
  },

  invalidLayoutType: {
    version: "2.0",
    meta: {
      title: "Test",
      language: "en",
      goal: "inform",
      tone: "modern",
    },
    slides: [
      {
        id: "s1",
        type: "hero",
        intent: "Test",
        layout: "invalid_layout",
        content: [],
      },
    ],
  },

  invalidContentBlock: {
    version: "2.0",
    meta: {
      title: "Test",
      language: "en",
      goal: "inform",
      tone: "modern",
    },
    slides: [
      {
        id: "s1",
        type: "hero",
        intent: "Test",
        layout: "center_focus",
        content: [
          {
            type: "invalid_type",
            value: "Test",
          },
        ],
      },
    ],
  },

  missingRequiredFields: {
    version: "2.0",
    meta: {
      title: "Test",
      language: "en",
      goal: "inform",
      tone: "modern",
    },
    slides: [
      {
        id: "s1",
        type: "hero",
        intent: "Test",
        layout: "center_focus",
        content: [
          {
            type: "heading",
            // Missing 'value' field
            level: "h1",
          },
        ],
      },
    ],
  },
};

/**
 * Expected Layout Trees for Validation
 */

// Expected layout tree for minimal Blueprint
export const EXPECTED_MINIMAL_LAYOUT: LayoutTree = {
  root: {
    id: "slide-1-root",
    type: "container",
    layout: {
      type: "flow",
      direction: "vertical",
      gap: 0,
    },
    children: [
      {
        id: "slide-1-heading-0",
        type: "text",
        content: "Test Title",
        text: {
          fontSize: 48,
          fontRole: "title",
        },
      } as TextNode,
    ],
  } as ContainerNode,
};

// Expected layout tree structure characteristics
export const EXPECTED_LAYOUT_CHARACTERISTICS = {
  // All layout trees should have these properties
  required: {
    hasRoot: true,
    rootIsContainer: true,
    rootHasId: true,
    rootHasType: true,
    rootHasLayout: true,
  },

  // Layout modes that should be present
  layoutModes: ["flow", "grid", "absolute"],

  // Node types that should be present
  nodeTypes: ["container", "text"],

  // Layout properties that should be set
  layoutProperties: {
    flow: ["direction", "gap"],
    grid: ["columns", "columnGap", "rowGap"],
    absolute: [],
  },
};

/**
 * Expected PPTX Output Characteristics
 */
export const EXPECTED_PPTX_CHARACTERISTICS = {
  // File properties
  file: {
    minSize: 10000, // At least 10KB
    maxSize: 10000000, // At most 10MB
    extension: ".pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zipSignature: "504b0304", // ZIP file signature (PPTX is a ZIP archive)
  },

  // Slide properties
  slides: {
    aspectRatio: "16:10", // Standard widescreen
    width: 10, // inches
    height: 5.625, // inches (16:9 ratio)
  },

  // Coordinate system
  coordinates: {
    unit: "EMU", // English Metric Units
    emuPerInch: 914400,
    percentageRange: [0, 100],
  },

  // Text properties
  text: {
    minFontSize: 8,
    maxFontSize: 96,
    defaultFontFamily: "Calibri",
    supportedAlignments: ["left", "center", "right"],
  },

  // Theme properties
  themes: {
    executive: {
      background: "#FFFFFF",
      primaryColor: "#1E40AF",
      fontFamily: "Calibri",
    },
    minimal: {
      background: "#FAFAFA",
      primaryColor: "#000000",
      fontFamily: "Inter",
    },
    modern: {
      background: "#FFFFFF",
      primaryColor: "#6366F1",
      fontFamily: "Inter",
    },
  },
};

/**
 * Test Scenarios for Integration Testing
 */
export const TEST_SCENARIOS = [
  {
    name: "Simple 3-slide presentation",
    prompt: "Create a 3-slide presentation about AI",
    expectedSlideCount: 3,
    expectedTheme: "executive",
    expectedDuration: 5000, // 5 seconds
  },
  {
    name: "Complex pitch deck",
    prompt: "Create a 5-slide pitch deck for our AI startup",
    expectedSlideCount: 5,
    expectedTheme: "executive",
    expectedDuration: 10000, // 10 seconds
  },
  {
    name: "Report with data",
    prompt: "Create a 4-slide report on Q4 sales performance",
    expectedSlideCount: 4,
    expectedTheme: "executive",
    expectedDuration: 8000, // 8 seconds
  },
  {
    name: "Training deck",
    prompt: "Create a 5-slide training deck on cybersecurity",
    expectedSlideCount: 5,
    expectedTheme: "executive",
    expectedDuration: 10000, // 10 seconds
  },
  {
    name: "Single slide",
    prompt: "Create a 1-slide presentation",
    expectedSlideCount: 1,
    expectedTheme: "executive",
    expectedDuration: 3000, // 3 seconds
  },
  {
    name: "Large presentation",
    prompt: "Create a 10-slide comprehensive presentation",
    expectedSlideCount: 4, // Generic template has 4 slides
    expectedTheme: "executive",
    expectedDuration: 15000, // 15 seconds
  },
];

/**
 * Performance Benchmarks
 */
export const PERFORMANCE_BENCHMARKS = {
  // Stage-specific benchmarks (in milliseconds)
  stages: {
    blueprintGeneration: {
      mockMode: 100, // Should be very fast
      aiMode: 10000, // Up to 10 seconds with AI
    },
    validation: 100,
    layoutGeneration: 500,
    positioning: 500,
    theming: 100,
    rendering: 5000,
  },

  // Total pipeline benchmarks
  pipeline: {
    mockMode: {
      threeSlides: 5000, // 5 seconds
      fiveSlides: 10000, // 10 seconds
      tenSlides: 15000, // 15 seconds
    },
    aiMode: {
      threeSlides: 15000, // 15 seconds
      fiveSlides: 20000, // 20 seconds
      tenSlides: 30000, // 30 seconds
    },
  },
};

/**
 * Error Test Cases
 */
export const ERROR_TEST_CASES = {
  blueprintGeneration: [
    {
      name: "AI API failure",
      scenario: "AI service returns error",
      expectedError: "BlueprintGenerationError",
      expectedMessage: /API error|failed to generate/i,
    },
    {
      name: "Invalid JSON response",
      scenario: "AI returns malformed JSON",
      expectedError: "BlueprintGenerationError",
      expectedMessage: /invalid JSON|parse error/i,
    },
  ],

  validation: [
    {
      name: "Missing version",
      blueprint: INVALID_BLUEPRINTS.missingVersion,
      expectedError: "ValidationError",
      expectedMessage: /version.*required/i,
    },
    {
      name: "Wrong version",
      blueprint: INVALID_BLUEPRINTS.wrongVersion,
      expectedError: "ValidationError",
      expectedMessage: /version.*2\.0/i,
    },
    {
      name: "Invalid goal",
      blueprint: INVALID_BLUEPRINTS.invalidGoal,
      expectedError: "ValidationError",
      expectedMessage: /goal.*invalid/i,
    },
  ],

  layout: [
    {
      name: "Unsupported content block",
      scenario: "Content block type not supported",
      expectedError: "LayoutError",
      expectedMessage: /unsupported.*content block/i,
    },
  ],

  positioning: [
    {
      name: "Invalid layout mode",
      scenario: "Layout mode not recognized",
      expectedError: "PositioningError",
      expectedMessage: /invalid.*layout mode/i,
    },
  ],

  theming: [
    {
      name: "Missing theme",
      scenario: "Theme name not found",
      expectedError: "ThemeError",
      expectedMessage: /theme.*not found/i,
    },
  ],

  rendering: [
    {
      name: "Missing _rect property",
      scenario: "Node missing positioning data",
      expectedError: "RenderError",
      expectedMessage: /_rect.*required|missing.*coordinates/i,
    },
    {
      name: "Invalid output path",
      scenario: "Output directory doesn't exist",
      expectedError: "RenderError",
      expectedMessage: /output.*path|directory.*not found/i,
    },
  ],
};

/**
 * Utility function to create a test Blueprint with specific characteristics
 */
export function createTestBlueprint(options: { slideCount?: number; slideTypes?: string[]; layoutTypes?: string[]; contentTypes?: string[]; theme?: string }): PrezVikBlueprint {
  const { slideCount = 3, slideTypes = ["hero", "content", "closing"], layoutTypes = ["center_focus"], contentTypes = ["heading", "text"], theme = "executive" } = options;

  const slides = Array.from({ length: slideCount }, (_, i) => ({
    id: `slide-${i + 1}`,
    type: (slideTypes[i % slideTypes.length] || "content") as any,
    intent: `Test slide ${i + 1}`,
    layout: (layoutTypes[i % layoutTypes.length] || "center_focus") as any,
    content: [
      {
        type: contentTypes[0] as any,
        value: `Slide ${i + 1} Content`,
        level: "h1" as any,
        emphasis: "high" as any,
      },
    ],
  }));

  return {
    version: "2.0",
    meta: {
      title: "Test Presentation",
      language: "en",
      goal: "inform",
      tone: "modern",
    },
    theme: {
      name: theme,
    },
    slides,
  };
}

/**
 * Utility function to validate layout tree structure
 */
export function validateLayoutTreeStructure(tree: LayoutTree): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check root exists
  if (!tree.root) {
    errors.push("Missing root node");
    return { valid: false, errors };
  }

  // Check root is container
  if (tree.root.type !== "container") {
    errors.push("Root node must be a container");
  }

  // Check root has ID
  if (!tree.root.id) {
    errors.push("Root node missing ID");
  }

  // Check root has layout
  const container = tree.root as ContainerNode;
  if (!container.layout) {
    errors.push("Root container missing layout configuration");
  }

  // Recursively check children
  const checkNode = (node: any, path: string) => {
    if (!node.id) {
      errors.push(`Node at ${path} missing ID`);
    }

    if (!node.type) {
      errors.push(`Node at ${path} missing type`);
    }

    if (node.type === "container" && node.children) {
      node.children.forEach((child: any, index: number) => {
        checkNode(child, `${path}/child-${index}`);
      });
    }
  };

  if (container.children) {
    container.children.forEach((child, index) => {
      checkNode(child, `root/child-${index}`);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Utility function to validate positioned layout tree
 */
export function validatePositionedLayoutTree(tree: LayoutTree): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // First check basic structure
  const structureValidation = validateLayoutTreeStructure(tree);
  if (!structureValidation.valid) {
    return structureValidation;
  }

  // Check all nodes have _rect
  const checkRect = (node: any, path: string) => {
    if (!node._rect) {
      errors.push(`Node at ${path} missing _rect property`);
    } else {
      // Validate _rect properties
      if (typeof node._rect.x !== "number") {
        errors.push(`Node at ${path} _rect.x is not a number`);
      }
      if (typeof node._rect.y !== "number") {
        errors.push(`Node at ${path} _rect.y is not a number`);
      }
      if (typeof node._rect.width !== "number") {
        errors.push(`Node at ${path} _rect.width is not a number`);
      }
      if (typeof node._rect.height !== "number") {
        errors.push(`Node at ${path} _rect.height is not a number`);
      }

      // Validate coordinate ranges (0-100 for percentage-based)
      if (node._rect.x < 0 || node._rect.x > 100) {
        errors.push(`Node at ${path} _rect.x out of range (0-100): ${node._rect.x}`);
      }
      if (node._rect.y < 0 || node._rect.y > 100) {
        errors.push(`Node at ${path} _rect.y out of range (0-100): ${node._rect.y}`);
      }
      if (node._rect.width <= 0 || node._rect.width > 100) {
        errors.push(`Node at ${path} _rect.width out of range (0-100): ${node._rect.width}`);
      }
      if (node._rect.height <= 0 || node._rect.height > 100) {
        errors.push(`Node at ${path} _rect.height out of range (0-100): ${node._rect.height}`);
      }
    }

    if (node.type === "container" && node.children) {
      node.children.forEach((child: any, index: number) => {
        checkRect(child, `${path}/child-${index}`);
      });
    }
  };

  checkRect(tree.root, "root");

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Utility function to validate themed layout tree
 */
export function validateThemedLayoutTree(tree: LayoutTree): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // First check positioning
  const positionValidation = validatePositionedLayoutTree(tree);
  if (!positionValidation.valid) {
    return positionValidation;
  }

  // Check background color
  if (!tree.background) {
    errors.push("Missing background color");
  }

  // Check all text nodes have theme properties
  const checkTheme = (node: any, path: string) => {
    if (node.type === "text") {
      if (!node.text.fontFamily) {
        errors.push(`Text node at ${path} missing fontFamily`);
      }
      if (!node.text.color) {
        errors.push(`Text node at ${path} missing color`);
      }
    }

    if (node.type === "container" && node.children) {
      node.children.forEach((child: any, index: number) => {
        checkTheme(child, `${path}/child-${index}`);
      });
    }
  };

  checkTheme(tree.root, "root");

  return {
    valid: errors.length === 0,
    errors,
  };
}
