/**
 * Blueprint Generator
 *
 * Transforms user prompts into valid Blueprint JSON using PrezVikAI
 */

import type { PrezVikBlueprint, Slide } from "@prezvik/schema";
import type { PrezVikAI } from "../prezvik-ai.js";
import { createLogger } from "@prezvik/logger";

const logger = createLogger({ context: "BlueprintGenerator" });

/**
 * Blueprint Generator configuration options
 *
 * @example
 * ```typescript
 * const options: BlueprintGeneratorOptions = {
 *   provider: "openai",
 *   temperature: 0.7,
 *   maxTokens: 4000,
 *   mockMode: false
 * };
 * ```
 */
export interface BlueprintGeneratorOptions {
  /**
   * AI provider for Blueprint generation
   * @default "groq"
   * @example "openai" | "anthropic" | "groq" | "gemini"
   */
  provider?: string;

  /**
   * Strategy for model selection - affects speed/quality tradeoff
   * @default "speed"
   * @example "speed" | "balanced" | "quality"
   */
  strategy?: "speed" | "balanced" | "quality";

  /**
   * Temperature for AI generation (0.0 - 1.0)
   * Higher values = more creative, lower values = more deterministic
   * @default 0.7
   */
  temperature?: number;

  /**
   * Maximum tokens for AI generation
   * @default 4000
   */
  maxTokens?: number;

  /**
   * Mock mode for testing - uses template generation instead of AI
   * Set to true for CI/CD environments or when API keys are not available
   * @default false
   */
  mockMode?: boolean;
}

interface Keywords {
  slideCount: number;
  topic: string;
  presentationType: "pitch" | "report" | "training" | "generic";
  goal: PrezVikBlueprint["meta"]["goal"];
  tone: PrezVikBlueprint["meta"]["tone"];
  audience?: string;
}

/**
 * Blueprint Generation Error
 *
 * Thrown when Blueprint generation fails due to AI errors, parsing errors,
 * or validation errors.
 *
 * @example
 * ```typescript
 * try {
 *   const blueprint = await generator.generate(prompt);
 * } catch (error) {
 *   if (error instanceof BlueprintGenerationError) {
 *     console.error(`Failed for prompt: ${error.prompt}`);
 *     console.error(`AI error:`, error.aiError);
 *   }
 * }
 * ```
 */
export class BlueprintGenerationError extends Error {
  constructor(
    message: string,
    /** The prompt that failed to generate a Blueprint */
    public prompt: string,
    /** The underlying AI error, if any */
    public aiError?: Error,
  ) {
    super(message);
    this.name = "BlueprintGenerationError";
  }
}

/**
 * Blueprint Generator
 *
 * Transforms user prompts into valid Blueprint JSON using AI generation.
 *
 * **AI Providers:**
 * - OpenAI (GPT-4, GPT-3.5)
 * - Anthropic (Claude)
 * - Groq (Llama, Mixtral)
 *
 * **Blueprint Format:**
 * Generated Blueprints conform to the Blueprint schema with:
 * - Meta information (title, goal, tone, audience)
 * - Slide types (hero, section, content, etc.)
 * - Layout types (center_focus, two_column, etc.)
 * - Content blocks (heading, text, bullets, etc.)
 *
 * @example
 * ```typescript
 * const prezVikAI = new PrezVikAI();
 * const generator = new BlueprintGenerator(prezVikAI);
 *
 * // Generate with AI (requires API key)
 * const blueprint = await generator.generate("Create a pitch deck", {
 *   provider: "openai",
 *   temperature: 0.7
 * });
 * ```
 */
export class BlueprintGenerator {
  constructor(private prezVikAI: PrezVikAI) {}

  /**
   * Generate Blueprint from user prompt
   *
   * Transforms a natural language prompt into a structured Blueprint JSON.
   * Uses AI generation (OpenAI, Anthropic, Groq) with the specified provider.
   *
   * **AI Mode:**
   * - Sends prompt to AI provider with Blueprint schema
   * - Parses JSON response and validates structure
   * - Infers meta information (goal, tone, audience) from prompt
   *
   * @param prompt - User prompt describing the presentation
   * @param options - Generation options (provider, temperature, strategy, etc.)
   * @returns Valid Blueprint JSON
   * @throws {BlueprintGenerationError} If generation or parsing fails
   *
   * @example
   * ```typescript
   * const generator = new BlueprintGenerator(prezVikAI);
   *
   * // Generate with AI
   * const blueprint = await generator.generate(
   *   "Create a 5-slide pitch deck for AI startup",
   *   { provider: "openai", temperature: 0.7 }
   * );
   * ```
   */
  async generate(prompt: string, options: BlueprintGeneratorOptions = {}): Promise<PrezVikBlueprint> {
    try {
      // Only use mock mode if explicitly requested
      if (options.mockMode === true) {
        logger.info("Using mock mode (template-based generation) - explicitly requested");
        return this.generateFromTemplate(prompt);
      }

      logger.info({ provider: options.provider || "auto-detect", temperature: options.temperature || 0.7 }, "Generating blueprint");

      // Infer meta information from prompt
      const meta = this.inferMeta(prompt);
      logger.info({ goal: meta.goal, tone: meta.tone }, "Inferred meta");

      // Build system prompt with Blueprint schema
      const systemPrompt = this.buildSystemPrompt();

      // Generate Blueprint using PrezVikAI with structured outputs
      // Returns validated PrezVikBlueprint directly - no parsing needed
      const startTime = Date.now();
      const blueprint = await this.prezVikAI.generateSlideDeck(`${systemPrompt}\n\nUser request: ${prompt}`, {
        provider: options.provider,
        strategy: options.strategy || "speed",
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      });
      const aiDuration = Date.now() - startTime;
      logger.info({ duration: `${(aiDuration / 1000).toFixed(2)}s`, slides: blueprint.slides.length }, "Generated Blueprint via AI");

      // Note: With generateObject, the LLM is forced to follow the schema
      // so manual validation of JSON-in-content is no longer necessary

      // Merge inferred meta with generated blueprint
      blueprint.meta = {
        ...meta,
        ...blueprint.meta,
      };

      return blueprint;
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : String(error) }, "Generation failed");

      // Provide helpful error message if no providers are available
      if (error instanceof Error && error.message.includes("No LLM providers available")) {
        throw new BlueprintGenerationError(`No AI providers available. Please set up at least one provider:\n` + `  - OPENAI_API_KEY for OpenAI\n` + `  - ANTHROPIC_API_KEY for Anthropic\n` + `  - GROQ_API_KEY for Groq\n` + `Or use mockMode: true for testing without AI.`, prompt, error);
      }

      if (error instanceof BlueprintGenerationError) {
        throw error;
      }
      throw new BlueprintGenerationError(`Failed to generate Blueprint: ${error instanceof Error ? error.message : String(error)}`, prompt, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Generate Blueprint from template (mock mode)
   */
  generateFromTemplate(prompt: string): PrezVikBlueprint {
    console.log(`  [Template] Extracting keywords from prompt...`);
    // Extract keywords from prompt
    const keywords = this.extractKeywords(prompt);
    console.log(`  [Template] Detected type: ${keywords.presentationType}, slides: ${keywords.slideCount}`);

    // Select appropriate template
    const template = this.selectTemplate(keywords);
    console.log(`  [Template] Selected ${keywords.presentationType} template`);

    // Fill template with extracted content
    const blueprint = this.fillTemplate(template, keywords);
    console.log(`  [Template] Generated Blueprint with ${blueprint.slides.length} slides`);

    return blueprint;
  }

  /**
   * Extract keywords from prompt
   */
  extractKeywords(prompt: string): Keywords {
    const lowerPrompt = prompt.toLowerCase();

    // Extract slide count
    let slideCount = 3; // Default
    const slideCountMatch = prompt.match(/(\d+)[\s-]?slides?/i);
    if (slideCountMatch) {
      slideCount = parseInt(slideCountMatch[1], 10);
    }

    // Extract topic (use first sentence or first 50 chars)
    const firstSentence = prompt.split(/[.!?]/)[0].trim();
    const topic = firstSentence.length > 50 ? firstSentence.substring(0, 50) : firstSentence || "Presentation";

    // Determine presentation type
    let presentationType: Keywords["presentationType"] = "generic";
    if (lowerPrompt.includes("pitch") || lowerPrompt.includes("startup") || lowerPrompt.includes("investor")) {
      presentationType = "pitch";
    } else if (lowerPrompt.includes("report") || lowerPrompt.includes("summary") || lowerPrompt.includes("results") || lowerPrompt.includes("analysis")) {
      presentationType = "report";
    } else if (lowerPrompt.includes("training") || lowerPrompt.includes("teach") || lowerPrompt.includes("learn") || lowerPrompt.includes("course")) {
      presentationType = "training";
    }

    // Infer meta information
    const meta = this.inferMeta(prompt);

    return {
      slideCount,
      topic,
      presentationType,
      goal: meta.goal || "inform",
      tone: meta.tone || "modern",
      audience: meta.audience,
    };
  }

  /**
   * Build system prompt with Blueprint schema and examples
   */
  buildSystemPrompt(): string {
    return `You are a presentation design expert that outputs ONLY raw JSON.

ABSOLUTE RULES — violating any of these makes the output unusable:
1. Output RAW JSON only. Zero prose. Zero markdown. Zero code fences.
2. Do NOT wrap output in \`\`\`json or \`\`\` — start your response with { and end with }
3. Use Blueprint schema with version "2.0"
4. Every slide needs: id, type, intent, layout, content (array)
5. Do not truncate or summarize — output the complete JSON for all slides

META FIELD VALUES:
- goal: Must be one of ["inform", "persuade", "educate", "pitch", "report"]
- tone: Must be one of ["formal", "modern", "bold", "minimal", "friendly"]
- audience: Optional string describing target audience

SLIDE TYPES (use all 10 — pick the best fit for each slide's content):
- hero: Opening title slide (always use for slide 1)
- section: Bold section divider between major topics
- bullet-list: Content with a heading + bullet points (most common)
- two-column: Two parallel columns of content or comparison
- stat-trio: Exactly 3 key statistics or metrics with large numbers
- quote: Single powerful quote with attribution
- comparison: Explicit A vs B comparison with labels
- timeline: Ordered steps, phases, or milestones (3-7 items)
- grid: 4–6 items displayed as cards (features, benefits, team)
- closing: Final slide — CTA, thank you, or next steps (always last)

LAYOUT TYPES:
- center_focus: Centered content (1-3 content blocks max)
- two_column: Two-column layout (1-6 content blocks)
- three_column: Three-column layout (2-9 content blocks)
- split_screen: 50/50 split (2-4 content blocks)
- grid_2x2: 2x2 grid (4 content blocks exactly)
- hero_overlay: Hero image with text overlay (1-3 content blocks)
- timeline: Timeline layout (3-7 content blocks)
- stat_highlight: Large stat display (1-4 stat blocks)
- image_dominant: Image-focused layout (1-3 content blocks)

CONTENT BLOCK TYPES:
- heading: { type: "heading", value: "text", level: "h1"|"h2"|"h3", emphasis: "low"|"medium"|"high" }
- text: { type: "text", value: "text", emphasis: "low"|"medium"|"high" }
- bullets: { type: "bullets", items: [{ text: "item", icon?: "emoji", highlight?: true }] }
- quote: { type: "quote", text: "quote", author?: "name", role?: "title" }
- stat: { type: "stat", value: "number", label: "description", visualWeight: "normal"|"emphasis"|"hero" }
- code: { type: "code", code: "code", language?: "javascript" }

Your entire response must be parseable by JSON.parse(). Start now with {`;
  }

  /**
   * Infer meta information from prompt
   */
  inferMeta(prompt: string): Partial<PrezVikBlueprint["meta"]> {
    const lowerPrompt = prompt.toLowerCase();

    // Infer goal
    let goal: PrezVikBlueprint["meta"]["goal"] = "inform";
    if (lowerPrompt.includes("pitch") || lowerPrompt.includes("sell") || lowerPrompt.includes("convince")) {
      goal = "pitch";
    } else if (lowerPrompt.includes("persuade") || lowerPrompt.includes("argue")) {
      goal = "persuade";
    } else if (lowerPrompt.includes("teach") || lowerPrompt.includes("train") || lowerPrompt.includes("learn")) {
      goal = "educate";
    } else if (lowerPrompt.includes("report") || lowerPrompt.includes("summary") || lowerPrompt.includes("results")) {
      goal = "report";
    }

    // Infer tone
    let tone: PrezVikBlueprint["meta"]["tone"] = "modern";
    if (lowerPrompt.includes("formal") || lowerPrompt.includes("professional") || lowerPrompt.includes("corporate")) {
      tone = "formal";
    } else if (lowerPrompt.includes("bold") || lowerPrompt.includes("striking") || lowerPrompt.includes("dramatic")) {
      tone = "bold";
    } else if (lowerPrompt.includes("minimal") || lowerPrompt.includes("simple") || lowerPrompt.includes("clean")) {
      tone = "minimal";
    } else if (lowerPrompt.includes("friendly") || lowerPrompt.includes("casual") || lowerPrompt.includes("warm")) {
      tone = "friendly";
    }

    // Infer audience
    let audience: string | undefined;
    const audiencePatterns = [
      { pattern: /for ([\w\s]+?)(?:\.|,|$)/, group: 1 },
      { pattern: /to ([\w\s]+?)(?:\.|,|$)/, group: 1 },
      { pattern: /audience[:\s]+([\w\s]+?)(?:\.|,|$)/, group: 1 },
    ];

    for (const { pattern, group } of audiencePatterns) {
      const match = prompt.match(pattern);
      if (match && match[group]) {
        audience = match[group].trim();
        break;
      }
    }

    // Generate title from prompt
    const title = this.generateTitle(prompt);

    return {
      title,
      goal,
      tone,
      audience,
    };
  }

  /**
   * Generate title from prompt
   */
  private generateTitle(prompt: string): string {
    // Handle empty prompt
    if (!prompt || prompt.trim().length === 0) {
      return "Untitled Presentation";
    }

    // Extract first sentence or first 50 characters
    const firstSentence = prompt.split(/[.!?]/)[0].trim();
    const title = firstSentence.length > 50 ? firstSentence.substring(0, 50) + "..." : firstSentence;

    // Capitalize first letter
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  /**
   * @deprecated generateObject handles structured output — this is kept only for test compatibility
   */
  parseResponse(text: string): PrezVikBlueprint {
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("No JSON found");
      const parsed = JSON.parse(text.slice(start, end + 1));
      if (!parsed.version || parsed.version !== "2.0") throw new Error(`Invalid version "${parsed.version}", expected "2.0"`);
      if (!parsed.meta) throw new Error('Missing "version" field');
      if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) throw new Error('Missing or invalid "slides" field');
      return parsed as PrezVikBlueprint;
    } catch (error) {
      const preview = text.length > 200 ? text.substring(0, 200) + "..." : text;
      throw new BlueprintGenerationError(`Failed to parse Blueprint JSON: ${error instanceof Error ? error.message : String(error)}\nResponse preview: ${preview}`, text, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Select template based on keywords
   */
  private selectTemplate(keywords: Keywords): BlueprintTemplate {
    switch (keywords.presentationType) {
      case "pitch":
        return this.createPitchTemplate();
      case "report":
        return this.createReportTemplate();
      case "training":
        return this.createTrainingTemplate();
      default:
        return this.createGenericTemplate();
    }
  }

  /**
   * Fill template with extracted content
   */
  private fillTemplate(template: BlueprintTemplate, keywords: Keywords): PrezVikBlueprint {
    const slides = template.slides.slice(0, keywords.slideCount);

    // Use fallback text if topic is empty
    const topicText = keywords.topic || "Presentation";

    return {
      version: "2.0",
      meta: {
        title: keywords.topic || "Untitled Presentation",
        language: "en",
        goal: keywords.goal,
        tone: keywords.tone,
        audience: keywords.audience,
      },
      slides: slides.map((slide, index) => ({
        ...slide,
        id: `s${index + 1}`,
        intent: slide.intent.replace("{topic}", topicText),
        content: slide.content.map((block) => {
          if (block.type === "heading" || block.type === "text") {
            return {
              ...block,
              value: block.value.replace("{topic}", topicText),
            };
          }
          return block;
        }),
      })),
    };
  }

  /**
   * Create pitch deck template
   */
  private createPitchTemplate(): BlueprintTemplate {
    return {
      slides: [
        {
          id: "s1",
          type: "hero",
          intent: "Introduce {topic}",
          layout: "center_focus",
          content: [
            { type: "heading", value: "{topic}", level: "h1", emphasis: "high" },
            { type: "text", value: "Transforming the future", emphasis: "medium" },
          ],
        },
        {
          id: "s2",
          type: "content",
          intent: "Explain the problem",
          layout: "two_column",
          content: [
            { type: "heading", value: "The Problem", level: "h2", emphasis: "high" },
            {
              type: "bullets",
              items: [
                { text: "Current challenges in the market", icon: "⚠️" },
                { text: "Unmet customer needs", icon: "🎯" },
                { text: "Opportunity for innovation", icon: "💡" },
              ],
            },
          ],
        },
        {
          id: "s3",
          type: "content",
          intent: "Present the solution",
          layout: "two_column",
          content: [
            { type: "heading", value: "Our Solution", level: "h2", emphasis: "high" },
            {
              type: "bullets",
              items: [
                { text: "Innovative approach", icon: "🚀" },
                { text: "Proven technology", icon: "✅" },
                { text: "Scalable platform", icon: "📈" },
              ],
            },
          ],
        },
        {
          id: "s4",
          type: "data",
          intent: "Show traction and metrics",
          layout: "stat_highlight",
          content: [
            { type: "heading", value: "Traction", level: "h2", emphasis: "high" },
            { type: "stat", value: "10K+", label: "Active Users", visualWeight: "hero" },
            { type: "stat", value: "95%", label: "Customer Satisfaction", visualWeight: "emphasis" },
            { type: "stat", value: "$2M", label: "Annual Revenue", visualWeight: "emphasis" },
          ],
        },
        {
          id: "s5",
          type: "closing",
          intent: "Call to action",
          layout: "center_focus",
          content: [
            { type: "heading", value: "Let's Build Together", level: "h1", emphasis: "high" },
            { type: "text", value: "Join us in transforming the industry", emphasis: "medium" },
          ],
        },
      ],
    };
  }

  /**
   * Create report template
   */
  private createReportTemplate(): BlueprintTemplate {
    return {
      slides: [
        {
          id: "s1",
          type: "hero",
          intent: "Introduce {topic}",
          layout: "center_focus",
          content: [
            { type: "heading", value: "{topic}", level: "h1", emphasis: "high" },
            { type: "text", value: "Comprehensive Analysis", emphasis: "medium" },
          ],
        },
        {
          id: "s2",
          type: "section",
          intent: "Section divider",
          layout: "center_focus",
          content: [{ type: "heading", value: "Executive Summary", level: "h1", emphasis: "high" }],
        },
        {
          id: "s3",
          type: "data",
          intent: "Present key metrics",
          layout: "stat_highlight",
          content: [
            { type: "heading", value: "Key Metrics", level: "h2", emphasis: "high" },
            { type: "stat", value: "100%", label: "Completion Rate", visualWeight: "hero" },
            { type: "stat", value: "25%", label: "Growth YoY", visualWeight: "emphasis" },
            { type: "stat", value: "500+", label: "Data Points", visualWeight: "normal" },
          ],
        },
        {
          id: "s4",
          type: "content",
          intent: "Detailed findings",
          layout: "two_column",
          content: [
            { type: "heading", value: "Key Findings", level: "h2", emphasis: "high" },
            {
              type: "bullets",
              items: [
                { text: "Strong performance across all metrics", icon: "📊" },
                { text: "Identified areas for improvement", icon: "🔍" },
                { text: "Recommended next steps", icon: "➡️" },
              ],
            },
          ],
        },
        {
          id: "s5",
          type: "closing",
          intent: "Conclusion and recommendations",
          layout: "center_focus",
          content: [
            { type: "heading", value: "Recommendations", level: "h1", emphasis: "high" },
            { type: "text", value: "Strategic actions for continued success", emphasis: "medium" },
          ],
        },
      ],
    };
  }

  /**
   * Create training template
   */
  private createTrainingTemplate(): BlueprintTemplate {
    return {
      slides: [
        {
          id: "s1",
          type: "hero",
          intent: "Introduce {topic}",
          layout: "center_focus",
          content: [
            { type: "heading", value: "{topic}", level: "h1", emphasis: "high" },
            { type: "text", value: "Training Session", emphasis: "medium" },
          ],
        },
        {
          id: "s2",
          type: "content",
          intent: "Learning objectives",
          layout: "two_column",
          content: [
            { type: "heading", value: "Learning Objectives", level: "h2", emphasis: "high" },
            {
              type: "bullets",
              items: [
                { text: "Understand core concepts", icon: "📚" },
                { text: "Apply practical skills", icon: "🛠️" },
                { text: "Master best practices", icon: "⭐" },
              ],
            },
          ],
        },
        {
          id: "s3",
          type: "content",
          intent: "Main content",
          layout: "two_column",
          content: [
            { type: "heading", value: "Key Concepts", level: "h2", emphasis: "high" },
            {
              type: "bullets",
              items: [
                { text: "Fundamental principles", icon: "🎯" },
                { text: "Real-world applications", icon: "🌍" },
                { text: "Common challenges", icon: "⚠️" },
              ],
            },
          ],
        },
        {
          id: "s4",
          type: "content",
          intent: "Practical examples",
          layout: "two_column",
          content: [
            { type: "heading", value: "Practical Examples", level: "h2", emphasis: "high" },
            {
              type: "bullets",
              items: [
                { text: "Step-by-step walkthrough", icon: "👣" },
                { text: "Hands-on exercises", icon: "✋" },
                { text: "Tips and tricks", icon: "💡" },
              ],
            },
          ],
        },
        {
          id: "s5",
          type: "closing",
          intent: "Summary and next steps",
          layout: "center_focus",
          content: [
            { type: "heading", value: "Next Steps", level: "h1", emphasis: "high" },
            { type: "text", value: "Continue your learning journey", emphasis: "medium" },
          ],
        },
      ],
    };
  }

  /**
   * Create generic template
   */
  private createGenericTemplate(): BlueprintTemplate {
    return {
      slides: [
        {
          id: "s1",
          type: "hero",
          intent: "Introduce {topic}",
          layout: "center_focus",
          content: [
            { type: "heading", value: "{topic}", level: "h1", emphasis: "high" },
            { type: "text", value: "A comprehensive overview", emphasis: "medium" },
          ],
        },
        {
          id: "s2",
          type: "content",
          intent: "Main content",
          layout: "two_column",
          content: [
            { type: "heading", value: "Overview", level: "h2", emphasis: "high" },
            {
              type: "bullets",
              items: [
                { text: "Key point one", icon: "1️⃣" },
                { text: "Key point two", icon: "2️⃣" },
                { text: "Key point three", icon: "3️⃣" },
              ],
            },
          ],
        },
        {
          id: "s3",
          type: "content",
          intent: "Additional details",
          layout: "two_column",
          content: [
            { type: "heading", value: "Details", level: "h2", emphasis: "high" },
            {
              type: "bullets",
              items: [
                { text: "Important detail", icon: "📌" },
                { text: "Supporting information", icon: "📋" },
                { text: "Additional context", icon: "📝" },
              ],
            },
          ],
        },
        {
          id: "s4",
          type: "closing",
          intent: "Conclusion",
          layout: "center_focus",
          content: [
            { type: "heading", value: "Thank You", level: "h1", emphasis: "high" },
            { type: "text", value: "Questions?", emphasis: "medium" },
          ],
        },
      ],
    };
  }
}

interface BlueprintTemplate {
  slides: Slide[];
}
