import { promises as fs } from "fs";
import { logger } from "../logging/logger.js";
import { ToolHandler } from "./index.js";
import { z } from "zod";

interface ValidateConfigArgs {
  config_path?: string;
  config_content?: string;
}

// Zod schema for ORI configuration
const OriConfigSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  sme_agents: z.object({
    enabled: z.boolean(),
    security: z.object({
      enabled: z.boolean(),
      auto_invoke_on_keywords: z.array(z.string()).optional(),
      auto_invoke_on_risk_flags: z.array(z.string()).optional(),
      block_on_critical: z.boolean().optional(),
    }).optional(),
    compliance: z.object({
      enabled: z.boolean(),
      auto_invoke_on_keywords: z.array(z.string()).optional(),
      auto_invoke_on_risk_flags: z.array(z.string()).optional(),
    }).optional(),
    code_quality: z.object({
      enabled: z.boolean(),
      complexity_threshold: z.number().optional(),
    }).optional(),
    performance: z.object({
      enabled: z.boolean(),
      auto_invoke_on_keywords: z.array(z.string()).optional(),
    }).optional(),
  }),
  safety_hooks: z.object({
    enabled: z.boolean(),
    pre_phase: z.record(z.array(z.string())).optional(),
    post_phase: z.record(z.array(z.string())).optional(),
    emergency: z.array(z.string()).optional(),
  }).optional(),
  logging: z.object({
    enabled: z.boolean(),
    log_directory: z.string().optional(),
    retention_days: z.number().optional(),
    log_handoff_packets: z.boolean().optional(),
    log_sme_reviews: z.boolean().optional(),
  }).optional(),
});

/**
 * Validate ORI Configuration Tool
 */
export const validateConfigTool: ToolHandler = async (args: ValidateConfigArgs) => {
  logger.info("Validate config tool invoked", {
    has_path: !!args.config_path,
    has_content: !!args.config_content,
  });

  try {
    let configContent: string;

    // Load config from file or use provided content
    if (args.config_path) {
      configContent = await fs.readFile(args.config_path, "utf-8");
    } else if (args.config_content) {
      configContent = args.config_content;
    } else {
      return {
        content: [
          {
            type: "text",
            text: "Error: Either config_path or config_content must be provided",
          },
        ],
        isError: true,
      };
    }

    // Parse JSON
    let configJson: any;
    try {
      configJson = JSON.parse(configContent);
    } catch (parseError) {
      return {
        content: [
          {
            type: "text",
            text: `Invalid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          },
        ],
        isError: true,
      };
    }

    // Validate against schema
    const result = OriConfigSchema.safeParse(configJson);

    if (result.success) {
      // Valid config
      const warnings: string[] = [];

      // Check for common issues
      if (result.data.sme_agents.enabled) {
        const anySmeEnabled =
          result.data.sme_agents.security?.enabled ||
          result.data.sme_agents.compliance?.enabled ||
          result.data.sme_agents.code_quality?.enabled ||
          result.data.sme_agents.performance?.enabled;

        if (!anySmeEnabled) {
          warnings.push("sme_agents.enabled is true but no specific SME agents are enabled");
        }
      }

      if (result.data.logging?.enabled && !result.data.logging.log_directory) {
        warnings.push("Logging enabled but log_directory not specified (will use default)");
      }

      return {
        content: [
          {
            type: "text",
            text: `✓ Configuration is valid\n${warnings.length > 0 ? `\nWarnings:\n${warnings.map((w) => `- ${w}`).join("\n")}` : ""}`,
          },
        ],
        _meta: {
          valid: true,
          warnings,
        },
      };
    } else {
      // Invalid config
      const errors = result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      return {
        content: [
          {
            type: "text",
            text: `✗ Configuration is invalid\n\nErrors:\n${errors.map((e) => `- ${e.path}: ${e.message}`).join("\n")}`,
          },
        ],
        isError: true,
        _meta: {
          valid: false,
          errors,
        },
      };
    }
  } catch (error) {
    logger.error("Validate config tool failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      content: [
        {
          type: "text",
          text: `Error validating config: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
};
