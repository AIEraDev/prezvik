# Design Document: Comprehensive System Testing

## Overview

This design establishes a comprehensive testing infrastructure for the Prezvik presentation generation system. The system is a TypeScript monorepo using pnpm workspaces with Turborepo for build orchestration. Currently, only two test files exist (CLI magic command and PPTX renderer). This design provides a complete testing strategy covering unit tests, integration tests, and end-to-end tests across all applications and packages.

### Current State

- **Monorepo Structure**: 4 applications (cli, api, mcp-server, web) and 14 packages
- **Test Runner**: Vitest configured in individual packages
- **Existing Tests**: 2 test files with ~50 test cases total
- **Coverage**: <5% overall code coverage
- **Mock Support**: Basic mock mode exists for AI providers

### Target State

- **Comprehensive Coverage**: 80%+ code coverage across all packages
- **Test Organization**: Co-located unit tests, dedicated integration test directories, workspace-level E2E tests
- **Mock Infrastructure**: Complete mock implementations for AI providers, file system, external services
- **CI/CD Integration**: Automated test execution with coverage reporting
- **Performance Benchmarks**: Performance tests for critical paths

### Key Design Decisions

1. **Vitest as Test Runner**: Already in use, provides excellent TypeScript support, fast execution, and built-in coverage
2. **Co-located Unit Tests**: Place `*.test.ts` files next to source files for easy discovery and maintenance
3. **Layered Test Strategy**: Unit → Integration → E2E with clear boundaries
4. **Mock-First Development**: All tests run without external dependencies by default
5. **Workspace-Level Configuration**: Shared Vitest config with package-specific overrides

## Architecture

### Test Infrastructure Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     E2E Tests (Workspace)                    │
│  Full user workflows, CLI commands, API requests, MCP tools  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Integration Tests (Per Package)                 │
│   Component interactions, pipeline stages, layer boundaries  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Unit Tests (Co-located)                       │
│    Individual functions, classes, utilities, validators      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Mock Infrastructure                       │
│   AI providers, file system, external APIs, test fixtures    │
└─────────────────────────────────────────────────────────────┘
```

### Test Configuration Hierarchy

1. **Workspace Root**: `vitest.workspace.ts` - Defines all test projects
2. **Shared Config**: `vitest.config.shared.ts` - Common settings (coverage, reporters, globals)
3. **Package Configs**: Individual `vitest.config.ts` - Package-specific overrides
4. **Test Setup**: `test/setup.ts` - Global test setup, mocks, utilities

### Directory Structure

```
prezvik/
├── vitest.workspace.ts              # Workspace-level test configuration
├── vitest.config.shared.ts          # Shared configuration
├── test/                            # Workspace-level test infrastructure
│   ├── setup.ts                     # Global test setup
│   ├── fixtures/                    # Shared test data
│   │   ├── blueprints/              # Sample blueprint JSON files
│   │   ├── decks/                   # Sample deck structures
│   │   └── themes/                  # Sample theme definitions
│   ├── mocks/                       # Shared mock implementations
│   │   ├── ai-providers.ts          # Mock AI provider responses
│   │   ├── file-system.ts           # Mock fs operations
│   │   └── external-apis.ts         # Mock external service calls
│   ├── factories/                   # Test data factories
│   │   ├── blueprint-factory.ts     # Generate test blueprints
│   │   ├── slide-factory.ts         # Generate test slides
│   │   └── layout-factory.ts        # Generate test layouts
│   ├── helpers/                     # Test utilities
│   │   ├── assertions.ts            # Custom assertions
│   │   ├── matchers.ts              # Custom Vitest matchers
│   │   └── test-utils.ts            # Common test utilities
│   └── e2e/                         # End-to-end tests
│       ├── cli.e2e.test.ts          # CLI workflow tests
│       ├── api.e2e.test.ts          # API workflow tests
│       ├── mcp.e2e.test.ts          # MCP server tests
│       └── pipeline.e2e.test.ts     # Full pipeline tests
├── apps/
│   ├── cli/
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── magic.ts
│   │   │   │   ├── magic.test.ts    # Unit tests
│   │   │   │   ├── ai.ts
│   │   │   │   └── ai.test.ts
│   │   │   └── utils/
│   │   │       ├── logger.ts
│   │   │       └── logger.test.ts
│   │   ├── __tests__/               # Integration tests
│   │   │   ├── command-integration.test.ts
│   │   │   └── cli-options.test.ts
│   │   └── vitest.config.ts
│   ├── api/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── generate.ts
│   │   │   │   ├── generate.test.ts
│   │   │   │   ├── validate.ts
│   │   │   │   └── validate.test.ts
│   │   │   └── index.ts
│   │   ├── __tests__/
│   │   │   ├── api-integration.test.ts
│   │   │   └── middleware.test.ts
│   │   └── vitest.config.ts
│   ├── mcp-server/
│   │   ├── src/
│   │   │   ├── tools/
│   │   │   │   ├── generate.ts
│   │   │   │   ├── generate.test.ts
│   │   │   │   ├── validate.ts
│   │   │   │   └── validate.test.ts
│   │   │   └── adapters/
│   │   │       ├── prezvik.ts
│   │   │       └── prezvik.test.ts
│   │   ├── __tests__/
│   │   │   └── mcp-integration.test.ts
│   │   └── vitest.config.ts
│   └── web/
│       ├── app/
│       │   ├── api/
│       │   │   └── generate/
│       │   │       ├── route.ts
│       │   │       └── route.test.ts
│       │   └── builder/
│       │       └── page.test.tsx
│       ├── components/
│       │   ├── preview-modal.tsx
│       │   └── preview-modal.test.tsx
│       ├── __tests__/
│       │   └── web-integration.test.tsx
│       └── vitest.config.ts
└── packages/
    ├── core/
    │   ├── src/
    │   │   ├── deck.ts
    │   │   ├── deck.test.ts
    │   │   ├── config.ts
    │   │   ├── config.test.ts
    │   │   └── pipeline/
    │   │       ├── orchestrator.ts
    │   │       └── orchestrator.test.ts
    │   ├── __tests__/
    │   │   ├── pipeline-integration.test.ts
    │   │   └── layered-mode.test.ts
    │   └── vitest.config.ts
    ├── schema/
    │   ├── src/
    │   │   ├── blueprint.ts
    │   │   ├── blueprint.test.ts
    │   │   ├── validators.ts
    │   │   └── validators.test.ts
    │   └── vitest.config.ts
    ├── layout/
    │   ├── src/
    │   │   ├── resolver.ts
    │   │   ├── resolver.test.ts
    │   │   ├── calculator.ts
    │   │   └── calculator.test.ts
    │   ├── __tests__/
    │   │   └── layout-integration.test.ts
    │   └── vitest.config.ts
    ├── renderer-pptx/
    │   ├── src/
    │   │   ├── renderer/
    │   │   │   ├── pptx-renderer.ts
    │   │   │   └── pptx-renderer.test.ts  # Existing
    │   │   └── utils/
    │   │       ├── units.ts
    │   │       └── units.test.ts
    │   └── vitest.config.ts
    ├── ai/
    │   ├── src/
    │   │   ├── prezvik-ai.ts
    │   │   ├── prezvik-ai.test.ts
    │   │   └── providers/
    │   │       ├── openai.ts
    │   │       ├── openai.test.ts
    │   │       ├── anthropic.ts
    │   │       └── anthropic.test.ts
    │   ├── __tests__/
    │   │   └── provider-integration.test.ts
    │   └── vitest.config.ts
    └── [other packages follow same pattern]
```

### Test Execution Flow

1. **Local Development**: `pnpm test` runs all tests in affected packages
2. **Package-Specific**: `pnpm --filter @prezvik/core test` runs tests for one package
3. **Watch Mode**: `pnpm test:watch` runs tests in watch mode
4. **Coverage**: `pnpm test:coverage` generates coverage reports
5. **CI/CD**: Turbo cache ensures only changed packages are tested

## Components and Interfaces

### 1. Vitest Configuration

#### Workspace Configuration (`vitest.workspace.ts`)

```typescript
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  // Applications
  "apps/cli",
  "apps/api",
  "apps/mcp-server",
  "apps/web",

  // Packages
  "packages/core",
  "packages/schema",
  "packages/layout",
  "packages/renderer-pptx",
  "packages/renderer-gslides",
  "packages/ai",
  "packages/pipeline",
  "packages/theme-layer",
  "packages/visual-layer",
  "packages/export-layer",
  "packages/design",
  "packages/logger",
  "packages/utils",
  "packages/prompt",

  // E2E tests
  {
    test: {
      name: "e2e",
      include: ["test/e2e/**/*.e2e.test.ts"],
      environment: "node",
      testTimeout: 30000,
    },
  },
]);
```

#### Shared Configuration (`vitest.config.shared.ts`)

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export const sharedConfig = defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: ["node_modules/", "dist/", "**/*.test.ts", "**/*.test.tsx", "**/__tests__/**", "**/test/**", "**/*.config.ts", "**/*.d.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    reporters: ["verbose", "json", "html"],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@test": path.resolve(__dirname, "./test"),
      "@fixtures": path.resolve(__dirname, "./test/fixtures"),
      "@mocks": path.resolve(__dirname, "./test/mocks"),
    },
  },
});
```

#### Package-Specific Configuration Example (`packages/core/vitest.config.ts`)

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import { sharedConfig } from "../../vitest.config.shared";

export default mergeConfig(
  sharedConfig,
  defineConfig({
    test: {
      name: "@prezvik/core",
      include: ["src/**/*.test.ts", "__tests__/**/*.test.ts"],
      coverage: {
        include: ["src/**/*.ts"],
        exclude: ["src/**/*.test.ts", "src/**/*.d.ts"],
      },
    },
  }),
);
```

### 2. Test Setup and Utilities

#### Global Test Setup (`test/setup.ts`)

```typescript
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { mockFileSystem } from "./mocks/file-system";
import { mockAIProviders } from "./mocks/ai-providers";
import { setupTestEnvironment, cleanupTestEnvironment } from "./helpers/test-utils";

// Global setup
beforeAll(async () => {
  await setupTestEnvironment();
  mockFileSystem.setup();
  mockAIProviders.setup();
});

// Global cleanup
afterAll(async () => {
  await cleanupTestEnvironment();
  mockFileSystem.cleanup();
  mockAIProviders.cleanup();
});

// Per-test cleanup
afterEach(() => {
  mockFileSystem.reset();
  mockAIProviders.reset();
});

// Extend Vitest matchers
expect.extend({
  toBeValidBlueprint(received) {
    // Custom matcher implementation
    const { isValid, errors } = validateBlueprint(received);
    return {
      pass: isValid,
      message: () => `Expected valid blueprint, got errors: ${errors.join(", ")}`,
    };
  },
  toHaveValidPPTXStructure(received) {
    // Custom matcher for PPTX validation
    const isValid = checkPPTXStructure(received);
    return {
      pass: isValid,
      message: () => "Expected valid PPTX structure",
    };
  },
});

// Global test utilities
global.testUtils = {
  createTempDir: () => {
    /* ... */
  },
  cleanupTempDir: () => {
    /* ... */
  },
  waitForFile: async (path: string) => {
    /* ... */
  },
};
```

### 3. Mock Infrastructure

#### AI Provider Mocks (`test/mocks/ai-providers.ts`)

```typescript
import { vi } from "vitest";

export const mockAIProviders = {
  setup() {
    // Mock OpenAI
    vi.mock("@ai-sdk/openai", () => ({
      openai: () => ({
        chat: vi.fn().mockResolvedValue({
          text: "Mock AI response",
          usage: { totalTokens: 100 },
        }),
      }),
    }));

    // Mock Anthropic
    vi.mock("@ai-sdk/anthropic", () => ({
      anthropic: () => ({
        chat: vi.fn().mockResolvedValue({
          text: "Mock Claude response",
          usage: { totalTokens: 120 },
        }),
      }),
    }));

    // Mock Groq
    vi.mock("@ai-sdk/groq", () => ({
      groq: () => ({
        chat: vi.fn().mockResolvedValue({
          text: "Mock Groq response",
          usage: { totalTokens: 90 },
        }),
      }),
    }));
  },

  reset() {
    vi.clearAllMocks();
  },

  cleanup() {
    vi.restoreAllMocks();
  },

  // Helper to set specific responses
  setResponse(provider: string, response: any) {
    // Implementation
  },

  // Helper to simulate errors
  simulateError(provider: string, error: Error) {
    // Implementation
  },
};

// Mock responses for different scenarios
export const mockAIResponses = {
  blueprintGeneration: {
    slides: [
      {
        id: "slide-1",
        type: "title",
        content: { title: "Mock Title", subtitle: "Mock Subtitle" },
      },
      {
        id: "slide-2",
        type: "content",
        content: { title: "Content", body: "Mock body text" },
      },
    ],
  },
  summarization: "This is a mock summary of the content.",
  comparison: {
    openai: "OpenAI response",
    anthropic: "Anthropic response",
    groq: "Groq response",
  },
};
```

#### File System Mocks (`test/mocks/file-system.ts`)

```typescript
import { vi } from "vitest";
import { vol } from "memfs";

export const mockFileSystem = {
  setup() {
    // Use memfs for in-memory file system
    vi.mock("fs", () => vol);
    vi.mock("fs/promises", () => vol.promises);
  },

  reset() {
    vol.reset();
  },

  cleanup() {
    vol.reset();
  },

  // Helper to create test files
  createFile(path: string, content: string) {
    vol.writeFileSync(path, content);
  },

  // Helper to create test directories
  createDir(path: string) {
    vol.mkdirSync(path, { recursive: true });
  },

  // Helper to verify file exists
  fileExists(path: string): boolean {
    return vol.existsSync(path);
  },

  // Helper to read file content
  readFile(path: string): string {
    return vol.readFileSync(path, "utf-8");
  },
};
```

### 4. Test Data Factories

#### Blueprint Factory (`test/factories/blueprint-factory.ts`)

```typescript
import type { PrezVikBlueprint, Slide } from "@prezvik/schema";

export class BlueprintFactory {
  static create(overrides?: Partial<PrezVikBlueprint>): PrezVikBlueprint {
    return {
      version: "1.0",
      metadata: {
        title: "Test Presentation",
        author: "Test Author",
        createdAt: new Date().toISOString(),
      },
      theme: "minimal",
      slides: [this.createTitleSlide(), this.createContentSlide()],
      ...overrides,
    };
  }

  static createTitleSlide(overrides?: Partial<Slide>): Slide {
    return {
      id: `slide-${Math.random().toString(36).substr(2, 9)}`,
      type: "title",
      content: {
        title: "Test Title",
        subtitle: "Test Subtitle",
      },
      ...overrides,
    };
  }

  static createContentSlide(overrides?: Partial<Slide>): Slide {
    return {
      id: `slide-${Math.random().toString(36).substr(2, 9)}`,
      type: "content",
      content: {
        title: "Content Title",
        body: "Content body text",
      },
      ...overrides,
    };
  }

  static createBulletSlide(overrides?: Partial<Slide>): Slide {
    return {
      id: `slide-${Math.random().toString(36).substr(2, 9)}`,
      type: "bullets",
      content: {
        title: "Bullet Points",
        bullets: ["Point 1", "Point 2", "Point 3"],
      },
      ...overrides,
    };
  }

  static createWithSlideCount(count: number): PrezVikBlueprint {
    const slides = Array.from({ length: count }, (_, i) => this.createContentSlide({ id: `slide-${i}` }));
    return this.create({ slides });
  }

  static createInvalid(): any {
    return {
      // Missing required fields
      slides: [],
    };
  }
}
```

#### Layout Factory (`test/factories/layout-factory.ts`)

```typescript
import type { LayoutTree, TextNode, ContainerNode } from "@prezvik/schema";

export class LayoutFactory {
  static createTextNode(overrides?: Partial<TextNode>): TextNode {
    return {
      id: `text-${Math.random().toString(36).substr(2, 9)}`,
      type: "text",
      content: "Test text",
      text: {
        fontSize: 24,
        fontFamily: "Arial",
        color: "000000",
      },
      _rect: {
        x: 10,
        y: 10,
        width: 80,
        height: 20,
      },
      ...overrides,
    };
  }

  static createContainer(children: any[] = []): ContainerNode {
    return {
      id: `container-${Math.random().toString(36).substr(2, 9)}`,
      type: "container",
      children,
      _rect: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    };
  }

  static createLayoutTree(overrides?: Partial<LayoutTree>): LayoutTree {
    return {
      root: this.createContainer([this.createTextNode()]),
      background: "FFFFFF",
      ...overrides,
    };
  }

  static createComplexLayout(): LayoutTree {
    return {
      root: this.createContainer([
        this.createTextNode({
          content: "Title",
          text: { fontSize: 36, fontWeight: "bold" },
          _rect: { x: 10, y: 10, width: 80, height: 15 },
        }),
        this.createTextNode({
          content: "Subtitle",
          text: { fontSize: 24 },
          _rect: { x: 10, y: 28, width: 80, height: 10 },
        }),
        this.createContainer([
          this.createTextNode({
            content: "Body text",
            _rect: { x: 15, y: 45, width: 70, height: 40 },
          }),
        ]),
      ]),
      background: "F5F5F5",
    };
  }
}
```

### 5. Test Helpers and Assertions

#### Custom Assertions (`test/helpers/assertions.ts`)

```typescript
import { expect } from "vitest";
import type { PrezVikBlueprint } from "@prezvik/schema";

export function assertValidBlueprint(blueprint: any): asserts blueprint is PrezVikBlueprint {
  expect(blueprint).toBeDefined();
  expect(blueprint.version).toBeDefined();
  expect(blueprint.slides).toBeInstanceOf(Array);
  expect(blueprint.slides.length).toBeGreaterThan(0);
}

export function assertValidPPTX(buffer: Buffer) {
  // Check ZIP signature (PPTX is a ZIP file)
  const header = buffer.toString("hex", 0, 4);
  expect(header).toBe("504b0304");
  expect(buffer.length).toBeGreaterThan(1000);
}

export function assertLayoutResolved(layoutTree: any) {
  function checkNode(node: any) {
    expect(node._rect).toBeDefined();
    expect(node._rect.x).toBeTypeOf("number");
    expect(node._rect.y).toBeTypeOf("number");
    expect(node._rect.width).toBeTypeOf("number");
    expect(node._rect.height).toBeTypeOf("number");

    if (node.children) {
      node.children.forEach(checkNode);
    }
  }

  checkNode(layoutTree.root);
}

export function assertErrorWithContext(error: any, expectedContext: string) {
  expect(error).toBeInstanceOf(Error);
  expect(error.message).toContain(expectedContext);
}
```

#### Test Utilities (`test/helpers/test-utils.ts`)

```typescript
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";

export async function setupTestEnvironment() {
  // Create test output directory
  const testDir = path.join(process.cwd(), "test-output");
  await fs.mkdir(testDir, { recursive: true });
}

export async function cleanupTestEnvironment() {
  // Clean up test output directory
  const testDir = path.join(process.cwd(), "test-output");
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore errors
  }
}

export async function createTempFile(content: string, extension: string = ".json"): Promise<string> {
  const tempPath = path.join(tmpdir(), `test-${Date.now()}${extension}`);
  await fs.writeFile(tempPath, content);
  return tempPath;
}

export async function waitForFile(filePath: string, timeout: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  return false;
}

export function createMockLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

export async function measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}
```

## Data Models

### Test Configuration Model

```typescript
interface TestConfig {
  // Test execution settings
  timeout: number;
  retries: number;
  parallel: boolean;

  // Coverage settings
  coverage: {
    enabled: boolean;
    threshold: number;
    include: string[];
    exclude: string[];
  };

  // Mock settings
  mocks: {
    aiProviders: boolean;
    fileSystem: boolean;
    externalAPIs: boolean;
  };

  // Environment settings
  env: {
    mockMode: boolean;
    testOutputDir: string;
    tempDir: string;
  };
}
```

### Test Fixture Model

```typescript
interface TestFixture {
  name: string;
  type: "blueprint" | "deck" | "theme" | "layout";
  data: any;
  metadata: {
    description: string;
    tags: string[];
    createdAt: string;
  };
}
```

### Test Result Model

```typescript
interface TestResult {
  suite: string;
  test: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: {
    message: string;
    stack: string;
  };
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}
```

### Mock Response Model

```typescript
interface MockAIResponse {
  provider: "openai" | "anthropic" | "groq" | "google";
  model: string;
  response: {
    text: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  latency: number;
}
```

## Error Handling

### Error Categories

1. **Test Setup Errors**: Failures during test environment initialization
2. **Mock Configuration Errors**: Issues with mock setup or configuration
3. **Assertion Errors**: Test assertions that fail
4. **Timeout Errors**: Tests that exceed time limits
5. **Coverage Errors**: Coverage thresholds not met
6. **Integration Errors**: Failures in component interactions

### Error Handling Strategy

#### Test Setup Error Handling

```typescript
// In test/setup.ts
try {
  await setupTestEnvironment();
} catch (error) {
  console.error("Failed to setup test environment:", error);
  process.exit(1);
}
```

#### Mock Error Handling

```typescript
// In test/mocks/ai-providers.ts
export function setupMockWithErrorHandling() {
  try {
    mockAIProviders.setup();
  } catch (error) {
    console.warn("Failed to setup AI provider mocks:", error);
    // Fall back to default mocks
    setupDefaultMocks();
  }
}
```

#### Graceful Test Failures

```typescript
// In individual tests
test("should handle invalid input gracefully", async () => {
  const invalidBlueprint = {
    /* invalid data */
  };

  await expect(async () => {
    await generateDeck(invalidBlueprint);
  }).rejects.toThrow("Invalid blueprint structure");
});
```

#### Cleanup on Failure

```typescript
// In test utilities
export async function withCleanup<T>(fn: () => Promise<T>, cleanup: () => Promise<void>): Promise<T> {
  try {
    return await fn();
  } finally {
    await cleanup();
  }
}
```

### Error Reporting

- **Console Output**: Detailed error messages with stack traces
- **JSON Reports**: Machine-readable error reports for CI/CD
- **HTML Reports**: Visual error reports with code context
- **Coverage Reports**: Highlight untested error paths

## Testing Strategy

### Test Pyramid

```
        ┌─────────────┐
        │   E2E (5%)  │  ~20 tests
        │  Full flows │
        └─────────────┘
       ┌───────────────┐
       │ Integration   │  ~100 tests
       │   (15%)       │
       │ Component     │
       │ interactions  │
       └───────────────┘
     ┌───────────────────┐
     │   Unit (80%)      │  ~400 tests
     │   Individual      │
     │   functions       │
     └───────────────────┘
```

### Unit Testing Strategy

**Scope**: Individual functions, classes, and utilities in isolation

**Approach**:

- Co-locate tests with source files (`file.ts` → `file.test.ts`)
- Mock all external dependencies
- Test pure functions with various inputs
- Test edge cases and error conditions
- Aim for 90%+ coverage of unit-testable code

**Example Test Structure**:

```typescript
// packages/schema/src/validators.test.ts
import { describe, it, expect } from "vitest";
import { validateBlueprint, validateSlide } from "./validators";
import { BlueprintFactory } from "@test/factories/blueprint-factory";

describe("Blueprint Validators", () => {
  describe("validateBlueprint", () => {
    it("should validate a valid blueprint", () => {
      const blueprint = BlueprintFactory.create();
      const result = validateBlueprint(blueprint);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject blueprint with missing version", () => {
      const blueprint = BlueprintFactory.create({ version: undefined });
      const result = validateBlueprint(blueprint);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("version is required");
    });

    it("should reject blueprint with empty slides array", () => {
      const blueprint = BlueprintFactory.create({ slides: [] });
      const result = validateBlueprint(blueprint);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("at least one slide is required");
    });

    it("should reject blueprint with invalid slide types", () => {
      const blueprint = BlueprintFactory.create({
        slides: [{ type: "invalid-type" }],
      });
      const result = validateBlueprint(blueprint);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/invalid slide type/i);
    });
  });

  describe("validateSlide", () => {
    it("should validate title slide", () => {
      const slide = BlueprintFactory.createTitleSlide();
      const result = validateSlide(slide);

      expect(result.isValid).toBe(true);
    });

    it("should validate content slide", () => {
      const slide = BlueprintFactory.createContentSlide();
      const result = validateSlide(slide);

      expect(result.isValid).toBe(true);
    });

    it("should reject slide with missing required fields", () => {
      const slide = { type: "title" }; // Missing content
      const result = validateSlide(slide);

      expect(result.isValid).toBe(false);
    });
  });
});
```

### Integration Testing Strategy

**Scope**: Interactions between components, layer boundaries, pipeline stages

**Approach**:

- Place tests in `__tests__/` directories within packages
- Test component interactions with minimal mocking
- Test data flow between layers
- Test error propagation across boundaries
- Verify contracts between components

**Example Test Structure**:

```typescript
// packages/core/__tests__/pipeline-integration.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { PipelineOrchestrator } from "../src/pipeline/orchestrator";
import { BlueprintFactory } from "@test/factories/blueprint-factory";
import { mockAIProviders } from "@test/mocks/ai-providers";

describe("Pipeline Integration", () => {
  let orchestrator: PipelineOrchestrator;

  beforeEach(() => {
    mockAIProviders.setup();
    orchestrator = new PipelineOrchestrator();
  });

  it("should execute all pipeline stages in order", async () => {
    const blueprint = BlueprintFactory.create();
    const stages: string[] = [];

    orchestrator.on("stage:start", (stage) => {
      stages.push(stage.name);
    });

    await orchestrator.execute(blueprint);

    expect(stages).toEqual(["Blueprint Generation", "Blueprint Validation", "Layout Generation", "Coordinate Positioning", "Theme Application", "PPTX Rendering"]);
  });

  it("should pass data correctly between stages", async () => {
    const blueprint = BlueprintFactory.create();
    let layoutData: any;
    let themedData: any;

    orchestrator.on("stage:complete", (stage, data) => {
      if (stage.name === "Layout Generation") {
        layoutData = data;
      }
      if (stage.name === "Theme Application") {
        themedData = data;
      }
    });

    await orchestrator.execute(blueprint);

    // Verify layout data has _rect properties
    expect(layoutData.root._rect).toBeDefined();

    // Verify themed data has color properties
    expect(themedData.root.text?.color).toBeDefined();
  });

  it("should handle stage failures gracefully", async () => {
    const invalidBlueprint = BlueprintFactory.createInvalid();

    await expect(async () => {
      await orchestrator.execute(invalidBlueprint);
    }).rejects.toThrow(/validation failed/i);
  });

  it("should report performance metrics", async () => {
    const blueprint = BlueprintFactory.create();
    const metrics = await orchestrator.execute(blueprint);

    expect(metrics.totalDuration).toBeGreaterThan(0);
    expect(metrics.stages).toHaveLength(6);
    metrics.stages.forEach((stage) => {
      expect(stage.duration).toBeGreaterThan(0);
    });
  });
});
```

### End-to-End Testing Strategy

**Scope**: Complete user workflows from input to output

**Approach**:

- Place tests in workspace-level `test/e2e/` directory
- Test real CLI commands, API requests, MCP tool calls
- Use minimal mocking (only external services)
- Verify actual file outputs
- Test error scenarios and edge cases

**Example Test Structure**:

```typescript
// test/e2e/cli.e2e.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";

describe("CLI E2E Tests", () => {
  const testOutputDir = path.join(process.cwd(), "test-output");
  const testOutputFile = path.join(testOutputDir, "e2e-test.pptx");

  beforeEach(async () => {
    await fs.mkdir(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.unlink(testOutputFile);
    } catch {
      // Ignore
    }
  });

  describe("magic command", () => {
    it("should generate presentation from prompt", () => {
      const prompt = "Create a 3-slide presentation about AI";
      const command = `pnpm prezvik magic "${prompt}" --output "${testOutputFile}" --mock`;

      const output = execSync(command, { encoding: "utf-8" });

      expect(output).toContain("Magic complete");
      expect(fs.access(testOutputFile)).resolves.toBeUndefined();
    });

    it("should respect --theme option", () => {
      const command = `pnpm prezvik magic "Test" --output "${testOutputFile}" --mock --theme minimal`;

      const output = execSync(command, { encoding: "utf-8" });

      expect(output).toContain("Theme: minimal");
      expect(fs.access(testOutputFile)).resolves.toBeUndefined();
    });

    it("should handle errors gracefully", () => {
      const command = `pnpm prezvik magic "" --output "${testOutputFile}" --mock`;

      expect(() => {
        execSync(command, { encoding: "utf-8" });
      }).toThrow();
    });
  });

  describe("generate command", () => {
    it("should generate from JSON file", async () => {
      const blueprintPath = path.join(testOutputDir, "test-blueprint.json");
      const blueprint = BlueprintFactory.create();
      await fs.writeFile(blueprintPath, JSON.stringify(blueprint));

      const command = `pnpm prezvik generate "${blueprintPath}" --output "${testOutputFile}"`;

      const output = execSync(command, { encoding: "utf-8" });

      expect(output).toContain("Generated");
      expect(fs.access(testOutputFile)).resolves.toBeUndefined();

      await fs.unlink(blueprintPath);
    });
  });

  describe("validate command", () => {
    it("should validate valid blueprint", async () => {
      const blueprintPath = path.join(testOutputDir, "valid-blueprint.json");
      const blueprint = BlueprintFactory.create();
      await fs.writeFile(blueprintPath, JSON.stringify(blueprint));

      const command = `pnpm prezvik validate "${blueprintPath}"`;

      const output = execSync(command, { encoding: "utf-8" });

      expect(output).toContain("Valid");

      await fs.unlink(blueprintPath);
    });

    it("should report validation errors", async () => {
      const blueprintPath = path.join(testOutputDir, "invalid-blueprint.json");
      const blueprint = BlueprintFactory.createInvalid();
      await fs.writeFile(blueprintPath, JSON.stringify(blueprint));

      const command = `pnpm prezvik validate "${blueprintPath}"`;

      expect(() => {
        execSync(command, { encoding: "utf-8" });
      }).toThrow();

      await fs.unlink(blueprintPath);
    });
  });
});
```

### Performance Testing Strategy

**Scope**: Critical performance paths and benchmarks

**Approach**:

- Measure execution time for key operations
- Set performance budgets (e.g., <100ms per slide)
- Test with various data sizes
- Monitor memory usage
- Track performance regressions

**Example Test Structure**:

```typescript
// packages/core/__tests__/performance.test.ts
import { describe, it, expect } from "vitest";
import { generateDeck } from "../src/deck";
import { BlueprintFactory } from "@test/factories/blueprint-factory";
import { measureExecutionTime } from "@test/helpers/test-utils";

describe("Performance Tests", () => {
  it("should generate single slide within 100ms", async () => {
    const blueprint = BlueprintFactory.createWithSlideCount(1);

    const { duration } = await measureExecutionTime(async () => {
      await generateDeck(blueprint, "test-output.pptx", { mock: true });
    });

    expect(duration).toBeLessThan(100);
  });

  it("should generate 10 slides within 1 second", async () => {
    const blueprint = BlueprintFactory.createWithSlideCount(10);

    const { duration } = await measureExecutionTime(async () => {
      await generateDeck(blueprint, "test-output.pptx", { mock: true });
    });

    expect(duration).toBeLessThan(1000);
  });

  it("should process layout within 50ms per slide", async () => {
    const blueprint = BlueprintFactory.createWithSlideCount(5);

    const { duration } = await measureExecutionTime(async () => {
      await generateLayouts(blueprint);
    });

    const perSlide = duration / 5;
    expect(perSlide).toBeLessThan(50);
  });
});
```

### Mock Mode Testing Strategy

**Scope**: All tests should run without external dependencies

**Approach**:

- Default to mock mode for all tests
- Mock AI providers to return deterministic responses
- Mock file system operations with in-memory implementation
- Mock external APIs and services
- Provide flag to run tests against real services (for integration validation)

**Mock Configuration**:

```typescript
// In test/setup.ts
const MOCK_MODE = process.env.TEST_MOCK_MODE !== "false";

if (MOCK_MODE) {
  mockAIProviders.setup();
  mockFileSystem.setup();
  mockExternalAPIs.setup();
}
```

### Coverage Requirements

**Overall Target**: 80% code coverage

**Per-Package Targets**:

- **Critical Packages** (core, schema, pipeline): 90%+
- **Renderer Packages** (renderer-pptx, renderer-gslides): 85%+
- **Layer Packages** (theme-layer, visual-layer, export-layer): 85%+
- **Utility Packages** (utils, logger, design): 80%+
- **Application Code** (cli, api, mcp-server): 75%+
- **Web Application**: 70%+ (UI components harder to test)

**Coverage Exclusions**:

- Type definition files (`*.d.ts`)
- Test files themselves
- Configuration files
- Build artifacts

## Package-Specific Test Plans

### 1. CLI Application (`apps/cli`)

**Test Files**:

- `src/commands/magic.test.ts` (existing, expand)
- `src/commands/ai.test.ts` (new)
- `src/commands/generate.test.ts` (new)
- `src/commands/init.test.ts` (new)
- `src/commands/validate.test.ts` (new)
- `src/commands/dev.test.ts` (new)
- `src/utils/logger.test.ts` (new)
- `src/utils/load-file.test.ts` (new)
- `__tests__/command-integration.test.ts` (new)
- `__tests__/cli-options.test.ts` (new)

**Key Test Scenarios**:

- Command parsing and option handling
- File I/O operations
- Progress logging
- Error reporting with context
- Watch mode functionality
- Integration with core package

### 2. API Server (`apps/api`)

**Test Files**:

- `src/routes/generate.test.ts` (new)
- `src/routes/validate.test.ts` (new)
- `src/routes/health.test.ts` (new)
- `src/routes/layouts.test.ts` (new)
- `src/routes/themes.test.ts` (new)
- `src/routes/ai.test.ts` (new)
- `src/index.test.ts` (new)
- `__tests__/api-integration.test.ts` (new)
- `__tests__/middleware.test.ts` (new)
- `__tests__/error-handling.test.ts` (new)

**Key Test Scenarios**:

- HTTP request/response handling
- Request validation
- Error responses (400, 404, 500)
- CORS configuration
- File upload/download
- Integration with core package

**Example API Test**:

```typescript
// apps/api/src/routes/generate.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import { generateRoute } from "./generate";
import { BlueprintFactory } from "@test/factories/blueprint-factory";

describe("POST /api/generate", () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/generate", generateRoute);
  });

  it("should generate PPTX from valid blueprint", async () => {
    const blueprint = BlueprintFactory.create();

    const response = await request(app).post("/api/generate").send(blueprint).expect(200);

    expect(response.headers["content-type"]).toContain("application/vnd.openxmlformats");
    expect(response.body).toBeInstanceOf(Buffer);
  });

  it("should return 400 for invalid blueprint", async () => {
    const invalidBlueprint = BlueprintFactory.createInvalid();

    const response = await request(app).post("/api/generate").send(invalidBlueprint).expect(400);

    expect(response.body.error).toBeDefined();
    expect(response.body.errors).toBeInstanceOf(Array);
  });

  it("should return 400 for missing blueprint", async () => {
    const response = await request(app).post("/api/generate").send({}).expect(400);

    expect(response.body.error).toContain("blueprint is required");
  });
});
```

### 3. MCP Server (`apps/mcp-server`)

**Test Files**:

- `src/tools/generate.test.ts` (new)
- `src/tools/validate.test.ts` (new)
- `src/tools/info.test.ts` (new)
- `src/adapters/prezvik.test.ts` (new)
- `src/index.test.ts` (new)
- `__tests__/mcp-integration.test.ts` (new)
- `__tests__/tool-schemas.test.ts` (new)

**Key Test Scenarios**:

- MCP protocol compliance
- Tool schema validation
- Tool execution
- Error handling and reporting
- Stdio transport communication

**Example MCP Test**:

```typescript
// apps/mcp-server/src/tools/generate.test.ts
import { describe, it, expect } from "vitest";
import { generatePresentationTool } from "./generate";
import { BlueprintFactory } from "@test/factories/blueprint-factory";

describe("generate_presentation tool", () => {
  it("should have correct schema", () => {
    expect(generatePresentationTool.name).toBe("generate_presentation");
    expect(generatePresentationTool.description).toBeDefined();
    expect(generatePresentationTool.inputSchema).toBeDefined();
  });

  it("should generate presentation from valid deck", async () => {
    const blueprint = BlueprintFactory.create();

    const result = await generatePresentationTool.execute({
      deck: blueprint,
      outputPath: "test-output.pptx",
    });

    expect(result.success).toBe(true);
    expect(result.outputPath).toBe("test-output.pptx");
  });

  it("should return error for invalid deck", async () => {
    const invalidBlueprint = BlueprintFactory.createInvalid();

    const result = await generatePresentationTool.execute({
      deck: invalidBlueprint,
      outputPath: "test-output.pptx",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### 4. Web Application (`apps/web`)

**Test Files**:

- `app/api/generate/route.test.ts` (new)
- `app/api/validate/route.test.ts` (new)
- `app/api/health/route.test.ts` (new)
- `app/builder/page.test.tsx` (new)
- `app/editor/page.test.tsx` (new)
- `app/preview/page.test.tsx` (new)
- `components/preview-modal.test.tsx` (new)
- `components/ui/button.test.tsx` (new)
- `__tests__/web-integration.test.tsx` (new)

**Key Test Scenarios**:

- React component rendering
- User interactions
- API route handlers
- State management
- Form validation
- Error boundaries

**Testing Tools**:

- Vitest + React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking

### 5. Core Package (`packages/core`)

**Test Files**:

- `src/deck.test.ts` (new)
- `src/config.test.ts` (new)
- `src/pipeline/orchestrator.test.ts` (new)
- `__tests__/pipeline-integration.test.ts` (new)
- `__tests__/layered-mode.test.ts` (new)
- `__tests__/dual-mode-comparison.test.ts` (existing, expand)

**Key Test Scenarios**:

- Deck generation (legacy and layered modes)
- Configuration loading and validation
- Pipeline orchestration
- Stage execution order
- Error propagation
- Performance metrics

### 6. Schema Package (`packages/schema`)

**Test Files**:

- `src/blueprint.test.ts` (new)
- `src/slide.test.ts` (new)
- `src/theme.test.ts` (new)
- `src/validators.test.ts` (new)
- `__tests__/schema-integration.test.ts` (new)

**Key Test Scenarios**:

- Schema validation (Zod schemas)
- Type guards
- Schema composition
- Error messages
- Edge cases (missing fields, invalid types)

**Example Schema Test**:

```typescript
// packages/schema/src/blueprint.test.ts
import { describe, it, expect } from "vitest";
import { PrezVikBlueprintSchema } from "./blueprint";
import { BlueprintFactory } from "@test/factories/blueprint-factory";

describe("PrezVikBlueprintSchema", () => {
  it("should validate valid blueprint", () => {
    const blueprint = BlueprintFactory.create();
    const result = PrezVikBlueprintSchema.safeParse(blueprint);

    expect(result.success).toBe(true);
  });

  it("should reject blueprint without version", () => {
    const blueprint = BlueprintFactory.create({ version: undefined });
    const result = PrezVikBlueprintSchema.safeParse(blueprint);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("version");
    }
  });

  it("should reject blueprint with empty slides", () => {
    const blueprint = BlueprintFactory.create({ slides: [] });
    const result = PrezVikBlueprintSchema.safeParse(blueprint);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/at least one slide/i);
    }
  });

  it("should validate blueprint with all slide types", () => {
    const blueprint = BlueprintFactory.create({
      slides: [BlueprintFactory.createTitleSlide(), BlueprintFactory.createContentSlide(), BlueprintFactory.createBulletSlide()],
    });
    const result = PrezVikBlueprintSchema.safeParse(blueprint);

    expect(result.success).toBe(true);
  });
});
```

### 7. Layout Package (`packages/layout`)

**Test Files**:

- `src/resolver.test.ts` (new)
- `src/calculator.test.ts` (new)
- `src/positioning.test.ts` (new)
- `src/alignment.test.ts` (new)
- `__tests__/layout-integration.test.ts` (new)

**Key Test Scenarios**:

- Layout resolution (adding \_rect properties)
- Coordinate calculations
- Nested container positioning
- Alignment algorithms
- Spacing calculations
- Percentage to absolute conversion

### 8. PPTX Renderer Package (`packages/renderer-pptx`)

**Test Files**:

- `src/renderer/pptx-renderer.test.ts` (existing, comprehensive)
- `src/utils/units.test.ts` (new)
- `src/utils/colors.test.ts` (new)
- `__tests__/renderer-integration.test.ts` (new)

**Key Test Scenarios**:

- Text rendering with all properties
- Container rendering
- Background colors
- Coordinate conversion
- Multi-slide rendering
- PPTX file structure validation

### 9. Google Slides Renderer Package (`packages/renderer-gslides`)

**Test Files**:

- `src/renderer/gslides-renderer.test.ts` (new)
- `src/auth/google-auth.test.ts` (new)
- `src/utils/format-converter.test.ts` (new)
- `__tests__/renderer-integration.test.ts` (new)

**Key Test Scenarios**:

- Google Slides API format conversion
- Authentication handling
- Slide creation
- Text and shape rendering
- Error handling for API failures

### 10. AI Package (`packages/ai`)

**Test Files**:

- `src/prezvik-ai.test.ts` (new)
- `src/providers/openai.test.ts` (new)
- `src/providers/anthropic.test.ts` (new)
- `src/providers/groq.test.ts` (new)
- `src/providers/google.test.ts` (new)
- `__tests__/provider-integration.test.ts` (new)

**Key Test Scenarios**:

- Provider initialization
- API key detection
- Mock mode responses
- Error handling
- Token usage tracking
- Provider comparison

**Example AI Test**:

```typescript
// packages/ai/src/prezvik-ai.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { PrezVikAI } from "./prezvik-ai";
import { mockAIProviders } from "@test/mocks/ai-providers";

describe("PrezVikAI", () => {
  beforeEach(() => {
    mockAIProviders.setup();
  });

  describe("initialization", () => {
    it("should detect available providers", () => {
      const ai = new PrezVikAI({ mockMode: true });
      const providers = ai.getAvailableProviders();

      expect(providers).toContain("openai");
      expect(providers).toContain("anthropic");
    });

    it("should work in mock mode without API keys", () => {
      const ai = new PrezVikAI({ mockMode: true });

      expect(() => ai.getAvailableProviders()).not.toThrow();
    });
  });

  describe("summarize", () => {
    it("should return mock response in mock mode", async () => {
      const ai = new PrezVikAI({ mockMode: true });

      const result = await ai.summarize("Test content", "openai");

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
      expect(result.usage).toBeDefined();
    });

    it("should use specified provider", async () => {
      const ai = new PrezVikAI({ mockMode: true });

      const result = await ai.summarize("Test content", "anthropic");

      expect(result.provider).toBe("anthropic");
    });

    it("should handle errors gracefully", async () => {
      const ai = new PrezVikAI({ mockMode: true });
      mockAIProviders.simulateError("openai", new Error("API Error"));

      await expect(async () => {
        await ai.summarize("Test content", "openai");
      }).rejects.toThrow("API Error");
    });
  });
});
```

### 11. Pipeline Package (`packages/pipeline`)

**Test Files**:

- `src/controller.test.ts` (new)
- `src/error-handler.test.ts` (new)
- `src/performance-monitor.test.ts` (new)
- `src/cache-manager.test.ts` (new)
- `__tests__/pipeline-integration.test.ts` (new)

**Key Test Scenarios**:

- Phase execution order
- Error handling and recovery
- Performance tracking
- Cache operations
- Layer coordination

### 12. Theme Layer Package (`packages/theme-layer`)

**Test Files**:

- `src/theme-applicator.test.ts` (new)
- `src/color-resolver.test.ts` (new)
- `src/gradient-generator.test.ts` (new)
- `src/font-resolver.test.ts` (new)
- `__tests__/theme-integration.test.ts` (new)

**Key Test Scenarios**:

- Theme application to layout trees
- Color resolution and inheritance
- Gradient generation
- Font family application
- Theme validation

### 13. Visual Layer Package (`packages/visual-layer`)

**Test Files**:

- `src/visual-polish.test.ts` (new)
- `src/shape-generator.test.ts` (new)
- `src/color-parser.test.ts` (new)
- `src/color-transform.test.ts` (new)
- `__tests__/visual-integration.test.ts` (new)

**Key Test Scenarios**:

- Visual effect application
- Shape geometry calculations
- Color parsing (hex, RGB, named)
- Color transformations
- Error handling

### 14. Export Layer Package (`packages/export-layer`)

**Test Files**:

- `src/export-facade.test.ts` (new)
- `src/format-selector.test.ts` (new)
- `__tests__/export-integration.test.ts` (new)

**Key Test Scenarios**:

- Export to PPTX
- Export to Google Slides
- Format selection
- Option passing
- Error handling

### 15. Utility Packages

**Design Package** (`packages/design`):

- `src/tokens.test.ts`
- `src/color-utils.test.ts`
- `src/spacing-utils.test.ts`
- `src/typography-utils.test.ts`

**Logger Package** (`packages/logger`):

- `src/logger.test.ts`
- `src/formatters.test.ts`

**Utils Package** (`packages/utils`):

- `src/[utility-name].test.ts` for each utility

**Prompt Package** (`packages/prompt`):

- `src/prompt-parser.test.ts`
- `src/deck-generator.test.ts`

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      - name: Run tests
        run: pnpm test:ci
        env:
          TEST_MOCK_MODE: true

      - name: Generate coverage report
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Check coverage thresholds
        run: pnpm test:coverage:check

      - name: Archive test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            coverage/
            test-output/
            **/*.test-results.json

  e2e:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          TEST_MOCK_MODE: true

      - name: Archive E2E results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-results
          path: test-output/

  lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm lint
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:watch": "turbo run test -- --watch",
    "test:ci": "turbo run test -- --run --reporter=verbose --reporter=json",
    "test:coverage": "turbo run test -- --coverage",
    "test:coverage:check": "vitest --coverage --coverage.thresholds.lines=80",
    "test:e2e": "vitest run --config vitest.config.e2e.ts",
    "test:unit": "vitest run --config vitest.config.unit.ts",
    "test:integration": "vitest run --config vitest.config.integration.ts",
    "test:package": "turbo run test --filter",
    "test:changed": "turbo run test --filter=[HEAD^1]"
  }
}
```

### Turbo Configuration for Tests

```json
// turbo.json
{
  "pipeline": {
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**", "test-output/**"],
      "cache": true,
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "**/*.test.ts", "**/*.test.tsx", "__tests__/**", "test/**", "vitest.config.ts"]
    },
    "test:coverage": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": false
    }
  }
}
```

### Coverage Reporting

**Coverage Tools**:

- **Provider**: V8 (built into Vitest)
- **Reporters**: Text (console), JSON (CI), HTML (local), LCOV (Codecov)
- **Thresholds**: Enforced at 80% for lines, functions, statements; 75% for branches

**Coverage Configuration**:

```typescript
// vitest.config.shared.ts
export const sharedConfig = defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["node_modules/", "dist/", "**/*.test.ts", "**/*.test.tsx", "**/__tests__/**", "**/test/**", "**/*.config.ts", "**/*.d.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      // Per-file thresholds for critical packages
      perFile: true,
      skipFull: false,
    },
  },
});
```

**Coverage Reports**:

1. **Console Output**: Real-time feedback during test runs
2. **HTML Report**: Detailed coverage visualization at `coverage/index.html`
3. **JSON Report**: Machine-readable data for CI/CD at `coverage/coverage-final.json`
4. **LCOV Report**: For Codecov integration at `coverage/lcov.info`

### Test Result Artifacts

**Artifacts to Archive**:

- Coverage reports (`coverage/`)
- Test output files (`test-output/`)
- Test result JSON (`**/*.test-results.json`)
- E2E screenshots (if applicable)
- Performance benchmarks

### Continuous Monitoring

**Metrics to Track**:

- Overall code coverage percentage
- Per-package coverage percentages
- Test execution time
- Test failure rate
- Flaky test detection
- Coverage trends over time

**Tools**:

- **Codecov**: Coverage tracking and visualization
- **GitHub Actions**: Test execution and reporting
- **Turbo**: Build and test caching for faster CI

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goals**: Establish test infrastructure and shared utilities

**Tasks**:

1. Create workspace-level Vitest configuration
2. Set up shared test configuration
3. Implement mock infrastructure (AI providers, file system)
4. Create test data factories (blueprint, layout, slide)
5. Implement test helpers and custom assertions
6. Set up test output directories
7. Configure Turbo for test caching

**Deliverables**:

- `vitest.workspace.ts`
- `vitest.config.shared.ts`
- `test/setup.ts`
- `test/mocks/` directory with all mocks
- `test/factories/` directory with all factories
- `test/helpers/` directory with utilities

### Phase 2: Core Package Tests (Week 2)

**Goals**: Achieve 80%+ coverage for core package

**Tasks**:

1. Unit tests for `deck.ts` (generation functions)
2. Unit tests for `config.ts` (configuration management)
3. Unit tests for `pipeline/orchestrator.ts`
4. Integration tests for pipeline execution
5. Integration tests for layered mode
6. Performance tests for deck generation

**Deliverables**:

- 30+ unit tests for core package
- 10+ integration tests
- 5+ performance tests
- 80%+ coverage for `@prezvik/core`

### Phase 3: Schema and Validation Tests (Week 2)

**Goals**: Achieve 90%+ coverage for schema package

**Tasks**:

1. Unit tests for all Zod schemas
2. Unit tests for validators
3. Integration tests for schema composition
4. Edge case tests for validation errors

**Deliverables**:

- 40+ unit tests for schema package
- 5+ integration tests
- 90%+ coverage for `@prezvik/schema`

### Phase 4: Renderer Tests (Week 3)

**Goals**: Achieve 85%+ coverage for renderer packages

**Tasks**:

1. Expand existing PPTX renderer tests
2. Unit tests for PPTX utilities (units, colors)
3. Integration tests for PPTX rendering
4. Unit tests for Google Slides renderer
5. Integration tests for Google Slides rendering

**Deliverables**:

- 50+ unit tests for renderer packages
- 10+ integration tests
- 85%+ coverage for `@prezvik/renderer-pptx` and `@prezvik/renderer-gslides`

### Phase 5: Layout and Layer Tests (Week 3)

**Goals**: Achieve 85%+ coverage for layout and layer packages

**Tasks**:

1. Unit tests for layout resolver
2. Unit tests for layout calculator
3. Unit tests for theme layer
4. Unit tests for visual layer
5. Unit tests for export layer
6. Integration tests for layer interactions

**Deliverables**:

- 60+ unit tests for layout and layer packages
- 15+ integration tests
- 85%+ coverage for layout and layer packages

### Phase 6: AI and Utility Tests (Week 4)

**Goals**: Achieve 80%+ coverage for AI and utility packages

**Tasks**:

1. Unit tests for PrezVikAI class
2. Unit tests for each AI provider
3. Integration tests for provider comparison
4. Unit tests for design utilities
5. Unit tests for logger
6. Unit tests for utils package
7. Unit tests for prompt package

**Deliverables**:

- 50+ unit tests for AI and utility packages
- 10+ integration tests
- 80%+ coverage for AI and utility packages

### Phase 7: Application Tests (Week 5)

**Goals**: Achieve 75%+ coverage for application code

**Tasks**:

1. Expand existing CLI magic command tests
2. Unit tests for all CLI commands
3. Integration tests for CLI
4. Unit tests for API routes
5. Integration tests for API server
6. Unit tests for MCP server tools
7. Integration tests for MCP server
8. Unit tests for web components
9. Integration tests for web app

**Deliverables**:

- 80+ unit tests for applications
- 20+ integration tests
- 75%+ coverage for application code

### Phase 8: E2E and Performance Tests (Week 6)

**Goals**: Complete E2E test suite and performance benchmarks

**Tasks**:

1. E2E tests for CLI workflows
2. E2E tests for API workflows
3. E2E tests for MCP workflows
4. E2E tests for full pipeline
5. Performance tests for critical paths
6. Edge case tests across all packages

**Deliverables**:

- 20+ E2E tests
- 10+ performance tests
- 30+ edge case tests

### Phase 9: CI/CD Integration (Week 6)

**Goals**: Automate test execution and coverage reporting

**Tasks**:

1. Create GitHub Actions workflow
2. Configure Codecov integration
3. Set up coverage thresholds
4. Configure test result artifacts
5. Set up test caching with Turbo
6. Create test documentation

**Deliverables**:

- `.github/workflows/test.yml`
- Codecov configuration
- Test execution documentation
- Coverage badges

### Phase 10: Documentation and Refinement (Week 7)

**Goals**: Document testing practices and refine test suite

**Tasks**:

1. Write testing guidelines
2. Create test examples for each pattern
3. Document mock usage
4. Document test data factories
5. Refine flaky tests
6. Optimize test execution time
7. Review and improve coverage

**Deliverables**:

- Testing guidelines document
- Test pattern examples
- Optimized test suite
- 80%+ overall coverage

## Test File Organization and Naming Conventions

### File Naming Conventions

1. **Unit Tests**: `[source-file].test.ts` or `[source-file].test.tsx`
   - Co-located with source files
   - Example: `deck.ts` → `deck.test.ts`

2. **Integration Tests**: `[feature].integration.test.ts`
   - Placed in `__tests__/` directory
   - Example: `__tests__/pipeline-integration.test.ts`

3. **E2E Tests**: `[workflow].e2e.test.ts`
   - Placed in workspace-level `test/e2e/` directory
   - Example: `test/e2e/cli.e2e.test.ts`

4. **Performance Tests**: `[feature].performance.test.ts`
   - Can be co-located or in `__tests__/`
   - Example: `__tests__/deck-generation.performance.test.ts`

### Test Suite Organization

**Describe Block Hierarchy**:

```typescript
describe("ComponentName", () => {
  describe("methodName", () => {
    it("should do something when condition", () => {
      // Test implementation
    });

    it("should handle error when invalid input", () => {
      // Test implementation
    });
  });

  describe("anotherMethod", () => {
    // More tests
  });
});
```

**Test Naming Pattern**:

- Use descriptive names that explain what is being tested
- Format: `should [expected behavior] when [condition]`
- Examples:
  - `should validate blueprint when all required fields are present`
  - `should throw error when blueprint is missing version`
  - `should generate PPTX file when valid deck is provided`

### Test Structure Pattern

```typescript
// Arrange - Set up test data and mocks
const blueprint = BlueprintFactory.create();
const mockLogger = createMockLogger();

// Act - Execute the code under test
const result = await generateDeck(blueprint, "output.pptx", {
  logger: mockLogger,
});

// Assert - Verify the results
expect(result).toBeDefined();
expect(mockLogger.info).toHaveBeenCalledWith("Generation complete");
```

### Test Data Management

**Fixtures**: Static test data in `test/fixtures/`

```
test/fixtures/
├── blueprints/
│   ├── valid-simple.json
│   ├── valid-complex.json
│   └── invalid-missing-version.json
├── decks/
│   ├── single-slide.json
│   └── multi-slide.json
└── themes/
    ├── minimal.json
    └── modern.json
```

**Factories**: Dynamic test data generation in `test/factories/`

```typescript
// Use factories for dynamic data
const blueprint = BlueprintFactory.create({ slideCount: 5 });

// Use fixtures for static data
const blueprint = await loadFixture("blueprints/valid-simple.json");
```

### Mock Organization

**Shared Mocks**: `test/mocks/`

- `ai-providers.ts` - Mock AI provider responses
- `file-system.ts` - Mock file system operations
- `external-apis.ts` - Mock external service calls

**Package-Specific Mocks**: Co-located with tests

```typescript
// In test file
vi.mock("../src/dependency", () => ({
  dependency: vi.fn().mockReturnValue("mocked value"),
}));
```

### Test Utilities Organization

**Shared Utilities**: `test/helpers/`

- `assertions.ts` - Custom assertion functions
- `matchers.ts` - Custom Vitest matchers
- `test-utils.ts` - Common test utilities

**Package-Specific Utilities**: In package `__tests__/` directory

```
packages/core/__tests__/
├── helpers/
│   ├── pipeline-helpers.ts
│   └── deck-helpers.ts
└── pipeline-integration.test.ts
```

## Best Practices and Guidelines

### General Testing Principles

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Avoid testing private methods directly
   - Test public APIs and contracts

2. **Keep Tests Independent**
   - Each test should run in isolation
   - No shared state between tests
   - Use `beforeEach` for setup, `afterEach` for cleanup

3. **Make Tests Readable**
   - Use descriptive test names
   - Follow Arrange-Act-Assert pattern
   - Keep tests focused on one thing

4. **Use Appropriate Test Types**
   - Unit tests for pure functions and isolated logic
   - Integration tests for component interactions
   - E2E tests for complete workflows

5. **Mock External Dependencies**
   - Mock AI providers, file system, external APIs
   - Use real implementations for internal dependencies
   - Provide flag to run tests against real services

### Vitest-Specific Best Practices

1. **Use `describe` for Grouping**

   ```typescript
   describe("ComponentName", () => {
     describe("methodName", () => {
       it("should...", () => {});
     });
   });
   ```

2. **Use `beforeEach` for Setup**

   ```typescript
   describe("Tests", () => {
     let testData: any;

     beforeEach(() => {
       testData = createTestData();
     });

     it("should use test data", () => {
       expect(testData).toBeDefined();
     });
   });
   ```

3. **Use `vi.mock` for Module Mocking**

   ```typescript
   vi.mock("@prezvik/ai", () => ({
     PrezVikAI: vi.fn().mockImplementation(() => ({
       summarize: vi.fn().mockResolvedValue("mock response"),
     })),
   }));
   ```

4. **Use Custom Matchers**

   ```typescript
   expect.extend({
     toBeValidBlueprint(received) {
       // Custom validation logic
     },
   });

   expect(blueprint).toBeValidBlueprint();
   ```

5. **Use Snapshot Testing Sparingly**
   - Good for: API responses, rendered output
   - Bad for: Frequently changing data, timestamps

### Mock Strategy

1. **Default to Mock Mode**
   - All tests run with mocks by default
   - No external API calls in CI/CD
   - Fast, reliable, deterministic tests

2. **Provide Real Mode Flag**

   ```typescript
   const USE_REAL_SERVICES = process.env.TEST_USE_REAL === "true";

   if (!USE_REAL_SERVICES) {
     mockAIProviders.setup();
   }
   ```

3. **Mock at the Right Level**
   - Mock external services (AI, APIs)
   - Don't mock internal packages
   - Mock file system for unit tests

4. **Keep Mocks Realistic**
   - Mock responses should match real API responses
   - Include realistic data structures
   - Test error scenarios

### Performance Testing Guidelines

1. **Set Realistic Budgets**
   - Single slide: <100ms
   - 10 slides: <1 second
   - Layout per slide: <50ms
   - Theme application: <20ms per slide

2. **Measure Consistently**

   ```typescript
   const { duration } = await measureExecutionTime(async () => {
     await generateDeck(blueprint);
   });

   expect(duration).toBeLessThan(1000);
   ```

3. **Test with Various Data Sizes**
   - Small (1-3 slides)
   - Medium (10-20 slides)
   - Large (50+ slides)

4. **Monitor Regressions**
   - Track performance over time
   - Alert on significant slowdowns
   - Profile slow tests

### Coverage Guidelines

1. **Aim for 80%+ Overall**
   - Critical packages: 90%+
   - Renderer packages: 85%+
   - Utility packages: 80%+
   - Application code: 75%+

2. **Focus on Critical Paths**
   - Deck generation pipeline
   - Schema validation
   - Rendering logic
   - Error handling

3. **Don't Chase 100%**
   - Some code is hard to test (UI, external integrations)
   - Focus on value, not just numbers
   - Use manual testing for UI/UX

4. **Review Uncovered Code**
   - Identify untested code paths
   - Add tests for critical uncovered code
   - Document why some code is untested

### Error Testing Guidelines

1. **Test Error Conditions**

   ```typescript
   it("should throw error for invalid input", async () => {
     await expect(async () => {
       await generateDeck(invalidBlueprint);
     }).rejects.toThrow("Invalid blueprint");
   });
   ```

2. **Test Error Messages**

   ```typescript
   try {
     await generateDeck(invalidBlueprint);
   } catch (error) {
     expect(error.message).toContain("version is required");
   }
   ```

3. **Test Error Context**
   ```typescript
   try {
     await generateDeck(invalidBlueprint);
   } catch (error) {
     expect(error.context).toEqual({
       stage: "validation",
       blueprint: invalidBlueprint,
     });
   }
   ```

### Async Testing Guidelines

1. **Always Use `async/await`**

   ```typescript
   it("should generate deck", async () => {
     const result = await generateDeck(blueprint);
     expect(result).toBeDefined();
   });
   ```

2. **Test Promise Rejections**

   ```typescript
   await expect(async () => {
     await generateDeck(invalidBlueprint);
   }).rejects.toThrow();
   ```

3. **Set Appropriate Timeouts**
   ```typescript
   it("should complete within timeout", async () => {
     await generateDeck(blueprint);
   }, 5000); // 5 second timeout
   ```

### Test Maintenance

1. **Keep Tests Up to Date**
   - Update tests when code changes
   - Remove obsolete tests
   - Refactor tests with code

2. **Fix Flaky Tests**
   - Identify and fix non-deterministic tests
   - Add retries for truly flaky operations
   - Remove or skip consistently flaky tests

3. **Optimize Slow Tests**
   - Profile slow tests
   - Reduce unnecessary setup
   - Use parallel execution

4. **Document Complex Tests**
   - Add comments for non-obvious test logic
   - Explain why certain mocks are needed
   - Document test data setup

## Success Metrics

### Coverage Metrics

| Package                | Target Coverage | Current Coverage | Status             |
| ---------------------- | --------------- | ---------------- | ------------------ |
| @prezvik/core             | 90%             | <5%              | 🔴 Not Started     |
| @prezvik/schema           | 90%             | 0%               | 🔴 Not Started     |
| @prezvik/pipeline         | 85%             | 0%               | 🔴 Not Started     |
| @prezvik/renderer-pptx    | 85%             | ~60%             | 🟡 In Progress     |
| @prezvik/renderer-gslides | 85%             | 0%               | 🔴 Not Started     |
| @prezvik/layout           | 85%             | 0%               | 🔴 Not Started     |
| @prezvik/theme-layer      | 85%             | 0%               | 🔴 Not Started     |
| @prezvik/visual-layer     | 85%             | 0%               | 🔴 Not Started     |
| @prezvik/export-layer     | 85%             | 0%               | 🔴 Not Started     |
| @prezvik/ai               | 80%             | 0%               | 🔴 Not Started     |
| @prezvik/design           | 80%             | 0%               | 🔴 Not Started     |
| @prezvik/logger           | 80%             | 0%               | 🔴 Not Started     |
| @prezvik/utils            | 80%             | 0%               | 🔴 Not Started     |
| @prezvik/prompt           | 80%             | 0%               | 🔴 Not Started     |
| apps/cli               | 75%             | ~10%             | 🟡 In Progress     |
| apps/api               | 75%             | 0%               | 🔴 Not Started     |
| apps/mcp-server        | 75%             | 0%               | 🔴 Not Started     |
| apps/web               | 70%             | 0%               | 🔴 Not Started     |
| **Overall**            | **80%**         | **<5%**          | **🔴 Not Started** |

### Test Count Metrics

| Test Type         | Target Count | Current Count | Status      |
| ----------------- | ------------ | ------------- | ----------- |
| Unit Tests        | 400+         | ~50           | 🔴 12.5%    |
| Integration Tests | 100+         | 0             | 🔴 0%       |
| E2E Tests         | 20+          | 0             | 🔴 0%       |
| Performance Tests | 10+          | 0             | 🔴 0%       |
| **Total**         | **530+**     | **~50**       | **🔴 9.4%** |

### Quality Metrics

| Metric              | Target     | Current     | Status         |
| ------------------- | ---------- | ----------- | -------------- |
| Test Execution Time | <5 minutes | ~10 seconds | 🟢 Good        |
| Flaky Test Rate     | <1%        | Unknown     | 🟡 To Measure  |
| Test Failure Rate   | <5%        | Unknown     | 🟡 To Measure  |
| CI/CD Integration   | 100%       | 0%          | 🔴 Not Started |
| Coverage Reporting  | Automated  | Manual      | 🔴 Not Started |

### Performance Benchmarks

| Operation                     | Target | Current | Status        |
| ----------------------------- | ------ | ------- | ------------- |
| Single Slide Generation       | <100ms | Unknown | 🟡 To Measure |
| 10 Slide Generation           | <1s    | Unknown | 🟡 To Measure |
| Layout Resolution (per slide) | <50ms  | Unknown | 🟡 To Measure |
| Theme Application (per slide) | <20ms  | Unknown | 🟡 To Measure |
| PPTX Rendering (per slide)    | <100ms | Unknown | 🟡 To Measure |

### Completion Criteria

**Phase 1 Complete** (Foundation):

- ✅ Workspace Vitest configuration created
- ✅ Shared configuration established
- ✅ Mock infrastructure implemented
- ✅ Test factories created
- ✅ Test helpers implemented

**Phase 2-7 Complete** (Package Tests):

- ✅ 80%+ coverage for all packages
- ✅ 400+ unit tests
- ✅ 100+ integration tests
- ✅ All critical paths tested

**Phase 8 Complete** (E2E and Performance):

- ✅ 20+ E2E tests
- ✅ 10+ performance tests
- ✅ Performance benchmarks established

**Phase 9 Complete** (CI/CD):

- ✅ GitHub Actions workflow configured
- ✅ Codecov integration active
- ✅ Coverage thresholds enforced
- ✅ Test artifacts archived

**Phase 10 Complete** (Documentation):

- ✅ Testing guidelines documented
- ✅ Test patterns documented
- ✅ Mock usage documented
- ✅ Overall 80%+ coverage achieved

### Definition of Done

A test suite is considered complete when:

1. **Coverage**: Package meets or exceeds target coverage percentage
2. **Quality**: All tests pass consistently (no flaky tests)
3. **Performance**: Tests execute within time budget
4. **Documentation**: Test patterns and utilities are documented
5. **CI/CD**: Tests run automatically on every commit
6. **Maintenance**: Tests are maintainable and follow conventions

## Risk Assessment and Mitigation

### Technical Risks

| Risk                                 | Impact | Probability | Mitigation                                                                                   |
| ------------------------------------ | ------ | ----------- | -------------------------------------------------------------------------------------------- |
| Flaky tests due to async operations  | High   | Medium      | Use proper async/await, increase timeouts, add retries for truly async operations            |
| Mock drift from real implementations | High   | Medium      | Regularly validate mocks against real services, provide flag to run tests with real services |
| Slow test execution time             | Medium | High        | Use parallel execution, optimize setup/teardown, cache test data                             |
| Coverage gaps in critical paths      | High   | Low         | Prioritize critical path testing, review coverage reports regularly                          |
| Test maintenance burden              | Medium | Medium      | Follow conventions, keep tests simple, refactor with code                                    |
| CI/CD pipeline failures              | Medium | Low         | Use stable test infrastructure, monitor flaky tests, implement retries                       |

### Process Risks

| Risk                                        | Impact | Probability | Mitigation                                                                 |
| ------------------------------------------- | ------ | ----------- | -------------------------------------------------------------------------- |
| Insufficient time for comprehensive testing | High   | Medium      | Prioritize critical packages, implement in phases, automate where possible |
| Lack of testing expertise                   | Medium | Low         | Provide clear guidelines, examples, and patterns                           |
| Test code quality issues                    | Medium | Medium      | Code review test code, enforce conventions, use linting                    |
| Incomplete test coverage                    | High   | Medium      | Set coverage thresholds, review uncovered code, prioritize critical paths  |

### Dependency Risks

| Risk                         | Impact | Probability | Mitigation                                            |
| ---------------------------- | ------ | ----------- | ----------------------------------------------------- |
| Vitest version compatibility | Low    | Low         | Pin versions, test upgrades in isolation              |
| Mock library limitations     | Medium | Low         | Use built-in Vitest mocking, fallback to manual mocks |
| External service changes     | Medium | Medium      | Mock external services, version API contracts         |
| Package dependency changes   | Medium | Medium      | Test after dependency updates, use lockfiles          |

### Mitigation Strategies

1. **Flaky Test Prevention**
   - Use deterministic test data
   - Avoid time-based assertions
   - Properly clean up after tests
   - Use appropriate timeouts

2. **Mock Maintenance**
   - Document mock behavior
   - Validate mocks against real services periodically
   - Update mocks when APIs change
   - Provide integration tests with real services

3. **Performance Optimization**
   - Run tests in parallel
   - Use test caching (Turbo)
   - Optimize setup/teardown
   - Profile and optimize slow tests

4. **Coverage Monitoring**
   - Enforce coverage thresholds in CI
   - Review coverage reports regularly
   - Prioritize uncovered critical code
   - Track coverage trends

5. **Test Maintenance**
   - Follow naming conventions
   - Keep tests simple and focused
   - Refactor tests with code
   - Remove obsolete tests

## Appendix

### A. Example Test Files

#### A.1 Unit Test Example

```typescript
// packages/schema/src/validators.test.ts
import { describe, it, expect } from "vitest";
import { validateBlueprint } from "./validators";
import { BlueprintFactory } from "@test/factories/blueprint-factory";

describe("validateBlueprint", () => {
  it("should validate a valid blueprint", () => {
    const blueprint = BlueprintFactory.create();
    const result = validateBlueprint(blueprint);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject blueprint with missing version", () => {
    const blueprint = BlueprintFactory.create({ version: undefined });
    const result = validateBlueprint(blueprint);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("version is required");
  });

  it("should reject blueprint with empty slides array", () => {
    const blueprint = BlueprintFactory.create({ slides: [] });
    const result = validateBlueprint(blueprint);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("at least one slide is required");
  });
});
```

#### A.2 Integration Test Example

```typescript
// packages/core/__tests__/pipeline-integration.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { PipelineOrchestrator } from "../src/pipeline/orchestrator";
import { BlueprintFactory } from "@test/factories/blueprint-factory";
import { mockAIProviders } from "@test/mocks/ai-providers";

describe("Pipeline Integration", () => {
  let orchestrator: PipelineOrchestrator;

  beforeEach(() => {
    mockAIProviders.setup();
    orchestrator = new PipelineOrchestrator();
  });

  it("should execute all pipeline stages in order", async () => {
    const blueprint = BlueprintFactory.create();
    const stages: string[] = [];

    orchestrator.on("stage:start", (stage) => {
      stages.push(stage.name);
    });

    await orchestrator.execute(blueprint);

    expect(stages).toEqual(["Blueprint Generation", "Blueprint Validation", "Layout Generation", "Coordinate Positioning", "Theme Application", "PPTX Rendering"]);
  });

  it("should pass data correctly between stages", async () => {
    const blueprint = BlueprintFactory.create();
    let layoutData: any;
    let themedData: any;

    orchestrator.on("stage:complete", (stage, data) => {
      if (stage.name === "Layout Generation") {
        layoutData = data;
      }
      if (stage.name === "Theme Application") {
        themedData = data;
      }
    });

    await orchestrator.execute(blueprint);

    expect(layoutData.root._rect).toBeDefined();
    expect(themedData.root.text?.color).toBeDefined();
  });
});
```

#### A.3 E2E Test Example

```typescript
// test/e2e/cli.e2e.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";

describe("CLI E2E Tests", () => {
  const testOutputDir = path.join(process.cwd(), "test-output");
  const testOutputFile = path.join(testOutputDir, "e2e-test.pptx");

  beforeEach(async () => {
    await fs.mkdir(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.unlink(testOutputFile);
    } catch {
      // Ignore
    }
  });

  it("should generate presentation from prompt", () => {
    const prompt = "Create a 3-slide presentation about AI";
    const command = `pnpm prezvik magic "${prompt}" --output "${testOutputFile}" --mock`;

    const output = execSync(command, { encoding: "utf-8" });

    expect(output).toContain("Magic complete");
    expect(fs.access(testOutputFile)).resolves.toBeUndefined();
  });
});
```

### B. Configuration File Examples

#### B.1 Workspace Configuration

```typescript
// vitest.workspace.ts
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "apps/cli",
  "apps/api",
  "apps/mcp-server",
  "apps/web",
  "packages/core",
  "packages/schema",
  "packages/layout",
  "packages/renderer-pptx",
  "packages/renderer-gslides",
  "packages/ai",
  "packages/pipeline",
  "packages/theme-layer",
  "packages/visual-layer",
  "packages/export-layer",
  "packages/design",
  "packages/logger",
  "packages/utils",
  "packages/prompt",
  {
    test: {
      name: "e2e",
      include: ["test/e2e/**/*.e2e.test.ts"],
      environment: "node",
      testTimeout: 30000,
    },
  },
]);
```

#### B.2 Shared Configuration

```typescript
// vitest.config.shared.ts
import { defineConfig } from "vitest/config";
import path from "path";

export const sharedConfig = defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: ["node_modules/", "dist/", "**/*.test.ts", "**/*.test.tsx", "**/__tests__/**", "**/test/**", "**/*.config.ts", "**/*.d.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    reporters: ["verbose", "json", "html"],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@test": path.resolve(__dirname, "./test"),
      "@fixtures": path.resolve(__dirname, "./test/fixtures"),
      "@mocks": path.resolve(__dirname, "./test/mocks"),
    },
  },
});
```

#### B.3 Package Configuration

```typescript
// packages/core/vitest.config.ts
import { defineConfig, mergeConfig } from "vitest/config";
import { sharedConfig } from "../../vitest.config.shared";

export default mergeConfig(
  sharedConfig,
  defineConfig({
    test: {
      name: "@prezvik/core",
      include: ["src/**/*.test.ts", "__tests__/**/*.test.ts"],
      coverage: {
        include: ["src/**/*.ts"],
        exclude: ["src/**/*.test.ts", "src/**/*.d.ts"],
      },
    },
  }),
);
```

### C. Useful Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests for specific package
pnpm --filter @prezvik/core test

# Run E2E tests only
pnpm test:e2e

# Run unit tests only
pnpm test:unit

# Run integration tests only
pnpm test:integration

# Run tests for changed packages
pnpm test:changed

# Run tests in CI mode
pnpm test:ci

# Check coverage thresholds
pnpm test:coverage:check

# Generate coverage report
pnpm test:coverage

# Run performance tests
pnpm test:performance
```

### D. Troubleshooting

**Problem**: Tests are slow

- **Solution**: Use parallel execution, optimize setup/teardown, profile slow tests

**Problem**: Flaky tests

- **Solution**: Use proper async/await, increase timeouts, fix race conditions

**Problem**: Mock not working

- **Solution**: Check mock setup order, verify mock path, use `vi.mock` correctly

**Problem**: Coverage not accurate

- **Solution**: Check coverage exclude patterns, ensure all files are included

**Problem**: Tests fail in CI but pass locally

- **Solution**: Check environment differences, ensure deterministic test data, fix timing issues

**Problem**: Import errors in tests

- **Solution**: Check path aliases, verify tsconfig, ensure proper module resolution

### E. Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Mock Service Worker](https://mswjs.io/)
- [Codecov Documentation](https://docs.codecov.com/)
- [Turbo Documentation](https://turbo.build/repo/docs)
