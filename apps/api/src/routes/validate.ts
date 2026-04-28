/**
 * Validate Blueprint Endpoint
 *
 * POST /api/validate
 * Validates a PrezVikBlueprint using Zod and returns validation errors
 */

import { Router, Request, Response } from "express";
import { PrezVikBlueprintSchema } from "@prezvik/schema";

const router: Router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const blueprint = req.body;

    // Validate using Zod
    const result = PrezVikBlueprintSchema.safeParse(blueprint);

    if (!result.success) {
      return res.status(400).json({
        valid: false,
        errors: result.error.errors,
      });
    }

    return res.json({
      valid: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error("[Validate Error]", error);
    return res.status(500).json({
      error: "Validation failed",
      message: error.message,
    });
  }
});

export { router as validateRouter };
