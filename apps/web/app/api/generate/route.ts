import { NextRequest, NextResponse } from "next/server";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export async function POST(request: NextRequest) {
  try {
    const { blueprint } = await request.json();

    if (!blueprint) {
      return NextResponse.json({ error: "Blueprint is required" }, { status: 400 });
    }

    // Validate with Zod
    const { KyroBlueprintSchema } = await import("@kyro/schema");
    const validationResult = KyroBlueprintSchema.safeParse(blueprint);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid blueprint",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const validatedBlueprint = validationResult.data;
    const { generateDeck } = await import("@kyro/core");
    const outputPath = path.join(os.tmpdir(), `kyro-${Date.now()}.pptx`);
    await generateDeck(validatedBlueprint, outputPath);

    const fileBuffer = fs.readFileSync(outputPath);

    try {
      fs.unlinkSync(outputPath);
    } catch (cleanupError) {
      console.error("[Cleanup Error]", cleanupError);
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": 'attachment; filename="presentation.pptx"',
      },
    });
  } catch (error: unknown) {
    console.error("[Generate Error]", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to generate presentation", message }, { status: 500 });
  }
}
