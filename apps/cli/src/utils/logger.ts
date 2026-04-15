/**
 * Logger Utilities
 *
 * Pretty console output
 */

export const log = {
  success: (msg: string) => console.log("✅", msg),
  error: (msg: string) => console.log("❌", msg),
  info: (msg: string) => console.log("ℹ️", msg),
  watch: (msg: string) => console.log("👀", msg),
  reload: (msg: string) => console.log("🔄", msg),
  rocket: (msg: string) => console.log("🚀", msg),
};

export function logError(error: any) {
  log.error(error.message || "Unknown error");
  if (error.stack && process.env.DEBUG) {
    console.error(error.stack);
  }
}
