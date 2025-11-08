#!/usr/bin/env node

/**
 * MCP Server for ORI (Optimize-Research-Implement) Workflow
 *
 * This server exposes:
 * - Tools: execute_ori, validate_config, analyze_task
 * - Resources: ORI documentation, schemas, configurations
 * - Dynamic Resources: Workflow logs, handoff packets, SME reviews
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { logger } from "./logging/logger.js";
import { registerTools } from "./tools/index.js";
import { registerStaticResources, registerDynamicResources } from "./resources/index.js";
import { initSync } from "./sync/index.js";

const SERVER_NAME = "ori-workflow-server";
const SERVER_VERSION = "1.0.0";

/**
 * Initialize and start the MCP server
 */
async function main() {
  logger.info("Starting ORI MCP Server", {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create server instance
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Register request handlers

  // Tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug("ListTools request received");
    return {
      tools: [
        {
          name: "execute_ori",
          description: "Execute the complete ORI (Optimize-Research-Implement) workflow for a given task with optional SME quality gates",
          inputSchema: {
            type: "object",
            properties: {
              task: {
                type: "string",
                description: "The task or problem to solve using the ORI workflow",
                minLength: 10,
              },
              context: {
                type: "string",
                description: "Additional context or constraints for the task",
              },
              config: {
                type: "object",
                description: "Optional workflow configuration overrides",
                properties: {
                  sme_enabled: {
                    type: "boolean",
                    description: "Enable SME quality gates",
                    default: false,
                  },
                  security_sme: {
                    type: "boolean",
                    description: "Enable security SME specifically",
                    default: false,
                  },
                  logging: {
                    type: "boolean",
                    description: "Enable detailed logging",
                    default: true,
                  },
                  trace_id: {
                    type: "string",
                    description: "Optional trace ID (UUID v4)",
                    pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                  },
                },
              },
            },
            required: ["task"],
          },
        },
        {
          name: "validate_config",
          description: "Validate an ORI configuration file against the schema",
          inputSchema: {
            type: "object",
            properties: {
              config_path: {
                type: "string",
                description: "Path to ori-config.json file",
              },
              config_content: {
                type: "string",
                description: "Raw JSON config content to validate",
              },
            },
          },
        },
        {
          name: "analyze_task",
          description: "Analyze a task to determine complexity, domain, recommended model, and risk flags before execution",
          inputSchema: {
            type: "object",
            properties: {
              task: {
                type: "string",
                description: "The task to analyze",
                minLength: 10,
              },
            },
            required: ["task"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info("Tool execution requested", {
      tool: name,
      args: sanitizeArgs(args),
    });

    try {
      const tools = await registerTools();
      const tool = tools[name];

      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      const result = await tool(args as any);

      logger.info("Tool execution completed", {
        tool: name,
        success: !result.isError,
      });

      return result;
    } catch (error) {
      logger.error("Tool execution failed", {
        tool: name,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        content: [
          {
            type: "text",
            text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    logger.debug("ListResources request received");
    const staticResources = await registerStaticResources();

    return {
      resources: staticResources.map((r) => ({
        uri: r.uri,
        name: r.name,
        description: r.description,
        mimeType: r.mimeType,
      })),
    };
  });

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    logger.debug("ListResourceTemplates request received");
    const dynamicResources = await registerDynamicResources();

    return {
      resourceTemplates: dynamicResources.map((r) => ({
        uriTemplate: r.uriTemplate,
        name: r.name,
        description: r.description,
        mimeType: r.mimeType,
      })),
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    logger.debug("ReadResource request received", { uri });

    try {
      const staticResources = await registerStaticResources();
      const resource = staticResources.find((r) => r.uri === uri);

      if (!resource) {
        throw new Error(`Resource not found: ${uri}`);
      }

      const content = await resource.read();

      return {
        contents: [
          {
            uri,
            mimeType: resource.mimeType,
            text: content,
          },
        ],
      };
    } catch (error) {
      logger.error("Resource read failed", {
        uri,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  });

  // Initialize sync mechanism (if enabled)
  if (process.env.ENABLE_SYNC === "true") {
    logger.info("Sync mechanism enabled");
    await initSync();
  }

  // Connect to transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info("ORI MCP Server started successfully");
}

/**
 * Sanitize arguments for logging (remove sensitive data)
 */
function sanitizeArgs(args: any): any {
  if (!args || typeof args !== "object") {
    return args;
  }

  const sanitized = { ...args };
  const sensitiveKeys = ["api_key", "password", "token", "secret"];

  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = "[REDACTED]";
    }
  }

  return sanitized;
}

// Error handling
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", {
    reason: String(reason),
  });
  process.exit(1);
});

// Start server
main().catch((error) => {
  logger.error("Failed to start server", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
