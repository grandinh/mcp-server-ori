# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-08

### Added

#### Tools
- **`execute_ori`**: Execute complete ORI workflow with progress tracking
  - Support for custom trace IDs
  - SME quality gate configuration
  - Detailed workflow instructions generation
  - Automatic feedback URL generation
- **`validate_config`**: Validate ORI configuration files against schema
  - Zod-based schema validation
  - Warning detection for common issues
  - Support for both file paths and raw content
- **`analyze_task`**: Pre-flight task analysis
  - Complexity detection (LOW/MEDIUM/HIGH)
  - Domain classification (Security/Auth, API/Backend, Frontend/UI, etc.)
  - Clarity score calculation (0-1)
  - Risk flag detection (security, privacy, compliance, policy)
  - Model recommendation (Opus/Sonnet/Haiku)
  - Duration estimation

#### Resources
- **Static Resources**:
  - `docs://ori/workflow` - Complete ORI specification (ori.md)
  - `docs://ori/agents/taxonomy` - Agent architecture guide
  - `docs://ori/agents/sme-security` - Security SME specification (OWASP Top 10)
  - `schema://ori/config` - Configuration JSON schema
  - `schema://ori/handoff-packet` - Handoff packet schema
- **Dynamic Resource Templates** (future implementation):
  - `logs://workflow/{traceId}/execution`
  - `logs://workflow/{traceId}/handoff-packets`
  - `logs://workflow/{traceId}/sme-reviews`

#### Sync Mechanism
- File watcher for automatic resource synchronization
- Hot-reload support (via `ENABLE_SYNC` env var)
- Placeholder for git sync and NPM auto-publish

#### Infrastructure
- Winston-based logging (all output to stderr for MCP compliance)
- Trace ID generation and validation (UUID v4)
- Structured error handling across all tools
- TypeScript with strict mode enabled
- ESLint configuration
- GitHub Actions CI workflow (Node 18/20/22)
- GitHub Actions NPM publish workflow (on release)

#### Documentation
- Comprehensive README with installation, usage, architecture
- CONTRIBUTING.md with development guidelines
- GitHub Issue template for workflow feedback
- MIT License
- CHANGELOG

### Technical Details

**Dependencies**:
- `@modelcontextprotocol/sdk` ^1.7.0
- `chokidar` ^4.0.0 (file watching)
- `winston` ^3.17.0 (logging)
- `zod` ^3.24.1 (schema validation)
- `semver` ^7.6.0 (version management)

**Node.js**: >= 18.0.0

**Package Structure**:
```
mcp-server-ori/
├── src/           # TypeScript source
├── dist/          # Compiled JavaScript
├── resources/     # Bundled ORI specs
└── .github/       # Workflows & templates
```

### Architecture

- **Hybrid MCP Server**: Exposes both tools (executable) and resources (readable)
- **Tool-First Design**: Claude invokes `execute_ori` to start workflows
- **Resource Discovery**: All ORI documentation accessible via resource URIs
- **Feedback Loop**: Automatic GitHub Issue URL generation with trace ID

### Known Limitations

- Dynamic resources (logs) not yet implemented (templates registered for future use)
- Sync mechanism is a placeholder (file watcher exists but sync logic TODO)
- No automated tests yet (manual testing only)
- SME agent execution is simulated (instructions returned, not actual API calls)

### Breaking Changes

None (initial release)

---

## [Unreleased]

### Planned for v1.1.0

- [ ] Implement dynamic resource handlers for workflow logs
- [ ] Complete sync mechanism (git commit/push)
- [ ] Add automated tests (Jest)
- [ ] Add Compliance SME agent specification
- [ ] Add Code Quality SME agent specification
- [ ] Add Performance SME agent specification

### Planned for v2.0.0

- [ ] Full Claude API integration for actual ORI execution
- [ ] Real-time progress notifications during long workflows
- [ ] Handoff packet persistence to disk
- [ ] SME review caching
- [ ] Desktop Extension (.mcpb) packaging

---

[1.0.0]: https://github.com/grandinh/mcp-server-ori/releases/tag/v1.0.0
