/**
 * Generate PPTX Endpoint
 *
 * POST /api/generate
 * Generates a PPTX file from a PrezVikBlueprint and returns it as a download
 */

import { Router, Request, Response } from "express";
import { generateDeck } from "@prezvik/core";

const router: Router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { blueprint } = req.body;

    if (!blueprint) {
      return res.status(400).json({ error: "Blueprint is required" });
    }

    // Generate PPTX to a temporary file
    const outputPath = `/tmp/prezvik-${Date.now()}.pptx`;
    await generateDeck(blueprint, outputPath);

    // Send the file as a download
    return res.download(outputPath, "presentation.pptx", (err: Error | null) => {
      if (err) {
        console.error("[Download Error]", err);
      }
      // Clean up the temporary file
      try {
        // Note: In production, you might want to use a proper cleanup mechanism
        // For now, we'll let the OS handle temp file cleanup
      } catch (cleanupError) {
        console.error("[Cleanup Error]", cleanupError);
      }
    });
  } catch (error: any) {
    console.error("[Generate Error]", error);
    return res.status(500).json({
      error: "Generation failed",
      message: error.message,
    });
  }
});

export { router as generateRouter };
