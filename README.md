# MCP Server for ORI Workflow

[![NPM Version](https://img.shields.io/npm/v/@grandinharrison/mcp-server-ori)](https://www.npmjs.com/package/@grandinharrison/mcp-server-ori)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/grandinh/mcp-server-ori/actions/workflows/ci.yml/badge.svg)](https://github.com/grandinh/mcp-server-ori/actions/workflows/ci.yml)

**Model Context Protocol (MCP) server for executing ORI (Optimize-Research-Implement) workflows with SME quality gates and structured context preservation.**

## What is ORI?

ORI is a multi-phase workflow framework designed for complex software engineering tasks:

- **Phase 0 (Strategy):** Analyze task, design research strategy, select optimal model
- **Phase 1 (Research):** Deep research with web searches, code examples, documentation
- **Phase 2 (Verification):** Cross-validate findings, assess security/performance
- **Phase 2.5 (SME Quality Gate):** Optional subject-matter expert reviews (Security, Compliance, etc.)
- **Phase 3 (Implementation):** Execute the solution with verified approach
- **Phase 4 (Documentation):** Update docs, changelog, generate summary

## Features

### 🛠️ Tools

- **`execute_ori`**: Execute the complete ORI workflow with progress tracking
- **`validate_config`**: Validate ORI configuration against schema
- **`analyze_task`**: Pre-flight analysis (complexity, domain, risk flags)

### 📚 Resources

**Static Resources:**
- `docs://ori/workflow` - Complete ORI workflow specification
- `docs://ori/agents/taxonomy` - Agent architecture guide
- `docs://ori/agents/sme-security` - Security SME (OWASP Top 10)
- `schema://ori/config` - Configuration JSON schema
- `schema://ori/handoff-packet` - Handoff packet schema

**Dynamic Resources (Future):**
- `logs://workflow/{traceId}/execution` - Workflow execution logs
- `logs://workflow/{traceId}/handoff-packets` - Inter-phase context
- `logs://workflow/{traceId}/sme-reviews` - SME findings

### 🔄 Sync Mechanism

- **File Watcher:** Auto-detect changes to ORI resource files
- **Git Sync:** Auto-commit and push to GitHub
- **NPM Publish:** Auto-publish on version bumps
- **Hot Reload:** Restart MCP server on config changes

### 📊 Quality Assurance

- **SME Agents:** Specialized quality gates (Security, Compliance, Code Quality, Performance)
- **Handoff Packets:** Zero-context-loss phase transitions
- **Trace IDs:** End-to-end tracking with feedback loop
- **Safety Hooks:** Pre/post-phase validation

## Installation

### Option 1: NPM Package (Recommended)

1. Install the MCP server:
   ```bash
   npm install -g @grandinharrison/mcp-server-ori
   ```

2. Configure Claude Desktop:

   **macOS:** Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

   **Windows:** Edit `%APPDATA%/Claude/claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "ori-workflow": {
         "command": "npx",
         "args": ["-y", "@grandinharrison/mcp-server-ori"],
         "env": {
           "LOG_LEVEL": "info"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop completely (Quit and reopen)

4. Verify installation by checking for the MCP server indicator in the chat input area

### Option 2: Local Development

```bash
git clone https://github.com/grandinh/mcp-server-ori.git
cd mcp-server-ori
npm install
npm run build
```

Configure Claude Desktop to use local build:

```json
{
  "mcpServers": {
    "ori-workflow-dev": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-ori/dist/index.js"],
      "env": {
        "LOG_LEVEL": "debug",
        "ENABLE_SYNC": "true"
      }
    }
  }
}
```

## Usage

### Basic Workflow Execution

```
Use the execute_ori tool with task: "Implement JWT authentication for Express API"
```

The MCP server will return structured instructions for Claude to execute the ORI workflow phases.

### With SME Quality Gates

```
Use the execute_ori tool with:
- task: "Implement JWT authentication for Express API"
- config: { sme_enabled: true, security_sme: true }
```

### Task Analysis

```
Use the analyze_task tool with task: "Refactor user authentication system"
```

Returns:
- Complexity (LOW/MEDIUM/HIGH)
- Domain classification
- Clarity score (0-1)
- Risk flags (security, privacy, compliance)
- Recommended model (Opus/Sonnet/Haiku)
- Estimated duration

### Config Validation

```
Use the validate_config tool with config_path: "/path/to/ori-config.json"
```

Returns validation errors and warnings.

## Configuration

Create `~/.claude/ori-config.json`:

```json
{
  "version": "1.2.0",
  "sme_agents": {
    "enabled": false,
    "security": {
      "enabled": false,
      "auto_invoke_on_keywords": ["auth", "crypto", "password", "jwt"],
      "block_on_critical": true
    },
    "compliance": {
      "enabled": false
    },
    "code_quality": {
      "enabled": false
    },
    "performance": {
      "enabled": false
    }
  },
  "safety_hooks": {
    "enabled": true,
    "pre_phase": {
      "phase_3": ["git_check", "path_validation"]
    }
  },
  "logging": {
    "enabled": true,
    "log_directory": ".claude/ori-logs",
    "log_handoff_packets": true
  }
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           ORI MCP Server (Hybrid Architecture)          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐         ┌──────────────────────┐  │
│  │   TOOLS Layer   │         │  RESOURCES Layer     │  │
│  ├─────────────────┤         ├──────────────────────┤  │
│  │ execute_ori     │         │ Static Resources:    │  │
│  │ validate_config │         │  • docs://ori/...    │  │
│  │ analyze_task    │         │  • schema://ori/...  │  │
│  └─────────────────┘         │ Dynamic Resources:   │  │
│                              │  • logs://workflow/  │  │
│                              └──────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Sync Engine (3-way sync)                 │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ • File Watcher → Git Push                        │  │
│  │ • Version Bumper → NPM Publish                   │  │
│  │ • Hot Reload → MCP Server Restart                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Feedback

After executing an ORI workflow, you'll receive a feedback URL:

```
https://github.com/grandinh/mcp-server-ori/issues/new?template=workflow-feedback.yml&trace_id=<your-trace-id>
```

Your feedback helps improve the ORI workflow for everyone!

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Test

```bash
npm test
```

## Troubleshooting

### MCP Server Not Showing Up

1. Verify config file location and syntax (must be valid JSON)
2. Check Claude Desktop logs:
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%/Claude/logs/`
3. Ensure Node.js >= 18.0.0 is installed
4. Completely quit and restart Claude Desktop (not just reload)

### stderr vs stdout Errors

The MCP protocol requires all logs go to `stderr`, never `stdout`. This server correctly routes all output to `stderr`.

### Resources Not Loading

Verify the `resources/` directory exists and contains:
- `ori.md`
- `ori-config.json`
- `agents/README.md`
- `agents/sme-security.md`
- `schemas/handoff-packet.json`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT © Harrison Grandin

## Links

- **npm:** https://www.npmjs.com/package/@grandinharrison/mcp-server-ori
- **GitHub:** https://github.com/grandinh/mcp-server-ori
- **Issues:** https://github.com/grandinh/mcp-server-ori/issues
- **MCP Documentation:** https://modelcontextprotocol.io

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- Inspired by [ORI Workflow Framework](https://github.com/grandinh/prompts)
