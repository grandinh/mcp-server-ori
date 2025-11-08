# Multi-Agent Architecture: Skills, Commands, and Agents

**Version:** 1.0
**Last Updated:** 2025-11-08

## Overview

This document defines the taxonomy and architectural patterns for the ORI (Optimize Research Implement) multi-agent system. Understanding these distinctions is crucial for effective use and extension of the ORI framework.

---

## Taxonomy: Skills vs. Commands vs. Agents

### Skills (Domain Containers)

**Definition**: Reusable capabilities organized by domain that an AI can invoke autonomously based on task requirements.

**Characteristics**:
- Stateless and composable
- No external side effects
- Model-invoked (AI decides when to use)
- Often contain related commands in `workflows/` subdirectory

**Examples**:
- `research` - Information gathering and analysis capabilities
- `security` - Security review and vulnerability scanning
- `code-quality` - Code style, complexity, and maintainability analysis

**Location**: `~/.claude/skills/{skill-name}/`

**When to use**: When you have a coherent set of related capabilities that can be packaged together for discoverability and reuse.

### Commands (Task-Specific Prompts)

**Definition**: Explicit operations with potential side effects, triggered by user input or agent decisions.

**Characteristics**:
- Can modify external state (files, APIs, databases)
- May require credentials or elevated permissions
- User-invoked (slash commands like `/ori`) or model-invoked (tool calls)
- Defined objectives with clear inputs/outputs

**Examples**:
- `/ori` - Orchestrates the 5-phase research-implement workflow
- `/optimize` - Applies OTA+OODA framework to prompt optimization
- Tool calls: `WebSearch`, `Edit`, `Write`, `Bash`

**Location**:
- User slash commands: `~/.claude/commands/{command-name}.md`
- Skill workflows: `~/.claude/skills/{skill}/workflows/{command}.md`

**When to use**: When an operation must interact with the external environment, requires credentials, or has side effects beyond AI reasoning.

### Agents (Autonomous Workers)

**Definition**: Standalone AI instances (often via Task tool) that execute specialized tasks with their own context, tools, and decision-making capability.

**Characteristics**:
- Run in isolated context (separate from orchestrator)
- Have specific roles and tool permissions
- Can be invoked in parallel for efficiency
- Cannot spawn sub-agents (prevents infinite nesting)

**Examples**:
- **Phase 0 Agent** (Opus): Strategic planning and research design
- **Phase 1 Agent** (Opus/Sonnet): Deep research execution
- **Security SME Agent**: OWASP Top 10 compliance review
- **Compliance SME Agent**: License, privacy, accessibility checks

**Location**:
- Agent specs: `~/.claude/agents/{agent-name}.md`
- Invoked via: `Task` tool with `model` parameter

**When to use**: When a task requires isolated context, parallel execution, or specialized model selection (e.g., Opus for strategy, Haiku for docs).

---

## Decision Framework

```
START: I need to add functionality to ORI

│
├─ Does it require external side effects? (file writes, API calls, state changes)
│  ├─ YES → Use a COMMAND (slash command or tool)
│  └─ NO → Continue
│
├─ Does it need isolated context or run in parallel?
│  ├─ YES → Use an AGENT (Task tool invocation)
│  └─ NO → Continue
│
└─ Is it a reusable capability related to a domain?
   ├─ YES → Package as a SKILL
   └─ NO → Inline logic or helper function
```

### Promotion Rules

**Skill → Command**: When a skill's workflow needs to perform side effects (file writes, API calls)

**Command → Agent**: When a command's execution would benefit from:
- Parallel execution with other commands
- Different model selection (Opus for complex, Haiku for simple)
- Isolated context to preserve focus

**Example**: ORI evolution
1. **Started as**: Command (`/ori`) - single workflow
2. **Now**: Command that orchestrates Agents (Phase 0-4 via Task tool)
3. **Future**: Skill (`ori/`) with workflow commands + agent fleet

---

## ORI's Multi-Agent Architecture

### Current Structure (v1.2)

**Pattern**: **Hierarchical Orchestrator-Worker**

```
┌─────────────────────────────────────────────────────┐
│  /ori COMMAND (User-facing entry point)            │
│  Triggers: Orchestrator-Worker Pipeline            │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  PHASE 0: Strategy (Opus Agent)                     │
│  Role: Orchestrator                                 │
│  - Analyze request complexity                       │
│  - Design research strategy                         │
│  - Select models for Phases 1-4                     │
│  - Generate handoff packet                          │
└─────────────────────────────────────────────────────┘
                      │
                      ├─ Delegates to ───────────────┐
                      ▼                               │
┌──────────────────────────────────────┐              │
│  PHASE 1: Research (Dynamic Agent)   │              │
│  Role: Information Gatherer          │              │
│  - Execute research strategy         │              │
│  - Multi-source validation           │              │
│  - Output findings + confidence      │              │
└──────────────────────────────────────┘              │
                      │                               │
                      ▼                               │
┌──────────────────────────────────────┐              │
│  PHASE 2: Verify (Sonnet Agent)      │              │
│  Role: Quality Assurance             │              │
│  - Cross-validate findings           │              │
│  - Risk assessment                   │  ┌───────────▼──────────┐
│  - Optimize for conciseness          ├──┤ SME AGENTS (Phase 2.5)│
└──────────────────────────────────────┘  │ Parallel Quality Gates│
                      │                   │                       │
                      │                   │ • Security SME        │
                      │ ◄─────────────────┤ • Compliance SME      │
                      │   Aggregate       │ • Code Quality SME    │
                      │   Reviews         │ • Performance SME     │
                      ▼                   └───────────────────────┘
┌──────────────────────────────────────┐
│  PHASE 3: Implement (Sonnet/Haiku)   │
│  Role: Executor                      │
│  - Apply changes with error handling │
│  - Rollback on failure               │
│  - Log all operations                │
└──────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────┐
│  PHASE 4: Document (Haiku Agent)     │
│  Role: Documentation Updater         │
│  - Update README, CHANGELOG          │
│  - Verify completeness               │
│  - Store final handoff packet        │
└──────────────────────────────────────┘
```

### Key Design Principles

1. **Explicit Delegation**: Phase 0 (orchestrator) creates detailed delegation packets for worker agents
2. **Context Isolation**: Each agent runs in its own context with specific tool permissions
3. **Handoff Packets**: Structured JSON preserves information across phase boundaries
4. **Parallel SME Execution**: Quality gates run concurrently for efficiency
5. **Model Optimization**: Each phase uses the most cost-effective model (Opus/Sonnet/Haiku)

---

## SME Agents (Subject Matter Experts)

### Purpose

SME agents provide **specialized quality assurance** across non-functional concerns (security, compliance, performance, code quality). They act as **mandatory checkpoints** for high-risk changes and **optional advisors** for standard tasks.

### Integration Point: Phase 2.5 Quality Gate

After Phase 2 verification, ORI conditionally invokes relevant SME agents based on:
- **Risk flags** from Phase 2 (security, compliance, performance)
- **User configuration** (enabled SME agents in `ori-config.json`)
- **Task characteristics** (auth/crypto code → Security SME, external APIs → Compliance SME)

### Execution Model

**Parallel by Default**: All applicable SME agents run concurrently using the Task tool's multi-agent capability:

```markdown
Use 7-parallel Task tool invocations:
1. Security SME (if risk_flags includes "security")
2. Compliance SME (if risk_flags includes "compliance")
3. Code Quality SME (if complexity > threshold)
4. Performance SME (if task involves "optimize")
```

Results aggregate into the handoff packet before Phase 3.

### SME Agent Specifications

Each SME agent has:
- **Description**: Role and purpose
- **Tool Permissions**: Read-only, Read+WebSearch, or Read+Bash
- **Checklist**: Domain-specific validation criteria
- **Output Format**: Severity, finding, recommendation, category
- **Blocking Behavior**: Critical/High findings pause workflow for user review

See individual agent specs:
- `sme-security.md` - OWASP Top 10 security review
- `sme-compliance.md` - License, privacy, accessibility (v1.3)
- `sme-code-quality.md` - Code style, complexity, maintainability (v1.3)
- `sme-performance.md` - Time/space complexity, optimization (v1.3)

---

## Handoff Packets: Context Preservation

### Problem Statement

In multi-agent systems, **context loss** occurs when information doesn't transfer cleanly between agents:
- Implicit handoffs rely on the model "remembering" critical details
- Token limits can truncate context
- Summarization errors drop constraints or requirements

### Solution: Structured Handoff Packets

A **handoff packet** is a versioned JSON schema that explicitly preserves all critical information:

```json
{
  "schemaVersion": "1.0.0",
  "trace_id": "ori-20251108-abc123",
  "phase": {
    "current": 1,
    "next": 2,
    "completed": [0],
    "remaining": [2, 3, 4]
  },
  "user_request": {
    "original": "add JWT authentication to Express API",
    "domain": "code",
    "clarity_score": 0.85,
    "risk_flags": ["security"]
  },
  "context": {
    "research_strategy": { /* Phase 0 output */ },
    "findings": { /* Phase 1 output */ },
    "validation_results": { /* Phase 2 output */ }
  },
  "constraints": ["use Express.js", "OWASP compliant"],
  "acceptance_criteria": ["bcrypt passwords", "signed JWTs"],
  "safety_invariants": ["no secrets in code", "HTTPS cookies"]
}
```

### Benefits

1. **Zero context loss**: Critical fields (constraints, acceptance criteria) explicitly preserved
2. **Traceability**: `trace_id` enables end-to-end debugging
3. **Rollback**: Complete state at each phase boundary
4. **Validation**: Schema version ensures backward compatibility
5. **Auditability**: Handoff packets logged to `.claude/ori-logs/{trace_id}/`

Schema definition: `~/.claude/schemas/handoff-packet.json`

---

## Safety Hooks: Deterministic Control Points

### Purpose

Hooks provide **deterministic behavior** at predefined workflow points, bypassing AI discretion for critical operations (logging, validation, security checks).

### Hook Types

**Pre-Phase Hooks** (validation before execution):
- `pre_phase_1`: Validate research strategy completeness
- `pre_phase_2`: Verify minimum source threshold
- `pre_phase_3`: Safety check (git repo, file paths, SME reviews)
- `pre_phase_4`: Validate implementation success

**Post-Phase Hooks** (audit/logging after execution):
- `post_phase_0`: Log research strategy
- `post_phase_1`: Log findings, trigger SME agents
- `post_phase_2`: Log verification results
- `post_phase_3`: Log file changes and diffs
- `post_phase_4`: Validate documentation completeness

**Emergency Hooks** (error handling):
- `on_error`: Crash dump, rollback attempt
- `on_interrupt`: Save checkpoint, cleanup temp files

### Example: Pre-Phase-3 Safety Hook

```javascript
// Pseudo-code for conceptual illustration
function pre_phase_3_hook(handoff_packet, config) {
  // 1. Check git repository exists
  if (!gitRepoExists()) {
    return {
      status: "blocked",
      message: "No git repository detected. Initialize with 'git init'?",
      action: "ask_user"
    };
  }

  // 2. Validate file paths are within project
  for (const file of handoff_packet.context.implementation_log.files) {
    if (file.path.startsWith("/etc") || file.path.startsWith("/usr")) {
      return {
        status: "blocked",
        message: `Dangerous path detected: ${file.path}`,
        action: "abort"
      };
    }
  }

  // 3. Check SME reviews if enabled
  if (config.sme_agents.enabled) {
    const criticalFindings = handoff_packet.sme_reviews
      .filter(r => r.severity === "Critical" || r.severity === "High");

    if (criticalFindings.length > 0) {
      return {
        status: "blocked",
        message: `${criticalFindings.length} critical issues found by SME agents`,
        action: "show_user_for_confirmation",
        data: criticalFindings
      };
    }
  }

  // All checks passed
  return { status: "approved" };
}
```

---

## Best Practices

### 1. Explicit Delegation

**Good**: Phase 0 generates detailed delegation packet
```json
{
  "delegated_by": "phase-0-opus",
  "task_summary": "Research JWT best practices for Express.js",
  "research_strategy": {
    "primary_questions": [
      "What are OWASP recommendations for JWT storage?",
      "How to implement refresh tokens securely?"
    ],
    "sources": ["OWASP docs", "Express security guide", "jwt.io"],
    "search_queries": ["JWT security best practices 2025", "Express JWT middleware"]
  },
  "success_criteria": ["3+ sources validated", "confidence = high"]
}
```

**Bad**: Implicit delegation
```
"Go research JWT authentication and report back"
```

### 2. Tool Limitation (Principle of Least Privilege)

**Good**: Security SME agent
```yaml
tools: [Read]  # Read-only, no file writes
```

**Bad**: Security SME agent
```yaml
tools: [Read, Write, Edit, Bash]  # Excessive permissions
```

### 3. Parallel Execution

**Good**: Launch SME agents concurrently
```
Task(model="sonnet", description="Security SME", ...) ||
Task(model="sonnet", description="Compliance SME", ...) ||
Task(model="haiku", description="Code Quality SME", ...)
```

**Bad**: Sequential SME agents
```
Task(Security) → wait → Task(Compliance) → wait → Task(Code Quality)
```

### 4. Context Preservation

**Good**: Structured handoff with required fields
```json
{
  "constraints": ["MUST use bcrypt", "MUST validate all inputs"],
  "acceptance_criteria": ["passes OWASP ZAP scan", "100% test coverage on auth"]
}
```

**Bad**: Informal handoff
```
"Make sure it's secure and tested"
```

---

## Migration Path: Future Architecture (v2.0)

### Skill-Based Reorganization

**Current**: `/ori` as a command
**Future**: `ori/` as a skill with nested workflows

```
~/.claude/skills/ori/
├── README.md                    # Skill overview
├── workflows/
│   ├── research.md              # Phase 1 workflow
│   ├── verify.md                # Phase 2 workflow
│   ├── implement.md             # Phase 3 workflow
│   └── document.md              # Phase 4 workflow
├── agents/
│   ├── sme-security.md
│   ├── sme-compliance.md
│   └── sme-code-quality.md
└── schemas/
    ├── handoff-packet.json
    └── sme-report.json
```

Benefits:
- **Colocated context**: All ORI-related files in one location
- **Discoverability**: Skills show up in autocomplete
- **Reusability**: Other commands can invoke `ori/workflows/research.md`

---

## References

- **Multi-Agent Orchestration Patterns**: https://latenode.com/blog/langgraph-multi-agent-orchestration-complete-framework-guide-architecture-analysis-2025
- **Claude Code Sub-Agent Best Practices**: https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/
- **Skills vs Commands vs Agents**: https://danielmiessler.com/blog/when-to-use-skills-vs-commands-vs-agents
- **Agent Handoff Context Preservation**: https://arxiv.org/abs/2504.21030
- **Multi-Agent Safety**: https://www.weforum.org/stories/2025/01/ai-agents-multi-agent-systems-safety/

---

**Version History**:
- v1.0 (2025-11-08): Initial taxonomy documentation for ORI v1.2
