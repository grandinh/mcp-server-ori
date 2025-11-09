# GitHub ↔ Linear Integration

Automatic two-way sync between GitHub issues and Linear issues, with Claude Code Action support on both platforms.

## What It Does

### GitHub → Linear
1. Create a GitHub issue with the `linear-sync` label
2. Workflow automatically creates a matching Linear issue
3. Links them together with comments
4. Syncs GitHub comments to Linear

### Claude Integration
- Claude Code Action works on GitHub issues
- Changes sync to Linear automatically
- Both platforms stay in sync

## Setup

### Step 1: Add Linear API Key to GitHub Secrets

You need to add your Linear API key to GitHub repository secrets:

1. Go to: https://github.com/grandinh/mcp-server-ori/settings/secrets/actions/new
2. **Name:** `LINEAR_API_KEY`
3. **Value:** `<your-linear-api-key>`
4. Click "Add secret"

### Step 2: Create the `linear-sync` Label

```bash
gh label create linear-sync \
  --repo grandinh/mcp-server-ori \
  --description "Sync this issue to Linear" \
  --color "7B68EE"
```

### Step 3: Push the Workflow

The workflow file is already created. Just push it:

```bash
cd ~/mcp-server-ori
git add .github/workflows/linear-sync.yml
git commit -m "Add GitHub to Linear sync workflow"
git push
```

## Usage

### Create a Synced Issue

**Option 1: Via GitHub UI**
1. Create a new issue
2. Add the `linear-sync` label
3. Issue is automatically created in Linear
4. Comment appears with Linear link

**Option 2: Via CLI**
```bash
gh issue create \
  --repo grandinh/mcp-server-ori \
  --title "Add JWT authentication" \
  --body "Need to implement JWT auth for API endpoints" \
  --label "linear-sync"
```

**Option 3: With Claude Auto-Trigger**
```bash
gh issue create \
  --repo grandinh/mcp-server-ori \
  --title "Refactor authentication flow" \
  --body "Need to refactor the auth system" \
  --label "linear-sync,claude-help"
```

This will:
- Create GitHub issue
- Create Linear issue
- Trigger Claude to start working
- Claude's work syncs to Linear

### Comment Sync

When you comment on a GitHub issue with the `linear-sync` label:
- Your comment automatically appears in Linear
- Attributed to you with a link back to GitHub

## How It Works

### Workflow Triggers

```yaml
on:
  issues:
    types: [opened, labeled, edited]
  issue_comment:
    types: [created]
```

### Linear API Integration

The workflow uses Linear's GraphQL API to:
1. **Get your team ID** - Auto-selects your first team
2. **Create issues** - With title, description, and GitHub link
3. **Add comments** - Syncs GitHub comments to Linear
4. **Link issues** - Adds comment on GitHub with Linear URL

### State Management

- Checks if Linear issue already exists (via bot comment)
- Only creates new Linear issue if one doesn't exist
- Syncs subsequent comments to existing Linear issue

## Customization

### Select a Specific Linear Team

By default, it uses your first team. To use a specific team:

1. Get your team IDs:
```bash
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: <your-linear-api-key>" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { teams { nodes { id name } } }"}' | jq
```

2. Edit `.github/workflows/linear-sync.yml` line ~60:
```yaml
# Change this line:
TEAM_ID=$(echo "$RESPONSE" | jq -r '.data.teams.nodes[0].id')

# To use a specific team:
TEAM_ID="your-team-id-here"
```

### Auto-assign in Linear

Add assignee to Linear issues:

```yaml
# In the create_linear step, modify the mutation:
mutation {
  issueCreate(input: {
    teamId: "...",
    title: "...",
    description: ...,
    assigneeId: "your-linear-user-id"
  }) {
    success
    issue { id identifier url }
  }
}
```

### Add Linear Labels/Projects

```yaml
# Add to the mutation:
labelIds: ["label-id-1", "label-id-2"]
projectId: "project-id"
```

## Workflow with Claude

### Complete Example: Feature Request

```bash
# 1. Create issue with both labels
gh issue create \
  --repo grandinh/mcp-server-ori \
  --title "Add rate limiting to API" \
  --body "@claude Please implement rate limiting for our API endpoints with Redis" \
  --label "linear-sync,claude-help"
```

**What happens:**
1. GitHub issue created
2. Linear issue created (via `linear-sync`)
3. Claude starts working (via `claude-help`)
4. Claude's comments sync to Linear
5. Both teams can track progress

### Just Linear Sync (No Claude)

```bash
gh issue create \
  --repo grandinh/mcp-server-ori \
  --title "Update documentation" \
  --body "Need to document the new auth flow" \
  --label "linear-sync"
```

**What happens:**
1. GitHub issue created
2. Linear issue created
3. Manual work - no auto-Claude

## Monitoring

### Check Workflow Runs

```bash
# View recent workflow runs
gh run list --repo grandinh/mcp-server-ori --workflow "GitHub ↔ Linear Sync"

# View specific run details
gh run view <run-id> --repo grandinh/mcp-server-ori
```

### Verify Linear Issues

1. Open Linear: https://linear.app
2. Check your team's issues
3. Look for issues with "GitHub Issue:" in description

## Troubleshooting

### "Failed to create Linear issue"

**Causes:**
- Invalid Linear API key
- Team ID not found
- Missing permissions

**Fix:**
```bash
# Test your API key
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: <your-linear-api-key>" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { viewer { id name } }"}'

# Should return your user info
```

### Workflow not triggering

**Causes:**
- Label misspelled (must be exactly `linear-sync`)
- Workflow file not pushed to GitHub
- LINEAR_API_KEY secret not set

**Fix:**
1. Check label exists: `gh label list --repo grandinh/mcp-server-ori`
2. Check workflow exists: `gh workflow list --repo grandinh/mcp-server-ori`
3. Check secret exists in repo settings

### Duplicate Linear issues

**Cause:** Bot comment detection failed

**Fix:** The workflow checks for existing Linear issues by looking for bot comments. If it creates duplicates, manually close them in Linear.

## Future Enhancements

### Linear → GitHub (Reverse Sync)

To sync Linear updates back to GitHub, you'll need:
1. Linear webhook setup
2. Endpoint to receive webhooks (e.g., GitHub Action workflow_dispatch)
3. Update GitHub issue when Linear issue changes

**This is more complex** and requires a webhook receiver. Let me know if you want this!

### Status Sync

Sync issue states:
- Linear "In Progress" → GitHub issue assigned
- Linear "Done" → GitHub issue closed

### Bi-directional Comments

Currently: GitHub → Linear (one-way)
Future: Linear comments also sync to GitHub

## All Available Labels

After setup, you can combine labels:

| Labels | Effect |
|--------|--------|
| `linear-sync` | Sync to Linear only |
| `claude-help` | Claude works on GitHub only |
| `linear-sync,claude-help` | Both! Claude works + syncs to Linear |

## Examples

### Bug Report with Claude

```bash
gh issue create \
  --title "Login button broken on mobile" \
  --body "@claude The login button isn't responding on iOS Safari. Can you investigate and fix?" \
  --label "bug,linear-sync,claude-help"
```

### Feature Request (Manual)

```bash
gh issue create \
  --title "Add dark mode toggle" \
  --body "Users requesting dark mode support" \
  --label "enhancement,linear-sync"
```

### Discussion (No Sync)

```bash
gh issue create \
  --title "Architecture discussion: API redesign" \
  --body "Let's discuss the new API architecture" \
  --label "discussion"
```

---

**Created:** 2025-11-09
**Repository:** mcp-server-ori
**Linear API Version:** GraphQL API
