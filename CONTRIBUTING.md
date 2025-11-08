# Contributing to MCP Server ORI

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Claude Desktop (for testing)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/grandinh/mcp-server-ori.git
cd mcp-server-ori

# Install dependencies
npm install

# Build the project
npm run build

# Run in watch mode
npm run watch
```

### Local Testing

1. Build the project: `npm run build`

2. Configure Claude Desktop to use local build:

   **macOS:** Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "ori-workflow-dev": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-server-ori/dist/index.js"],
         "env": {
           "LOG_LEVEL": "debug"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop completely

4. Check logs at `~/Library/Logs/Claude/`

## Project Structure

```
mcp-server-ori/
├── src/
│   ├── index.ts                 # Main server entry point
│   ├── tools/                   # Tool implementations
│   │   ├── index.ts
│   │   ├── execute-ori.ts
│   │   ├── validate-config.ts
│   │   └── analyze-task.ts
│   ├── resources/               # Resource handlers
│   │   └── index.ts
│   ├── sync/                    # Sync mechanism
│   │   ├── index.ts
│   │   └── file-watcher.ts
│   ├── logging/                 # Logging utilities
│   │   ├── logger.ts
│   │   └── trace.ts
│   └── utils/                   # Shared utilities
│
├── resources/                    # Bundled static resources
│   ├── ori.md
│   ├── ori-config.json
│   ├── agents/
│   └── schemas/
│
├── .github/
│   ├── workflows/               # CI/CD workflows
│   └── ISSUE_TEMPLATE/          # Issue templates
│
└── dist/                         # Compiled output (gitignored)
```

## Coding Standards

### TypeScript

- Use strict mode (`strict: true` in tsconfig.json)
- Prefer explicit types over `any`
- Use ESM imports (`import/export`, not `require`)
- Follow existing naming conventions

### Logging

**CRITICAL:** All logs MUST go to `stderr`, never `stdout` (breaks MCP protocol)

```typescript
// ✅ CORRECT
import { logger } from "./logging/logger.js";
logger.info("Message");

// ❌ WRONG - Breaks MCP protocol
console.log("Message");
```

### Error Handling

```typescript
// Tool implementations should catch errors and return structured responses
try {
  const result = await doSomething();
  return {
    content: [{ type: "text", text: JSON.stringify(result) }],
  };
} catch (error) {
  return {
    content: [
      {
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
      },
    ],
    isError: true,
  };
}
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new tool for ...`
- `fix: resolve issue with ...`
- `docs: update README with ...`
- `chore: bump dependencies`
- `refactor: improve performance of ...`

## Adding New Tools

1. Create tool file in `src/tools/`:

   ```typescript
   // src/tools/my-new-tool.ts
   import { logger } from "../logging/logger.js";
   import { ToolHandler } from "./index.js";

   export const myNewTool: ToolHandler = async (args: any) => {
     logger.info("My new tool invoked", { args });

     try {
       // Implementation
       return {
         content: [{ type: "text", text: "Result" }],
       };
     } catch (error) {
       return {
         content: [{ type: "text", text: `Error: ${error}` }],
         isError: true,
       };
     }
   };
   ```

2. Register in `src/tools/index.ts`:

   ```typescript
   import { myNewTool } from "./my-new-tool.js";

   export async function registerTools() {
     return {
       execute_ori: executeOriTool,
       my_new_tool: myNewTool, // Add here
     };
   }
   ```

3. Add schema in `src/index.ts` `ListToolsRequestSchema` handler

4. Add tests and documentation

## Adding New Resources

1. Add static resource in `src/resources/index.ts`:

   ```typescript
   {
     uri: "docs://ori/my-doc",
     name: "my-documentation",
     description: "My new documentation",
     mimeType: "text/markdown",
     filePath: path.join(resourcesDir, "my-doc.md"),
     read: async function() {
       return await fs.readFile(this.filePath, "utf-8");
     },
   }
   ```

2. Add the actual file to `resources/my-doc.md`

3. Update README.md with new resource

## Testing

### Manual Testing Checklist

- [ ] Build completes without errors
- [ ] MCP server starts in Claude Desktop
- [ ] All tools appear in tool list
- [ ] All resources appear in resource list
- [ ] Tools execute successfully
- [ ] Resources load correctly
- [ ] Errors are handled gracefully
- [ ] Logs go to stderr (check with `LOG_LEVEL=debug`)

### Automated Tests (Future)

```bash
npm test
```

## Submitting Changes

### Pull Request Process

1. **Fork** the repository

2. **Create a feature branch**:
   ```bash
   git checkout -b feat/my-new-feature
   ```

3. **Make changes** following coding standards

4. **Commit** with conventional commit messages:
   ```bash
   git commit -m "feat: add analyze_code tool"
   ```

5. **Push** to your fork:
   ```bash
   git push origin feat/my-new-feature
   ```

6. **Open a Pull Request** on GitHub

7. **Address review feedback** if needed

### PR Requirements

- [ ] Code builds without errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (README.md, JSDoc comments)
- [ ] CHANGELOG.md updated
- [ ] Commits follow conventional commit format

## Release Process

Releases are automated via GitHub Actions:

1. **Update version** in `package.json` following [SemVer](https://semver.org/):
   - `1.0.0` → `1.0.1` (patch: bug fixes)
   - `1.0.0` → `1.1.0` (minor: new features, backward compatible)
   - `1.0.0` → `2.0.0` (major: breaking changes)

2. **Update CHANGELOG.md** with release notes

3. **Create a GitHub Release** with tag `v1.x.x`

4. **GitHub Action** automatically publishes to NPM

## Getting Help

- **Questions:** Open a [Discussion](https://github.com/grandinh/mcp-server-ori/discussions)
- **Bugs:** Open an [Issue](https://github.com/grandinh/mcp-server-ori/issues/new)
- **Security:** Email security@grandinharrison.com (do NOT open public issue)

## Code of Conduct

Be respectful, inclusive, and collaborative. We're all here to build something great together.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
