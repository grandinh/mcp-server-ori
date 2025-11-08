---
description: Optimize Research Implement workflow with intelligent multi-model selection
---

# Optimize Research Implement (ORI) Workflow

**Version:** 1.2
**Purpose:** Autonomous multi-phase workflow with intelligent model selection, SME quality gates, and structured context preservation for researching, validating, and implementing changes with minimal user input.

---

## Workflow Overview

Execute the following phases sequentially with built-in error handling, validation, and intelligent model selection:

```
PHASE 0: STRATEGY (Opus) → PHASE 1: RESEARCH (Dynamic) → PHASE 2: VERIFY (Sonnet) → [PHASE 2.5: SME QUALITY GATE (Optional)] → PHASE 3: IMPLEMENT (Sonnet/Haiku) → PHASE 4: DOCUMENT (Haiku)
```

**Note:** Phase 2.5 (SME Quality Gate) is optional and only executes when SME agents are enabled in configuration and triggered by risk flags or keywords.

---

## Model Selection Strategy

### Per-Phase Model Recommendations

The workflow uses different models optimized for each phase:

| Phase | Recommended Model | Rationale |
|-------|------------------|-----------|
| **Phase 0: Strategy** | **Opus** | Complex reasoning, strategic planning, research design |
| **Phase 1: Research** | **Dynamic** | Opus decides based on complexity; Sonnet for standard, Opus for complex |
| **Phase 2: Verify** | **Sonnet** | Balance of speed and accuracy for validation |
| **Phase 3: Implement** | **Sonnet/Haiku** | Sonnet for complex code, Haiku for simple edits |
| **Phase 4: Document** | **Haiku** | Fast, cost-effective for doc updates |

### When to Use Each Model

**Opus (claude-opus-4):**
- Strategic planning and research design
- Complex multi-step reasoning
- Novel or ambiguous problems
- High-stakes decisions requiring deep analysis
- Architectural decisions

**Sonnet (claude-sonnet-4-5):**
- Most implementation tasks
- Code generation and refactoring
- Validation and verification
- Balanced performance/cost for general tasks

**Haiku (claude-haiku-4):**
- Simple file edits
- Documentation updates
- Formatting and style fixes
- Quick, straightforward tasks

---

## Phase 0: Research Strategy (STRATEGIC PLANNING)

### Objective
Use Opus to create an optimal research strategy and select the best model for execution.

### Model: **Opus** (claude-opus-4)

### Instructions

**IMPORTANT:** This phase MUST use Opus via the Task tool:

```
Use Task tool with model="opus" to execute Phase 0.
```

### Configuration and Handoff Packet Initialization

**Before executing Phase 0 analysis:**

1. **Load Configuration** (if exists):
   - Check for `~/.claude/ori-config.json`
   - Load SME agent settings, safety hooks, logging preferences
   - If file doesn't exist, use defaults (SME disabled, logging enabled)

2. **Generate Trace ID**:
   - Create UUID v4: `trace_id = uuid.uuid4()`
   - Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
   - Used for end-to-end tracking and log correlation

3. **Initialize Handoff Packet** (schema: `~/.claude/schemas/handoff-packet.json`):
   ```json
   {
     "schemaVersion": "1.0.0",
     "trace_id": "{generated-uuid}",
     "workflow_id": "/ori",
     "phase": {
       "current": 0,
       "next": 1,
       "completed": [],
       "remaining": [1, 2, 3, 4]
     },
     "user_request": {
       "original": "{user's request}",
       "parsed_intent": "",  // Fill during analysis
       "domain": "",  // Fill during classification
       "clarity_score": 0.0,  // Fill during OTA+OODA
       "risk_flags": []  // Fill during analysis
     },
     "constraints": [],  // Extract from user request
     "acceptance_criteria": [],  // Define success criteria
     "safety_invariants": [],  // Security/safety requirements
     "metadata": {
       "started_at": "{ISO-8601 timestamp}",
       "models_used": {"phase_0": "claude-opus-4"}
     }
   }
   ```

**Then proceed with standard Phase 0 analysis below:**

1. **Analyze User Request**
   - Parse the complexity and scope
   - Identify domain and subdomain
   - Determine novelty (established pattern vs. new problem)
   - Assess information availability (well-documented vs. obscure)

2. **Design Research Strategy**
   Create a structured research plan including:
   - **Primary questions** to answer (ranked by priority)
   - **Information sources** to consult (docs, code, web)
   - **Search queries** to execute (specific keywords/phrases)
   - **Validation criteria** (how to verify findings)
   - **Success metrics** (what constitutes "enough" research)

3. **Select Research Model**
   Determine which model should execute Phase 1:

   ```
   IF task is complex OR novel OR ambiguous:
     → Recommend Opus for Phase 1
     → Reason: "Requires deep analysis and nuanced understanding"

   IF task is standard OR well-documented OR straightforward:
     → Recommend Sonnet for Phase 1
     → Reason: "Efficient for established patterns with good docs"
   ```

4. **Output Format**
   ```json
   {
     "research_strategy": {
       "primary_questions": ["Q1", "Q2", "Q3"],
       "sources": ["official docs", "codebase patterns", "web search"],
       "search_queries": ["query 1", "query 2"],
       "validation_criteria": ["criterion 1", "criterion 2"],
       "estimated_complexity": "low|medium|high"
     },
     "model_recommendation": {
       "phase_1_model": "opus|sonnet",
       "reasoning": "explanation",
       "estimated_tokens": 5000
     },
     "phase_recommendations": {
       "phase_2_model": "sonnet|haiku",
       "phase_3_model": "sonnet|haiku",
       "phase_4_model": "haiku",
       "rationale": "brief explanation"
     }
   }
   ```

5. **Transition to Phase 1**
   - Pass research strategy to selected model
   - Brief the model on context and approach
   - Monitor token usage for optimization

---

## Phase 1: Deep Research (OBSERVE & ORIENT)

### Objective
Gather comprehensive, accurate information using all available tools and sources, following the strategy from Phase 0.

### Model: **Dynamic** (Opus or Sonnet based on Phase 0 recommendation)

### Instructions

**IMPORTANT:** Use the model recommended by Phase 0:

```
If Phase 0 recommended Opus:
  Use Task tool with model="opus" to execute Phase 1

If Phase 0 recommended Sonnet:
  Use Task tool with model="sonnet" to execute Phase 1 (or execute directly if already Sonnet)
```

1. **Load Framework Context**
   - Read and parse `/Users/grandinharrison/prompts/optimized_prompts.md`
   - Apply OTA+OODA Loop principles to the user's request
   - Calculate clarity_score and identify domain
   - **Review Phase 0 strategy** and follow the research plan

2. **Execute Research Strategy from Phase 0**
   - Follow the primary questions identified
   - Use specified information sources in priority order
   - Execute the recommended search queries
   - Apply validation criteria as you gather information

3. **Execute Multi-Source Research**
   - Use WebSearch tool for current information (auto-approved)
   - Use WebFetch for documentation and official sources
   - Use Grep/Glob to search local codebase for relevant patterns
   - Use Read tool to examine existing implementations
   - Cross-reference at least 3 sources for critical facts

4. **Research Scope**
   - Technical specifications and best practices
   - Security considerations and vulnerabilities
   - Performance implications
   - Edge cases and error scenarios
   - Related dependencies and breaking changes

5. **Output Format**
   Create internal research summary (not shown to user):
   ```json
   {
     "findings": ["key fact 1", "key fact 2"],
     "sources": ["source 1", "source 2"],
     "confidence": "high|medium|low",
     "risks": ["risk 1", "risk 2"],
     "implementation_approach": "summary",
     "strategy_adherence": "how well we followed Phase 0 plan"
   }
   ```

---

## Phase 2: Verification & Optimization (DECIDE)

### Objective
Validate research accuracy, eliminate drift, and optimize for token efficiency.

### Model: **Sonnet** (claude-sonnet-4-5)

Sonnet provides the optimal balance of accuracy and speed for validation tasks.

### Instructions

1. **Cross-Validation Checklist**
   - [ ] All facts verified against multiple sources
   - [ ] No conflicting information found
   - [ ] Security implications assessed
   - [ ] Performance impact evaluated
   - [ ] Breaking changes identified

2. **Accuracy Review**
   - Compare findings across sources
   - Flag any inconsistencies for re-research
   - If confidence < high: perform additional research
   - Verify version numbers, API signatures, and syntax

3. **Optimize for Conciseness**
   - Remove redundant information
   - Consolidate similar findings
   - Prioritize high-impact insights
   - Keep only actionable details
   - Target: <500 tokens for research summary

4. **Risk Assessment**
   - Security: auth, data exposure, injection risks
   - Safety: breaking changes, data loss potential
   - Compliance: license compatibility, policy adherence
   - If high-risk: require user confirmation before Phase 3

5. **Decision Matrix**
   ```
   IF confidence = high AND risk = low:
     → Proceed to Phase 3 automatically

   IF confidence = high AND risk = medium:
     → Show user 1 yes/no confirmation with risk summary

   IF confidence < high OR risk = high:
     → Show user findings and ask for guidance
   ```

---

## Phase 2.5: SME Quality Gate (OPTIONAL)

### Objective
Invoke Subject Matter Expert (SME) agents for specialized quality assurance before implementation.

### Model: **Sonnet** (claude-sonnet-4-5) for orchestration, SME agents use Sonnet/Haiku

### When This Phase Executes

This phase is **OPTIONAL** and only executes if ALL of the following are true:

1. **Master switch enabled**: `sme_agents.enabled: true` in `~/.claude/ori-config.json`
2. **At least one SME trigger matches**:
   - `risk_flags` includes "security" → Security SME
   - `risk_flags` includes "compliance" → Compliance SME (v1.3+)
   - Implementation complexity > threshold → Code Quality SME (v1.3+)
   - `risk_flags` includes "performance" → Performance SME (v1.3+)

**If conditions NOT met → Skip to Phase 3 directly**

### Instructions

**1. Load SME Configuration**

Read `~/.claude/ori-config.json` and check:
```json
{
  "sme_agents": {
    "enabled": true/false,  // Master switch
    "security": {
      "enabled": true/false,
      "auto_invoke_on_risk_flags": ["security"],
      "auto_invoke_on_keywords": ["auth", "crypto", "password", "jwt"],
      "block_on_critical": true
    },
    ...
  }
}
```

**2. Determine Applicable SME Agents**

```python
applicable_smes = []

# Security SME
if ("security" in risk_flags OR
    any(keyword in user_request for keyword in ["auth", "crypto", "password", "jwt", "oauth"])) AND
    config.sme_agents.security.enabled:
    applicable_smes.append("security")

# Compliance SME (v1.3+)
if ("compliance" in risk_flags OR "privacy" in risk_flags) AND
    config.sme_agents.compliance.enabled:
    applicable_smes.append("compliance")

# Code Quality SME (v1.3+)
if (files_changed > 3 OR lines_changed > 200) AND
    config.sme_agents.code_quality.enabled:
    applicable_smes.append("code_quality")

# Performance SME (v1.3+)
if ("performance" in risk_flags OR
    any(keyword in user_request for keyword in ["optimize", "slow", "performance"])) AND
    config.sme_agents.performance.enabled:
    applicable_smes.append("performance")
```

**3. Invoke SME Agents in Parallel**

Use Task tool to launch all applicable SME agents concurrently:

```markdown
# Example: Security + Code Quality SME in parallel

Task(
  subagent_type="general-purpose",
  model="sonnet",
  description="Security SME Review",
  prompt="""
    You are executing the Security SME agent.

    Load your instructions from: ~/.claude/agents/sme-security.md

    Review the following implementation for OWASP Top 10 compliance:

    **Handoff Packet Context:**
    {handoff_packet}

    **Files to Review:**
    {implementation_files}

    **Focus Areas (from risk_flags):**
    {risk_flags}

    Provide security review in the format specified in sme-security.md.
  """
)
||  // Parallel execution
Task(
  subagent_type="general-purpose",
  model="haiku",  // Haiku sufficient for code quality
  description="Code Quality SME Review",
  prompt="""
    Load instructions from: ~/.claude/agents/sme-code-quality.md
    Review for: complexity, maintainability, test coverage
    Context: {handoff_packet}
  """
)
```

**4. Aggregate SME Results**

Wait for all SME agents to complete, then aggregate:

```json
handoff_packet.sme_reviews = {
  "security": {
    "executed": true,
    "overall_risk": "High",
    "findings": [
      {
        "severity": "Critical",
        "category": "A02",
        "finding": "JWT secret hardcoded in source",
        "recommendation": "Move to environment variable"
      },
      ...
    ],
    "recommendation": "Block until fixes applied"
  },
  "code_quality": {
    "executed": true,
    "overall_assessment": "Acceptable",
    "findings": [...]
  }
}
```

**5. Decision Matrix**

```python
critical_findings = []
high_findings = []

for sme_name, sme_review in handoff_packet.sme_reviews.items():
    for finding in sme_review.findings:
        if finding.severity == "Critical":
            critical_findings.append((sme_name, finding))
        elif finding.severity == "High":
            high_findings.append((sme_name, finding))

if critical_findings or high_findings:
    # PAUSE WORKFLOW
    show_user_sme_summary(critical_findings, high_findings)

    user_choice = ask_user("""
    Critical/High security or quality issues found.

    Options:
    1. Fix issues first (recommended for Critical)
    2. Proceed anyway (accept risk)
    3. Abort workflow

    Your choice:
    """)

    if user_choice == "fix":
        return "LOOP_BACK_TO_PHASE_2"  // Apply fixes, re-run SME
    elif user_choice == "proceed":
        log_risk_acceptance(trace_id, critical_findings, high_findings)
        proceed_to_phase_3()
    else:  // abort
        return "ABORT_WORKFLOW"
else:
    # All clear, proceed automatically
    proceed_to_phase_3()
```

**6. Update Handoff Packet**

```json
{
  ...existing fields...,
  "phase": {
    "current": 2.5,
    "next": 3,
    "completed": [0, 1, 2],
    "remaining": [3, 4]
  },
  "sme_reviews": {
    "security": {...},
    "code_quality": {...}
  },
  "metadata": {
    ...existing...,
    "phase_durations": {
      ...existing...,
      "phase_2.5": 45  // seconds
    }
  }
}
```

**7. Logging**

Store SME results to `.claude/ori-logs/{trace_id}/sme-phase2.5.json` for audit trail.

### Output Format (if Critical/High findings)

Show user:

```markdown
## 🛡️ SME Quality Gate Results

**Trace ID:** {trace_id}
**SME Agents Executed:** Security, Code Quality

### Security SME Review ⚠️
- **Overall Risk:** High
- **Critical Findings:** 1
- **High Findings:** 2
- **Recommendation:** **Block until fixes applied**

**Top Priority Issues:**
1. **[Critical]** JWT secret hardcoded in `src/middleware/auth.js:5`
   - **Risk:** Credentials exposed in version control
   - **Fix:** Move to environment variable with validation

2. **[High]** No JWT token expiration configured (`src/middleware/auth.js:12`)
   - **Risk:** Tokens cannot be revoked, breach impact amplified
   - **Fix:** Add `expiresIn: '1h'` to jwt.sign()

3. **[High]** Missing httpOnly/secure flags on cookies (`src/middleware/auth.js:28`)
   - **Risk:** XSS and MITM attack vectors
   - **Fix:** Set `{httpOnly: true, secure: true, sameSite: 'strict'}`

### Code Quality SME Review ✅
- **Overall Assessment:** Acceptable with minor improvements
- **Medium Findings:** 2
- **Recommendations:** Add inline comments, consider refactoring auth logic into separate functions

---

**🚨 Action Required:**

Critical and High severity security issues must be addressed before implementation.

**Options:**
1. **Fix Issues First** (Recommended) - I'll return to Phase 2, apply the fixes, and re-run SME review
2. **Proceed Anyway** - Continue to Phase 3 (⚠️ NOT recommended for Critical issues)
3. **Abort** - Cancel workflow and provide manual implementation guidance

**Your choice:** [User responds]
```

### SME Agent Specifications

- **Security SME:** `~/.claude/agents/sme-security.md` (OWASP Top 10, crypto, auth)
- **Compliance SME:** `~/.claude/agents/sme-compliance.md` (v1.3+)
- **Code Quality SME:** `~/.claude/agents/sme-code-quality.md` (v1.3+)
- **Performance SME:** `~/.claude/agents/sme-performance.md` (v1.3+)

---

## Phase 3: Implementation (ACT)

### Objective
Execute changes with comprehensive error handling and minimal user input.

### Model: **Sonnet or Haiku** (dynamic based on complexity)

**Selection Criteria:**
- Use **Sonnet** for: Complex code, multi-file changes, architectural modifications
- Use **Haiku** for: Simple edits, single-file changes, documentation-only updates

**Implementation:**
```
If Phase 0 or Phase 2 flagged as complex implementation:
  Use Task tool with model="sonnet"

If straightforward single-file edit or doc update:
  Use model="haiku" (via Task tool or directly)
```

### Handoff Packet Integration

**Input from Phase 2.5:**
If SME Quality Gate executed, Phase 3 receives:
- SME recommendations in `handoff_packet.sme_reviews`
- Updated `risk_level` reflecting SME findings
- User's decision (if Critical/High findings required confirmation)

**Integrate SME Guidance:**
```python
if handoff_packet.sme_reviews:
    for sme_name, sme_review in handoff_packet.sme_reviews.items():
        for finding in sme_review.findings:
            if finding.severity in ["Critical", "High"]:
                # Apply SME recommendation in implementation
                apply_fix(finding.recommendation, finding.location)
```

### Instructions

1. **Pre-Implementation Safety Checks**
   - Verify file paths exist and are writable
   - Check for git repository (offer to initialize if missing)
   - Backup critical files if modifications are destructive
   - Validate syntax before writing files

2. **Implementation Strategy**
   Based on domain from Phase 1, apply appropriate template:

   **For Code Changes:**
   - Use Edit tool for modifications (preserves history)
   - Use Write tool only for new files
   - Include error handling in all new code
   - Add inline comments for non-obvious logic
   - Follow existing code style patterns

   **For Configuration Changes:**
   - Validate JSON/YAML/TOML syntax before writing
   - Preserve existing settings not being modified
   - Add comments explaining changes
   - Keep backup of original config

   **For Documentation Changes:**
   - Update README, CHANGELOG, package.json as needed
   - Maintain consistent formatting
   - Update version numbers if applicable
   - Add examples for new features

3. **Error Handling Protocol**
   ```
   TRY:
     Execute implementation steps

   CATCH FileNotFoundError:
     - Create parent directories
     - Retry operation
     - If still fails: inform user and suggest manual path

   CATCH PermissionError:
     - Inform user of permission issue
     - Suggest: chmod command or manual edit

   CATCH SyntaxError (for code):
     - Show error details
     - Offer corrected version
     - Do not write invalid code

   CATCH ValidationError (for config):
     - Show validation error
     - Revert to last valid state
     - Ask user for clarification
   ```

4. **Rollback Mechanism**
   - If any step fails after 2 retries:
     - Halt implementation
     - Revert any partial changes
     - Present findings to user with error details
     - Offer manual implementation guidance

5. **Execution Sequence**
   For each file to be created/modified:
   - a) Validate operation is safe
   - b) Perform operation with error handling
   - c) Verify operation succeeded
   - d) Log success or failure
   - e) Continue to next file

---

## Phase 4: Documentation Updates (FINALIZE)

### Objective
Ensure all project documentation reflects the changes made.

### Model: **Haiku** (claude-haiku-4)

Haiku is optimal for fast, cost-effective documentation updates that don't require complex reasoning.

**Use Haiku via:**
```
Use Task tool with model="haiku" for Phase 4 documentation updates
```

### Instructions

1. **Identify Documentation Files**
   - Check for: README.md, CHANGELOG.md, docs/, package.json, tsconfig.json
   - Use Glob to find all .md files in project root
   - Identify any project-specific doc patterns

2. **Update Checklist**
   - [ ] README.md: Add new features/commands to usage section
   - [ ] CHANGELOG.md: Add entry with date, version, and changes
   - [ ] package.json: Bump version if applicable (semantic versioning)
   - [ ] Code comments: Ensure inline docs are complete
   - [ ] Examples: Add usage examples for new functionality
   - [ ] Tests: Note if tests need updating (don't write tests unless requested)

3. **Documentation Standards**
   - Use consistent markdown formatting
   - Include code blocks with syntax highlighting
   - Add links to related sections
   - Keep language clear and concise
   - Follow existing documentation style

4. **Verification**
   - Ensure all links work
   - Verify code examples are syntactically correct
   - Check that version numbers are consistent across files

---

## Integration with OTA+OODA Framework

### Mapping to Framework Steps

**OBSERVE (Phase 1: Research)**
- Parse user query components
- Extract key elements
- Flag ambiguities
- Compute clarity_score

**ORIENT (Phase 1: Research)**
- Classify domain
- Assess complexity
- Identify safety/policy concerns
- Determine research scope

**DECIDE (Phase 2: Verify)**
- Choose implementation path
- Select appropriate templates
- Generate risk assessment
- Determine if user confirmation needed

**ACT (Phase 3: Implement)**
- Internal prompt rewriting
- Apply domain-specific enhancements
- Execute with error handling
- Follow Plan of Attack

**OUTPUT (Phase 4: Document)**
- Deliver primary changes
- Update documentation
- List assumptions made
- Provide next steps

---

## Output Format

Present results to user in this structure:

```markdown
## [OPTIMIZED] [Brief description of what was accomplished]

### Research Summary
- [Key finding 1]
- [Key finding 2]
- [Key finding 3]

### Changes Implemented
1. **[File/Component 1]**: [Description of change]
2. **[File/Component 2]**: [Description of change]
3. **[Documentation]**: [What was updated]

### Verification
- [x] Research validated across multiple sources
- [x] Security considerations addressed
- [x] Error handling implemented
- [x] Documentation updated

---

**Assumptions:**
1. [Assumption 1 if any]
2. [Assumption 2 if any]

**Next Steps:**
1. [Action user should take, if any]
2. [Testing recommendation]
3. [Verification command to run]

**Sources:**
- [Source 1]
- [Source 2]
```

---

## Usage Examples

### Example 1: Research and implement a new feature
```
User: /ori add JWT authentication to the Express API
```

**What happens:**
0. **Strategy (Opus)**: Analyzes JWT + Express auth, determines research strategy, recommends Sonnet for Phase 1
1. **Research (Sonnet)**: JWT best practices, Express middleware patterns, security considerations
2. **Verify (Sonnet)**: Check findings against OWASP, official Express docs, validate approach
3. **Implement (Sonnet)**: Create auth middleware, add to routes, handle errors (complex multi-file)
4. **Document (Haiku)**: Update README with auth setup, add to CHANGELOG, update package.json

### Example 2: Investigate and fix a bug
```
User: /ori fix the memory leak in the data processing pipeline
```

**What happens:**
0. **Strategy (Opus)**: Complex debugging, recommends Opus for deep investigation in Phase 1
1. **Research (Opus)**: Deep analysis of memory leak patterns, profiling techniques, root cause investigation
2. **Verify (Sonnet)**: Cross-check findings, validate diagnostic approach
3. **Implement (Sonnet)**: Apply fixes with proper cleanup, add error handling
4. **Document (Haiku)**: Note the fix in CHANGELOG, add comments explaining the solution

### Example 3: Optimize performance
```
User: /ori optimize database queries for the user dashboard
```

**What happens:**
0. **Strategy (Opus)**: Analyzes query optimization scope, recommends Sonnet (well-documented problem)
1. **Research (Sonnet)**: SQL optimization techniques, indexing strategies, caching patterns
2. **Verify (Sonnet)**: Validate query improvements, check for side effects
3. **Implement (Sonnet)**: Refactor queries, add indexes, implement caching
4. **Document (Haiku)**: Update docs with performance notes, add to CHANGELOG

### Example 4: Simple documentation update
```
User: /ori update the README to include the new config options
```

**What happens:**
0. **Strategy (Opus)**: Simple doc task, recommends Haiku throughout
1. **Research (Haiku)**: Quick scan of config files and existing README
2. **Verify (Sonnet)**: Ensure accuracy and completeness (brief check)
3. **Implement (Haiku)**: Update README with new config options
4. **Document (Haiku)**: Update CHANGELOG entry (single phase)

### Example 5: Security-Critical Implementation with SME Review

**User Request:**
```bash
/ori add JWT authentication to the Express API
```

**Configuration:** (User has enabled Security SME)
```json
{
  "sme_agents": {
    "enabled": true,
    "security": {"enabled": true}
  }
}
```

**Workflow Execution:**

**0. Strategy (Opus - 45 seconds)**
- Detects keywords: "JWT", "authentication"
- Risk flags: ["security"]
- Generates trace_id: `a1b2c3d4-e5f6-4789-0abc-def123456789`
- Creates handoff packet:
  ```json
  {
    "trace_id": "a1b2c3d4-...",
    "user_request": {
      "original": "add JWT authentication to the Express API",
      "domain": "code",
      "risk_flags": ["security"]
    },
    "constraints": ["use Express.js", "OWASP compliance required"],
    "acceptance_criteria": ["bcrypt passwords", "signed JWTs", "secure cookies"],
    "safety_invariants": ["no secrets in code", "HTTPS only"]
  }
  ```
- Recommends: Sonnet for all phases (well-documented security pattern)

**1. Research (Sonnet - 180 seconds)**
- Searches: OWASP JWT guidance, Express security best practices, jwt.io docs
- Findings:
  - Use jsonwebtoken library (40M weekly downloads, actively maintained)
  - Bcrypt for password hashing (cost factor: 12)
  - HttpOnly + Secure + SameSite cookies
  - Token expiration: 1h access, 7d refresh
- Confidence: High (5 authoritative sources cross-validated)

**2. Verify (Sonnet - 60 seconds)**
- Cross-validation passed: No conflicting information
- Risk assessment: Medium-High (security-critical, well-documented)
- Decision: Trigger Security SME (due to risk_flag + "security" in config)

**2.5 SME Quality Gate (Sonnet - 45 seconds)**
- **Initial Review:**
  - Security SME reviews proposed implementation
  - Findings: **2 Critical, 3 High issues**
    1. [Critical] Hardcoded JWT_SECRET in source code
    2. [Critical] No input validation on login endpoint
    3. [High] Missing token expiration
    4. [High] Insecure cookie configuration
    5. [High] No rate limiting on /login

- **User Notification:**
  ```
  🛡️ SME Quality Gate: 2 Critical issues found
  Recommendation: Fix issues first
  Your choice: [Fix / Proceed / Abort]
  ```

- **User Response:** "Fix issues first"

- **Fix Application (Phase 2 Loop):**
  - Add: JWT_SECRET from environment variable with startup validation
  - Add: express-validator for input sanitization
  - Add: jwt.sign(..., {expiresIn: '1h'})
  - Add: cookie flags {httpOnly, secure, sameSite: 'strict'}
  - Add: express-rate-limit on /login (5 attempts per 15min)

- **Re-run SME:**
  - Security SME approves: **0 Critical, 0 High issues**
  - Recommendation: Proceed to implementation

**3. Implement (Sonnet - 120 seconds)**
- Creates `src/middleware/auth.js`:
  - Loads JWT_SECRET from process.env with validation
  - Implements login route with rate limiting
  - Uses bcrypt.hash(password, 12)
  - Signs tokens with 1h expiration
  - Sets secure cookies
- Creates `src/middleware/authenticate.js`:
  - Verifies JWT from cookie
  - Handles expiration gracefully
- Updates `src/app.js`:
  - Registers auth routes
  - Adds authentication middleware to protected routes

**4. Document (Haiku - 30 seconds)**
- Updates README.md:
  - Authentication setup instructions
  - Environment variable requirements (JWT_SECRET)
  - Example .env file
- Updates CHANGELOG.md:
  - v1.1.0: Added JWT authentication with OWASP compliance
- Stores final handoff packet:
  - Location: `.claude/ori-logs/a1b2c3d4-.../final-handoff.json`
  - Includes: Full SME review, all findings, resolutions

**Total Duration:** 480 seconds (8 minutes)
**Total Cost:** ~$0.20 (Opus $0.075 + Sonnet $0.12 + Haiku $0.005)
**Security Issues Prevented:** 5 (2 Critical, 3 High)

**Result:** Production-ready, security-hardened JWT authentication system with full audit trail.

---

## Multi-Model Benefits

### Why Use Different Models Per Phase?

**Cost Optimization:**
- Opus only for strategic planning (~5% of tokens)
- Haiku for documentation (~20% of tokens at 1/50th the cost)
- Result: **~40% cost reduction** vs. all-Opus

**Speed Optimization:**
- Haiku is 3-5x faster for simple tasks
- Parallel execution possible (doc updates while implementing)
- Overall workflow **~30% faster**

**Quality Optimization:**
- Opus for complex reasoning where it excels
- Sonnet for balanced implementation work
- Each model used in its optimal zone

**Example Cost Comparison (100K token project):**
```
All Opus:     100K tokens × $15/MTok = $1.50
Multi-Model:  5K Opus + 50K Sonnet + 45K Haiku
              = $0.075 + $1.50 + $0.09 = ~$0.90
              Savings: 40%
```

---

## Configuration (Optional)

Users can customize behavior by creating `.claude/ori-config.json`:

```json
{
  "$schema": "./schemas/ori-config-schema.json",
  "version": "1.2.0",

  "auto_approve_low_risk": true,
  "research_depth": "thorough",
  "max_sources": 5,
  "require_confirmation_for": ["breaking_changes", "external_api_calls"],

  "model_selection": {
    "always_use_opus_for_strategy": true,
    "allow_dynamic_phase1": true,
    "prefer_haiku_for_docs": true,
    "min_complexity_for_opus": "high"
  },

  "sme_agents": {
    "enabled": false,
    "comment": "Set to true to enable SME quality gates. Disabled by default for backward compatibility.",

    "security": {
      "enabled": false,
      "comment": "OWASP Top 10 security review",
      "auto_invoke_on_keywords": ["auth", "crypto", "password", "token", "jwt", "oauth"],
      "auto_invoke_on_risk_flags": ["security"],
      "block_on_critical": true
    },

    "compliance": {
      "enabled": false,
      "comment": "License, privacy, accessibility review (v1.3+)",
      "auto_invoke_on_keywords": ["license", "gdpr", "ccpa", "pii"],
      "auto_invoke_on_risk_flags": ["compliance", "privacy"]
    },

    "code_quality": {
      "enabled": false,
      "comment": "Code style, complexity, maintainability (v1.3+)",
      "complexity_threshold": 10,
      "auto_invoke_on_file_count": 3,
      "auto_invoke_on_lines_changed": 200
    },

    "performance": {
      "enabled": false,
      "comment": "Performance optimization opportunities (v1.3+)",
      "auto_invoke_on_keywords": ["optimize", "performance", "slow"],
      "auto_invoke_on_risk_flags": ["performance"]
    }
  },

  "safety_hooks": {
    "enabled": true,
    "pre_phase_3": ["git_check", "path_validation", "sme_gate"],
    "post_phase_3": ["log_changes"]
  },

  "logging": {
    "enabled": true,
    "log_directory": ".claude/ori-logs",
    "retention_days": 30,
    "log_handoff_packets": true,
    "log_sme_reviews": true
  },

  "documentation_updates": {
    "auto_update_readme": true,
    "auto_update_changelog": true,
    "auto_bump_version": false
  },

  "error_handling": {
    "max_retries": 2,
    "rollback_on_failure": true
  }
}
```

---

## Error Messages

### Common Issues and Solutions

**Issue: "Insufficient information to proceed"**
- Solution: Command will ask 1-3 targeted questions
- Example: "Which authentication library should I use: Passport.js, jsonwebtoken, or Auth0?"

**Issue: "High-risk change detected"**
- Solution: Command pauses and shows risk summary
- User confirms with yes/no before proceeding

**Issue: "Research confidence too low"**
- Solution: Command presents findings and asks for user guidance
- Recommendation: User provides additional context or approves research

**Issue: "Implementation failed"**
- Solution: Rollback attempted, present error details and manual steps
- Fallback: Show what would have been done, let user do it manually

---

## Best Practices

1. **Be Specific in Requests**
   - Good: `/ori add rate limiting to the API using express-rate-limit`
   - Poor: `/ori make API better`

2. **Trust the Research Phase**
   - Command will automatically search web, docs, and codebase
   - No need to provide links unless you want a specific source prioritized

3. **Review High-Risk Changes**
   - Breaking changes will always require confirmation
   - Security-related changes will show risk assessment

4. **Verify After Implementation**
   - Run tests if available
   - Check that documentation matches implementation
   - Review git diff before committing

---

## Limitations

- Cannot execute interactive tools (rebase -i, add -i)
- Cannot install packages (but will suggest npm/pip commands)
- Cannot run tests (but will suggest test commands)
- Cannot access external APIs without user approval (except web search/fetch)
- Cannot modify files outside the current project directory

---

## Feedback and Improvements

This workflow is designed to be iterative. Suggestions for improvement:
- Adjust research depth based on complexity
- Cache research findings for similar requests
- Learn from user corrections and preferences
- Build domain-specific research templates
- Track success rate and optimize accordingly

---

**End of /ori command specification**
