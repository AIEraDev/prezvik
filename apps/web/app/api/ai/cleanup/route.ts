import { NextResponse } from "next/server";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const TEMP_DIR = path.join(os.tmpdir(), "kyro-preview");
const MAX_AGE = 60 * 60 * 1000; // 1 hour

export async function POST() {
  try {
    if (!fs.existsSync(TEMP_DIR)) {
      return NextResponse.json({ message: "No temp directory found", deleted: 0 });
    }

    const files = fs.readdirSync(TEMP_DIR);
    let deletedCount = 0;
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > MAX_AGE) {
        try {
          fs.unlinkSync(filePath);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete ${file}:`, error);
        }
      }
    }

    return NextResponse.json({
      message: "Cleanup completed",
      deleted: deletedCount,
      totalFiles: files.length,
    });
  } catch (error: unknown) {
    console.error("[Cleanup Error]", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Cleanup failed", message }, { status: 500 });
  }
}
