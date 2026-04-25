import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { themes } = await import("@kyro/design");
    const themeNames = Object.keys(themes);

    return NextResponse.json({
      themes: themeNames,
      count: themeNames.length,
    });
  } catch (error: unknown) {
    console.error("[Themes Error]", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to list themes", message }, { status: 500 });
  }
}
