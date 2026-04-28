import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createLogger } from "@prezvik/logger";
import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";

const logger = createLogger({ context: "API:ai/generate" });

// Save to project directory instead of system temp
const TEMP_DIR = path.join(process.cwd(), "generated-presentations");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  console.log(`[API] Created presentations directory: ${TEMP_DIR}`);
}

const GenerateRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  provider: z.enum(["openai", "anthropic", "groq", "gemini"]).optional().default("groq"),
  strategy: z.enum(["speed", "balanced", "quality"]).optional().default("speed"),
  options: z
    .object({
      slideCount: z.number().min(1).max(50).optional().default(5),
      audience: z.string().optional(),
      goal: z.enum(["inform", "persuade", "educate", "pitch", "report"]).optional(),
      tone: z.enum(["formal", "modern", "bold", "minimal", "friendly"]).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  console.log("\n========== [API /api/ai/generate] START ==========");
  try {
    const body = await request.json();
    console.log("[1] REQUEST BODY:", JSON.stringify(body, null, 2));

    const result = GenerateRequestSchema.safeParse(body);

    if (!result.success) {
      console.error("[1.1] VALIDATION FAILED:", result.error.errors);
      return NextResponse.json({ error: "Invalid request", details: result.error.errors }, { status: 400 });
    }

    const { prompt, provider, strategy, options } = result.data;
    console.log(`[2] PARSED INPUT - prompt: "${prompt.substring(0, 50)}...", provider: ${provider}, strategy: ${strategy}, options:`, options);

    // Use @prezvik/ai to generate the blueprint
    console.log("[3] IMPORTING @prezvik/ai...");
    const { getPrezVikAI } = await import("@prezvik/ai");
    const prezVikAI = getPrezVikAI();
    console.log("[3.1] PrezVikAI instantiated");

    const availableProviders = prezVikAI.getAvailableProviders();
    console.log("[4] AI PROVIDER STATUS:");
    console.log("    - Available providers:", availableProviders);
    console.log("    - Is available:", prezVikAI.isAvailable());
    console.log("    - Selected provider:", provider);
    console.log("    - OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
    console.log("    - ANTHROPIC_API_KEY exists:", !!process.env.ANTHROPIC_API_KEY);
    console.log("    - GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);
    console.log("    - GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);

    if (!prezVikAI.isAvailable()) {
      console.error("[4.1] NO AI PROVIDERS AVAILABLE");
      return NextResponse.json({ error: "AI service not available", message: "No AI provider configured. Please set API keys for OpenAI, Anthropic, or Groq." }, { status: 503 });
    }

    console.log(`[5] CALLING AI GENERATION with provider: ${provider}, strategy: ${strategy}`);
    const aiStartTime = Date.now();

    // Generate blueprint using structured outputs (returns valid PrezVikBlueprint directly)
    const blueprint = await prezVikAI.generateSlideDeck(prompt, { provider, strategy });

    const aiDuration = Date.now() - aiStartTime;
    console.log(`[5.1] BLUEPRINT GENERATED in ${aiDuration}ms:`);
    console.log("    - Title:", blueprint.meta?.title);
    console.log("    - Slides count:", blueprint.slides?.length);
    console.log("    - First slide ID:", blueprint.slides?.[0]?.id);

    // Extract blueprint info
    const slideCount = blueprint.slides?.length || 0;
    const title = blueprint.meta?.title || "AI Generated Presentation";

    // Skip Zod validation - layout strategies have different expectations than schema
    console.log("[8] IMPORTING @prezvik/core for generateDeck...");
    const { generateDeck } = await import("@prezvik/core");
    const fileId = randomUUID();
    const outputPath = path.join(TEMP_DIR, `${fileId}.pptx`);
    console.log(`[8.1] FILE ID: ${fileId}`);
    console.log(`[8.2] OUTPUT PATH: ${outputPath}`);

    try {
      console.log("[9] CALLING generateDeck...");
      const deckStartTime = Date.now();
      await generateDeck(blueprint, outputPath);
      const deckDuration = Date.now() - deckStartTime;
      console.log(`[9.1] PPTX GENERATED SUCCESSFULLY in ${deckDuration}ms`);
      console.log(`[9.2] File saved to: ${outputPath}`);
      logger.info({ fileId, slideCount }, "PPTX generated successfully");
    } catch (genError) {
      console.error("[9.1] GENERATE DECK ERROR:", genError);
      console.error("[9.2] Error stack:", genError instanceof Error ? genError.stack : "No stack");
      return NextResponse.json({ error: "Failed to generate PPTX", message: genError instanceof Error ? genError.message : String(genError) }, { status: 500 });
    }

    // For now, return file ID without thumbnails (will add thumbnail generation later)

    console.log("[10] RETURNING SUCCESS RESPONSE:");
    console.log("    - fileId:", fileId);
    console.log("    - slideCount:", slideCount);
    console.log("    - title:", title);
    console.log("========== [API /api/ai/generate] END ==========\n");

    return NextResponse.json({
      fileId,
      slideCount,
      title,
    });
  } catch (error: unknown) {
    console.error("[CRITICAL ERROR in /api/ai/generate]", error);
    console.error("[Error stack]", error instanceof Error ? error.stack : "No stack");
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "AI generation failed", message }, { status: 500 });
  }
}
