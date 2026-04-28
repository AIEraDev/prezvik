/**
 * Prezvik API Server
 *
 * Express.js API for Prezvik presentation generation system
 */

import express from "express";
import cors from "cors";
import { validateRouter } from "./routes/validate.js";
import { generateRouter } from "./routes/generate.js";
import { layoutsRouter } from "./routes/layouts.js";
import { themesRouter } from "./routes/themes.js";
import { aiRouter } from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/validate", validateRouter);
app.use("/api/generate", generateRouter);
app.use("/api/layouts", layoutsRouter);
app.use("/api/themes", themesRouter);
app.use("/api/ai", aiRouter);

// Health check
app.get("/api/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root
app.get("/", (_req: express.Request, res: express.Response) => {
  res.json({
    name: "Prezvik API",
    version: "0.1.0",
    endpoints: {
      health: "/api/health",
      validate: "/api/validate",
      generate: "/api/generate",
      layouts: "/api/layouts",
      themes: "/api/themes",
      ai: "/api/ai",
    },
  });
});

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[API Error]", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Prezvik API] Server running on http://localhost:${PORT}`);
  console.log(`[Prezvik API] Health check: http://localhost:${PORT}/api/health`);
});
