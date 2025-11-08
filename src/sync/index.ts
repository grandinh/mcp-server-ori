import { logger } from "../logging/logger.js";
import { watchFiles } from "./file-watcher.js";

/**
 * Initialize sync mechanism
 *
 * Watches for changes to ORI resource files and syncs them to:
 * 1. GitHub repository (git commit + push)
 * 2. NPM registry (version bump + publish)
 * 3. MCP server (hot reload)
 *
 * NOTE: This is disabled by default. Enable with ENABLE_SYNC=true environment variable.
 */
export async function initSync(): Promise<void> {
  logger.info("Initializing sync mechanism");

  try {
    // Start file watcher
    await watchFiles();

    logger.info("Sync mechanism initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize sync mechanism", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
