/**
 * Blueprint Generator
 *
 * Transforms user prompts into valid Blueprint v2 JSON using KyroAI
 */

import type { KyroBlueprint, Slide } from "@kyro/schema";
import type { KyroAI } from "../kyro-ai.js";
import type { RoutingStrategy } from "../adapters/types.js";

/**
 * Blueprint Generator configuration options
 *
 * @example
 * ```typescript
 * const options: BlueprintGeneratorOptions = {
 *   provider: "openai",
 *   temperature: 0.7,
 *   maxTokens: 2000,
 *   mockMode: false
 * };
 * ```
 */
export interface BlueprintGeneratorOptions {
  /**
   * AI provider for Blueprint generation
   * @default "openai"
   * @example "openai" | "anthropic" | "groq"
   */
  provider?: string;

  /**
   * Temperature for AI generation (0.0 - 1.0)
   * Higher values = more creative, lower values = more deterministic
   * @default 0.7
   */
  temperature?: number;

  /**
   * Maximum tokens for AI generation
   * @default 2000
   */
  maxTokens?: number;

  /**
   * Routing strategy for AI provider selection
   * @default "balanced"
   */
  strategy?: RoutingStrategy;
}

interface Keywords {
  slideCount: number;
  topic: string;
  presentationType: "pitch" | "report" | "training" | "generic";
  goal: KyroBlueprint["meta"]["goal"];
  tone: KyroBlueprint["meta"]["tone"];
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
 * const kyroAI = new KyroAI();
 * const generator = new BlueprintGenerator(kyroAI);
 *
 * // Generate with AI (requires API key)
 * const blueprint = await generator.generate("Create a pitch deck", {
 *   provider: "openai",
 *   temperature: 0.7
 * });
 * ```
 */
export class BlueprintGenerator {
  constructor(private kyroAI: KyroAI) {}

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
   * const generator = new BlueprintGenerator(kyroAI);
   *
   * // Generate with AI
   * const blueprint = await generator.generate(
   *   "Create a 5-slide pitch deck for AI startup",
   *   { provider: "openai", temperature: 0.7 }
   * );
   * ```
   */
  async generate(prompt: string, options: BlueprintGeneratorOptions = {}): Promise<KyroBlueprint> {
    try {
      // Infer meta information from prompt
      const meta = this.inferMeta(prompt);

      // Build system prompt with Blueprint schema
      const systemPrompt = this.buildSystemPrompt();

      // Generate Blueprint using KyroAI
      const response = await this.kyroAI.generateSlideDeck(`${systemPrompt}\n\nUser request: ${prompt}`, {
        provider: options.provider,
        strategy: options.strategy || "balanced",
      });

      // Parse response and extract JSON
      const blueprint = this.parseResponse(response);

      // Merge inferred meta with generated blueprint
      blueprint.meta = {
        ...meta,
        ...blueprint.meta,
      };

      return blueprint;
    } catch (error) {
      if (error instanceof BlueprintGenerationError) {
        throw error;
      }
      throw new BlueprintGenerationError(`Failed to generate Blueprint: ${error instanceof Error ? error.message : String(error)}`, prompt, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Generate Blueprint from template (mock mode)
   */
  generateFromTemplate(prompt: string): KyroBlueprint {
    // Extract keywords from prompt
    const keywords = this.extractKeywords(prompt);

    // Select appropriate template
    const template = this.selectTemplate(keywords);

    // Fill template with extracted content
    return this.fillTemplate(template, keywords);
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
    const topic = firstSentence.length > 50 ? firstSentence.substring(0, 50) : firstSentence;

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
   * Build system prompt with Blueprint v2 schema and examples
   */
  buildSystemPrompt(): string {
    return `You are a presentation design expert. Generate a Blueprint v2 JSON structure for presentations.

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no explanations, no code blocks
2. Use Blueprint v2 schema with version "2.0"
3. Include meta object with title, goal, tone, and audience
4. Each slide must have: id, type, intent, layout, and content array
5. Content blocks must be typed: heading, text, bullets, quote, stat, or code

META FIELD VALUES:
- goal: Must be one of ["inform", "persuade", "educate", "pitch", "report"]
- tone: Must be one of ["formal", "modern", "bold", "minimal", "friendly"]
- audience: Optional string describing target audience

SLIDE TYPES:
- hero: Opening slide with main title
- section: Section divider
- content: Main content slide
- comparison: Side-by-side comparison
- grid: Grid layout for multiple items
- quote: Testimonial or quote
- data: Data visualization or stats
- callout: Important highlight
- closing: Final slide

LAYOUT TYPES:
- center_focus: Centered content
- two_column: Two-column layout
- three_column: Three-column layout
- split_screen: 50/50 split
- grid_2x2: 2x2 grid
- hero_overlay: Hero image with text overlay
- timeline: Timeline layout
- stat_highlight: Large stat display
- image_dominant: Image-focused layout

CONTENT BLOCK TYPES:
- heading: { type: "heading", value: "text", level: "h1"|"h2"|"h3", emphasis: "low"|"medium"|"high" }
- text: { type: "text", value: "text", emphasis: "low"|"medium"|"high" }
- bullets: { type: "bullets", items: [{ text: "item", icon?: "emoji", highlight?: true }] }
- quote: { type: "quote", text: "quote", author?: "name", role?: "title" }
- stat: { type: "stat", value: "number", label: "description", visualWeight: "normal"|"emphasis"|"hero" }
- code: { type: "code", code: "code", language?: "javascript" }

EXAMPLE OUTPUT:
{
  "version": "2.0",
  "meta": {
    "title": "AI in Education",
    "goal": "educate",
    "tone": "friendly",
    "audience": "educators"
  },
  "slides": [
    {
      "id": "s1",
      "type": "hero",
      "intent": "Introduce the topic of AI in education",
      "layout": "center_focus",
      "content": [
        { "type": "heading", "value": "AI in Education", "level": "h1", "emphasis": "high" },
        { "type": "text", "value": "Transforming learning for the future", "emphasis": "medium" }
      ]
    },
    {
      "id": "s2",
      "type": "content",
      "intent": "Explain key benefits of AI in education",
      "layout": "two_column",
      "content": [
        { "type": "heading", "value": "Key Benefits", "level": "h2" },
        { 
          "type": "bullets", 
          "items": [
            { "text": "Personalized learning paths", "icon": "🎯" },
            { "text": "Real-time feedback", "icon": "⚡" },
            { "text": "Adaptive assessments", "icon": "📊" }
          ]
        }
      ]
    }
  ]
}`;
  }

  /**
   * Infer meta information from prompt
   */
  inferMeta(prompt: string): Partial<KyroBlueprint["meta"]> {
    const lowerPrompt = prompt.toLowerCase();

    // Infer goal
    let goal: KyroBlueprint["meta"]["goal"] = "inform";
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
    let tone: KyroBlueprint["meta"]["tone"] = "modern";
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
    // Extract first sentence or first 50 characters
    const firstSentence = prompt.split(/[.!?]/)[0].trim();
    const title = firstSentence.length > 50 ? firstSentence.substring(0, 50) + "..." : firstSentence;

    // Capitalize first letter
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  /**
   * Parse AI response and extract Blueprint JSON
   */
  parseResponse(text: string): KyroBlueprint {
    try {
      // Remove markdown code blocks if present
      let jsonText = text.trim();

      // Remove ```json and ``` markers
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\s*\n/, "").replace(/\n```\s*$/, "");
      }

      // Parse JSON
      const parsed = JSON.parse(jsonText);

      // Basic validation
      if (!parsed.version || parsed.version !== "2.0") {
        throw new Error('Invalid Blueprint: missing or incorrect "version" field (must be "2.0")');
      }

      if (!parsed.meta || typeof parsed.meta !== "object") {
        throw new Error('Invalid Blueprint: missing or invalid "meta" field');
      }

      if (!Array.isArray(parsed.slides)) {
        throw new Error('Invalid Blueprint: missing or invalid "slides" field (must be array)');
      }

      return parsed as KyroBlueprint;
    } catch (error) {
      throw new BlueprintGenerationError(`Failed to parse Blueprint JSON: ${error instanceof Error ? error.message : String(error)}`, text, error instanceof Error ? error : undefined);
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
  private fillTemplate(template: BlueprintTemplate, keywords: Keywords): KyroBlueprint {
    const slides = template.slides.slice(0, keywords.slideCount);

    return {
      version: "2.0",
      meta: {
        title: keywords.topic,
        language: "en",
        goal: keywords.goal,
        tone: keywords.tone,
        audience: keywords.audience,
      },
      slides: slides.map((slide, index) => ({
        ...slide,
        id: `s${index + 1}`,
        intent: slide.intent.replace("{topic}", keywords.topic),
        content: slide.content.map((block) => {
          if (block.type === "heading" || block.type === "text") {
            return {
              ...block,
              value: block.value.replace("{topic}", keywords.topic),
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
