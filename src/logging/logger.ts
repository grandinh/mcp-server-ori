import winston from "winston";

/**
 * Winston logger configured for MCP server
 * CRITICAL: All logs MUST go to stderr, never stdout (breaks JSON-RPC protocol)
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // ALL output goes to stderr!
    new winston.transports.Stream({
      stream: process.stderr,
    }),
  ],
});

// Helper for development mode (pretty print)
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Stream({
      stream: process.stderr,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}
