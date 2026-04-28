export const maxDuration = 120;

export async function POST(req: Request) {
  const { prompt, theme } = await req.json();
  if (!prompt?.trim()) return Response.json({ success: false, error: "No prompt" }, { status: 400 });
  try {
    const outputPath = `/tmp/prezvik-${Date.now()}.pptx`;
    const { getPipeline } = await import("@prezvik/core");
    await getPipeline().execute(prompt, { outputPath, themeName: theme || "executive" });
    const { readFileSync } = await import("fs");
    const file = readFileSync(outputPath).toString("base64");
    return Response.json({ success: true, file, fileName: "presentation.pptx" });
  } catch (e) {
    return Response.json({ success: false, error: String(e) }, { status: 500 });
  }
}
