import { randomUUID } from "crypto";

/**
 * Generate a UUID v4 trace ID for workflow tracking
 */
export function generateTraceId(): string {
  return randomUUID();
}

/**
 * Validate trace ID format (UUID v4)
 */
export function isValidTraceId(traceId: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(traceId);
}
