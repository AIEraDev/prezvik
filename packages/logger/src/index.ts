import pino from "pino";

export interface LoggerOptions {
  level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  context?: string;
}

/**
 * Create a logger instance
 */
export function createLogger(options: LoggerOptions = {}): pino.Logger {
  const level = options.level || (process.env.LOG_LEVEL as any) || "info";
  const context = options.context || "default";

  return pino({
    level,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      pid: process.pid,
      hostname: process.env.HOSTNAME || "unknown",
    },
  }, pino.transport({
    target: "pino-pretty",
    options: {
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
      colorize: true,
    },
  })).child({ context });
}

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * Create a child logger with additional context
 */
export function childLogger(parent: pino.Logger, context: string): pino.Logger {
  return parent.child({ context });
}
