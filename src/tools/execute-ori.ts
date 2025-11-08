import { logger } from "../logging/logger.js";
import { generateTraceId, isValidTraceId } from "../logging/trace.js";
import { ToolHandler } from "./index.js";

interface ExecuteOriArgs {
  task: string;
  context?: string;
  config?: {
    sme_enabled?: boolean;
    security_sme?: boolean;
    logging?: boolean;
    trace_id?: string;
  };
}

/**
 * Execute ORI Workflow Tool
 *
 * NOTE: This is a SIMULATION for demonstration purposes.
 * In a real implementation, this would:
 * 1. Invoke Claude API with Phase 0 (Opus) to generate strategy
 * 2. Invoke Claude API with Phase 1 (Opus) for research
 * 3. Invoke Claude API with Phase 2 (Sonnet) for verification
 * 4. Optionally invoke SME agents (Phase 2.5)
 * 5. Invoke Claude API with Phase 3 (Sonnet) for implementation
 * 6. Invoke Claude API with Phase 4 (Haiku) for documentation
 *
 * Since this MCP server runs INSIDE Claude, having it call the Claude API
 * would create circular dependencies. Instead, this tool returns instructions
 * for Claude to follow the ORI workflow.
 */
export const executeOriTool: ToolHandler = async (args: ExecuteOriArgs) => {
  const startTime = Date.now();

  // Generate or validate trace ID
  const traceId = args.config?.trace_id && isValidTraceId(args.config.trace_id)
    ? args.config.trace_id
    : generateTraceId();

  logger.info("Execute ORI workflow started", {
    trace_id: traceId,
    task: args.task.substring(0, 100),
    sme_enabled: args.config?.sme_enabled ?? false,
  });

  try {
    // Build ORI workflow instructions
    const workflowInstructions = buildOriWorkflowInstructions(args, traceId);

    const duration = (Date.now() - startTime) / 1000;

    // Generate feedback URL
    const feedbackUrl = `https://github.com/grandinh/mcp-server-ori/issues/new?template=workflow-feedback.yml&trace_id=${traceId}`;

    logger.info("Execute ORI workflow completed", {
      trace_id: traceId,
      duration_seconds: duration,
    });

    return {
      content: [
        {
          type: "text",
          text: workflowInstructions,
        },
      ],
      _meta: {
        trace_id: traceId,
        duration_seconds: duration,
        feedback_url: feedbackUrl,
      },
    };
  } catch (error) {
    logger.error("Execute ORI workflow failed", {
      trace_id: traceId,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      content: [
        {
          type: "text",
          text: `Error executing ORI workflow: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
      _meta: {
        trace_id: traceId,
      },
    };
  }
};

/**
 * Build workflow instructions for Claude to execute
 */
function buildOriWorkflowInstructions(args: ExecuteOriArgs, traceId: string): string {
  const smeEnabled = args.config?.sme_enabled ?? false;
  const securitySme = args.config?.security_sme ?? false;

  return `# ORI Workflow Execution

**Trace ID:** \`${traceId}\`
**Task:** ${args.task}
${args.context ? `**Context:** ${args.context}\n` : ''}
**Configuration:**
- SME Quality Gates: ${smeEnabled ? 'ENABLED' : 'DISABLED'}
- Security SME: ${securitySme ? 'ENABLED' : 'DISABLED'}

---

## Workflow Instructions

Execute the following phases in sequence. Follow the complete ORI workflow specification from \`docs://ori/workflow\`.

### Phase 0: Strategy (Model: Opus)

**Your Task:**
1. Load configuration from \`schema://ori/config\`
2. Generate trace ID (already created): \`${traceId}\`
3. Initialize handoff packet using schema from \`schema://ori/handoff-packet\`
4. Analyze the task:
   - Parse query components
   - Classify domain
   - Compute clarity_score (0-1)
   - Detect risk_flags (policy/safety/privacy/compliance/security)
   - Assess complexity (LOW/MEDIUM/HIGH)
5. Design research strategy with specific questions
6. Recommend model for Phase 1 (Opus/Sonnet/Haiku)
7. Output structured strategy document

**Handoff:** Pass strategy + handoff packet to Phase 1

---

### Phase 1: Research (Model: Recommended from Phase 0)

**Your Task:**
1. Execute research strategy from Phase 0
2. Answer all research questions comprehensively
3. Gather code examples, patterns, documentation
4. Map findings to implementation approach
5. Update handoff packet with research findings

**Handoff:** Pass research + handoff packet to Phase 2

---

### Phase 2: Verification (Model: Sonnet)

**Your Task:**
1. Cross-validate research findings
2. Assess security implications
3. Evaluate performance impact
4. Confirm backward compatibility
5. Make GO/NO-GO decision for Phase 3

**Handoff:** Pass verification + handoff packet to Phase 2.5 (if SME enabled) or Phase 3

---

${smeEnabled ? `### Phase 2.5: SME Quality Gate (CONDITIONAL)

**Trigger Conditions:**
- \`sme_agents.enabled: true\` in config
- Risk flags match SME keywords OR explicit SME request

**Your Task:**
1. Load SME configuration
2. Determine applicable SME agents:
${securitySme ? '   - ✓ Security SME (ENABLED) - Load from `docs://ori/agents/sme-security`\n' : ''}
3. Invoke SME agents in parallel using Task tool
4. Aggregate SME results into handoff packet
5. Decision matrix:
   - **Critical/High findings:** PAUSE → Ask user (Fix/Proceed/Abort)
   - **Medium/Low findings:** LOG → Proceed to Phase 3
   - **No findings:** Proceed to Phase 3

**Handoff:** Pass aggregated SME reviews + handoff packet to Phase 3

---
` : ''}

### Phase 3: Implementation (Model: Sonnet)

**Your Task:**
1. Implement the solution based on verified research
2. Apply SME recommendations (if Phase 2.5 executed)
3. Follow security best practices
4. Create/modify files as needed
5. Test implementation
6. Update handoff packet with implementation artifacts

**Handoff:** Pass implementation + handoff packet to Phase 4

---

### Phase 4: Documentation (Model: Haiku)

**Your Task:**
1. Update relevant documentation
2. Create/update CHANGELOG
3. Add inline code comments if needed
4. Generate summary of changes
5. Finalize handoff packet

**Output:** Workflow completion summary

---

## Expected Output

At the end of Phase 4, provide:

1. **Summary:** What was accomplished
2. **Artifacts:** List of files created/modified
3. **Trace ID:** \`${traceId}\` (for feedback)
4. **Duration:** Total time spent
${smeEnabled ? '5. **SME Reviews:** Summary of findings (if executed)\n' : ''}
6. **Feedback URL:** https://github.com/grandinh/mcp-server-ori/issues/new?template=workflow-feedback.yml&trace_id=${traceId}

---

## Resources Available

Access these resources using the MCP resource protocol:

- **ORI Workflow Specification:** \`docs://ori/workflow\`
- **Agent Taxonomy:** \`docs://ori/agents/taxonomy\`
${securitySme ? '- **Security SME Specification:** `docs://ori/agents/sme-security`\n' : ''}
- **Configuration Schema:** \`schema://ori/config\`
- **Handoff Packet Schema:** \`schema://ori/handoff-packet\`

---

**BEGIN WORKFLOW EXECUTION NOW**
`;
}
