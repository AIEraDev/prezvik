import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const blueprint = await request.json();
    const { PrezVikBlueprintSchema } = await import("@prezvik/schema");
    const result = PrezVikBlueprintSchema.safeParse(blueprint);

    if (!result.success) {
      return NextResponse.json({ valid: false, errors: result.error.errors }, { status: 400 });
    }

    return NextResponse.json({ valid: true, data: result.data });
  } catch (error: unknown) {
    console.error("[Validation Error]", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Validation failed", message }, { status: 500 });
  }
}
