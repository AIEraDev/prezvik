/**
 * AI Generation Endpoint
 *
 * POST /api/ai/generate
 * Generates a PrezVikBlueprint from a prompt using AI
 */

import { Router, Request, Response } from "express";
import { z } from "zod";

// Request schema
const GenerateRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  provider: z.enum(["openai", "anthropic", "groq"]).optional().default("openai"),
  apiKey: z.string().optional(),
  options: z
    .object({
      slideCount: z.number().min(1).max(50).optional().default(5),
      audience: z.string().optional(),
      goal: z.enum(["inform", "persuade", "educate", "pitch", "report"]).optional(),
      tone: z.enum(["formal", "modern", "bold", "minimal", "friendly"]).optional(),
    })
    .optional(),
});

const router: Router = Router();

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const result = GenerateRequestSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: result.error.errors,
      });
    }

    const { prompt, provider, options } = result.data;

    // TODO: Integrate with @prezvik/ai package
    // For now, return a placeholder response
    return res.json({
      message: "AI generation not yet implemented",
      prompt,
      provider,
      options,
    });
  } catch (error: any) {
    console.error("[AI Generate Error]", error);
    return res.status(500).json({
      error: "AI generation failed",
      message: error.message,
    });
  }
});

export { router as aiRouter };
