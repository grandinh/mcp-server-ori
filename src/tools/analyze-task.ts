import { logger } from "../logging/logger.js";
import { ToolHandler } from "./index.js";

interface AnalyzeTaskArgs {
  task: string;
}

/**
 * Analyze Task Tool
 *
 * Performs pre-flight analysis to determine:
 * - Complexity (LOW/MEDIUM/HIGH)
 * - Domain classification
 * - Clarity score (0-1)
 * - Risk flags
 * - Recommended model
 * - Estimated duration
 */
export const analyzeTaskTool: ToolHandler = async (args: AnalyzeTaskArgs) => {
  logger.info("Analyze task tool invoked", {
    task_length: args.task.length,
  });

  try {
    const analysis = analyzeTask(args.task);

    const output = `# Task Analysis

**Task:** ${args.task.substring(0, 200)}${args.task.length > 200 ? "..." : ""}

## Results

- **Complexity:** ${analysis.complexity}
- **Domain:** ${analysis.domain}
- **Clarity Score:** ${analysis.clarity_score.toFixed(2)} / 1.00
- **Risk Flags:** ${analysis.risk_flags.length > 0 ? analysis.risk_flags.join(", ") : "None"}
- **Recommended Model:** ${analysis.recommended_model}
- **Estimated Duration:** ${analysis.estimated_duration_minutes} minutes

## Recommendations

${generateRecommendations(analysis)}
`;

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
      _meta: analysis,
    };
  } catch (error) {
    logger.error("Analyze task tool failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      content: [
        {
          type: "text",
          text: `Error analyzing task: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
};

/**
 * Analyze task characteristics
 */
function analyzeTask(task: string): {
  complexity: "LOW" | "MEDIUM" | "HIGH";
  domain: string;
  clarity_score: number;
  risk_flags: string[];
  recommended_model: "opus" | "sonnet" | "haiku";
  estimated_duration_minutes: number;
} {
  const taskLower = task.toLowerCase();

  // Determine complexity
  const complexityIndicators = {
    high: ["refactor", "architecture", "migrate", "complex", "multiple", "entire", "redesign"],
    medium: ["implement", "add", "create", "build", "update", "enhance"],
    low: ["fix", "update", "change", "modify", "small", "simple"],
  };

  let complexity: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  if (complexityIndicators.high.some((word) => taskLower.includes(word))) {
    complexity = "HIGH";
  } else if (complexityIndicators.low.some((word) => taskLower.includes(word))) {
    complexity = "LOW";
  }

  // Determine domain
  const domainKeywords: Record<string, string[]> = {
    "Security/Auth": ["auth", "security", "jwt", "oauth", "password", "encryption", "crypto"],
    "API/Backend": ["api", "endpoint", "backend", "server", "database", "query"],
    "Frontend/UI": ["ui", "frontend", "component", "react", "vue", "angular", "css"],
    "DevOps/Infrastructure": ["deploy", "docker", "kubernetes", "ci/cd", "pipeline", "infrastructure"],
    "Data/Analytics": ["data", "analytics", "chart", "graph", "visualization", "report"],
    "Testing": ["test", "testing", "unit test", "integration test", "e2e"],
  };

  let domain = "General";
  for (const [domainName, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some((keyword) => taskLower.includes(keyword))) {
      domain = domainName;
      break;
    }
  }

  // Calculate clarity score
  let clarity_score = 0.5; // Base score

  // Increase for specific terms
  if (taskLower.match(/\b(add|create|implement|fix|remove|update)\b/)) {
    clarity_score += 0.2;
  }

  // Increase for specific entities
  if (taskLower.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/)) {
    clarity_score += 0.1;
  }

  // Decrease for vague terms
  if (taskLower.match(/\b(improve|enhance|optimize|better)\b/)) {
    clarity_score -= 0.1;
  }

  // Increase for specific constraints
  if (taskLower.includes("using") || taskLower.includes("with")) {
    clarity_score += 0.1;
  }

  clarity_score = Math.max(0, Math.min(1, clarity_score));

  // Detect risk flags
  const risk_flags: string[] = [];

  if (taskLower.match(/\b(auth|password|jwt|oauth|crypto|encryption|security)\b/)) {
    risk_flags.push("security");
  }

  if (taskLower.match(/\b(gdpr|ccpa|privacy|pii|personal data)\b/)) {
    risk_flags.push("privacy");
  }

  if (taskLower.match(/\b(license|compliance|legal)\b/)) {
    risk_flags.push("compliance");
  }

  if (taskLower.match(/\b(user data|sensitive|confidential)\b/)) {
    risk_flags.push("policy");
  }

  // Recommend model based on complexity
  let recommended_model: "opus" | "sonnet" | "haiku";
  if (complexity === "HIGH" || risk_flags.length > 0) {
    recommended_model = "opus";
  } else if (complexity === "MEDIUM") {
    recommended_model = "sonnet";
  } else {
    recommended_model = "haiku";
  }

  // Estimate duration (in minutes)
  const baseTime = {
    LOW: 3,
    MEDIUM: 5,
    HIGH: 8,
  };

  let estimated_duration_minutes = baseTime[complexity];

  // Add time for SME reviews if risk flags present
  if (risk_flags.length > 0) {
    estimated_duration_minutes += 2;
  }

  return {
    complexity,
    domain,
    clarity_score,
    risk_flags,
    recommended_model,
    estimated_duration_minutes,
  };
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(analysis: ReturnType<typeof analyzeTask>): string {
  const recommendations: string[] = [];

  if (analysis.clarity_score < 0.6) {
    recommendations.push("⚠️ **Low clarity score.** Consider asking clarifying questions before proceeding.");
  }

  if (analysis.risk_flags.length > 0) {
    recommendations.push(
      `🛡️ **Risk flags detected:** ${analysis.risk_flags.join(", ")}. Enable SME quality gates for this workflow.`
    );
  }

  if (analysis.complexity === "HIGH") {
    recommendations.push("📊 **High complexity.** Consider breaking this into multiple smaller tasks.");
  }

  if (analysis.recommended_model === "opus") {
    recommendations.push("🧠 **Recommended model: Opus.** This task requires deep reasoning and careful planning.");
  }

  if (recommendations.length === 0) {
    recommendations.push("✓ Task appears well-defined and ready for execution.");
  }

  return recommendations.map((r) => `- ${r}`).join("\n");
}
