import { NextRequest, NextResponse } from "next/server";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const TEMP_DIR = path.join(os.tmpdir(), "prezvik-preview");

export async function GET(request: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;

    // Validate fileId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(fileId)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const filePath = path.join(TEMP_DIR, `${fileId}.pptx`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found or expired" }, { status: 404 });
    }

    // Check file age (expire after 1 hour)
    const stats = fs.statSync(filePath);
    const fileAge = Date.now() - stats.mtimeMs;
    const MAX_AGE = 60 * 60 * 1000; // 1 hour

    if (fileAge > MAX_AGE) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ error: "File expired" }, { status: 404 });
    }

    // For now, return basic file info
    // TODO: Generate actual thumbnails using pptx2json or similar
    return NextResponse.json({
      thumbnails: [],
      message: "Thumbnail generation coming soon",
    });
  } catch (error: unknown) {
    console.error("[Thumbnail Error]", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to get thumbnails", message }, { status: 500 });
  }
}
