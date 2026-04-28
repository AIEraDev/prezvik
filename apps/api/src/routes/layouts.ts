/**
 * Generate Layouts Endpoint
 *
 * POST /api/layouts
 * Generates layouts only (for preview) without rendering to PPTX
 */

import { Router, Request, Response } from "express";
import { generateLayouts } from "@prezvik/core";

const router: Router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { blueprint } = req.body;

    if (!blueprint) {
      return res.status(400).json({ error: "Blueprint is required" });
    }

    // Generate layouts only
    const layouts = generateLayouts(blueprint);

    return res.json({
      layouts,
      count: layouts.length,
    });
  } catch (error: any) {
    console.error("[Layouts Error]", error);
    return res.status(500).json({
      error: "Layout generation failed",
      message: error.message,
    });
  }
});

export { router as layoutsRouter };
