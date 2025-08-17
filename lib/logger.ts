// lib/logger.ts

export type LogLevel = "info" | "warn" | "error" | "debug";

function format(level: LogLevel, message: string, meta?: unknown) {
  const time = new Date().toISOString();
  return `[${time}] [${level.toUpperCase()}] ${message} ${
    meta ? JSON.stringify(meta, null, 2) : ""
  }`;
}

export const logger = {
  info: (msg: string, meta?: unknown) => console.log(format("info", msg, meta)),
  warn: (msg: string, meta?: unknown) => console.warn(format("warn", msg, meta)),
  error: (msg: string, meta?: unknown) =>
    console.error(format("error", msg, meta)),
  debug: (msg: string, meta?: unknown) =>
    process.env.NODE_ENV === "development" &&
    console.debug(format("debug", msg, meta)),
};
