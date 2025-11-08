import { executeOriTool } from "./execute-ori.js";
import { validateConfigTool } from "./validate-config.js";
import { analyzeTaskTool } from "./analyze-task.js";

export type ToolHandler = (args: any) => Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
  _meta?: Record<string, any>;
}>;

export async function registerTools(): Promise<Record<string, ToolHandler>> {
  return {
    execute_ori: executeOriTool,
    validate_config: validateConfigTool,
    analyze_task: analyzeTaskTool,
  };
}
