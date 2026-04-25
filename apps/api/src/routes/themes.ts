/**
 * Themes Endpoint
 *
 * GET /api/themes
 * Returns available themes
 */

import { Router, Response } from "express";
import { themes } from "@kyro/design";

const router: Router = Router();

router.get("/", async (_req: any, res: Response) => {
  try {
    const themeNames = Object.keys(themes);

    res.json({
      themes: themeNames,
      count: themeNames.length,
    });
  } catch (error: any) {
    console.error("[Themes Error]", error);
    res.status(500).json({
      error: "Failed to list themes",
      message: error.message,
    });
  }
});

export { router as themesRouter };
