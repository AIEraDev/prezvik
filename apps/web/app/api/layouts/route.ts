import { NextRequest, NextResponse } from "next/server";

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
    const { generateLayouts } = await import("@kyro/core");
    const layouts = generateLayouts(validatedBlueprint);

    return NextResponse.json({ layouts, count: layouts.length });
  } catch (error: unknown) {
    console.error("[Layouts Error]", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to list layouts", message }, { status: 500 });
  }
}
