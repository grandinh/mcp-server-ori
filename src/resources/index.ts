import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface StaticResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  filePath: string;
  read: () => Promise<string>;
}

export interface DynamicResource {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * Register static resources (ORI docs, schemas, configs)
 */
export async function registerStaticResources(): Promise<StaticResource[]> {
  const resourcesDir = path.join(__dirname, "../../resources");

  return [
    {
      uri: "docs://ori/workflow",
      name: "ori-workflow-documentation",
      description: "Complete ORI (Optimize-Research-Implement) workflow specification",
      mimeType: "text/markdown",
      filePath: path.join(resourcesDir, "ori.md"),
      read: async function () {
        return await fs.readFile(this.filePath, "utf-8");
      },
    },
    {
      uri: "docs://ori/agents/taxonomy",
      name: "agent-taxonomy",
      description: "Agent taxonomy: Skills vs Commands vs Agents",
      mimeType: "text/markdown",
      filePath: path.join(resourcesDir, "agents/README.md"),
      read: async function () {
        return await fs.readFile(this.filePath, "utf-8");
      },
    },
    {
      uri: "docs://ori/agents/sme-security",
      name: "security-sme-specification",
      description: "Security SME agent specification (OWASP Top 10)",
      mimeType: "text/markdown",
      filePath: path.join(resourcesDir, "agents/sme-security.md"),
      read: async function () {
        return await fs.readFile(this.filePath, "utf-8");
      },
    },
    {
      uri: "schema://ori/config",
      name: "ori-config-schema",
      description: "ORI configuration schema with SME settings",
      mimeType: "application/json",
      filePath: path.join(resourcesDir, "ori-config.json"),
      read: async function () {
        return await fs.readFile(this.filePath, "utf-8");
      },
    },
    {
      uri: "schema://ori/handoff-packet",
      name: "handoff-packet-schema",
      description: "JSON Schema for ORI handoff packets (inter-phase context transfer)",
      mimeType: "application/json",
      filePath: path.join(resourcesDir, "schemas/handoff-packet.json"),
      read: async function () {
        return await fs.readFile(this.filePath, "utf-8");
      },
    },
  ];
}

/**
 * Register dynamic resources (workflow logs, handoff packets, SME reviews)
 *
 * NOTE: These are templates for future implementation.
 * In a real deployment, these would read from a logs directory.
 */
export async function registerDynamicResources(): Promise<DynamicResource[]> {
  return [
    {
      uriTemplate: "logs://workflow/{traceId}/execution",
      name: "workflow-execution-logs",
      description: "Detailed execution logs for a specific workflow run",
      mimeType: "text/plain",
    },
    {
      uriTemplate: "logs://workflow/{traceId}/handoff-packets",
      name: "workflow-handoff-packets",
      description: "All handoff packets generated during workflow execution",
      mimeType: "application/json",
    },
    {
      uriTemplate: "logs://workflow/{traceId}/sme-reviews",
      name: "workflow-sme-reviews",
      description: "SME review findings for a specific workflow",
      mimeType: "application/json",
    },
  ];
}
