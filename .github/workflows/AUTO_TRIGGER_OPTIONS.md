# Claude Code Auto-Trigger Options

Instead of requiring `@claude` mention, you can configure automatic triggering with safety controls.

## Current Setup: `claude-auto.yml`

The `claude-auto.yml` workflow triggers automatically when:

1. **Label-based:** Issue/PR has the `claude-help` label
2. **Manual mention:** Comment contains `@claude` (fallback)
3. **User-specific:** Issues/PRs opened by `grandinh`

## Safety Features

### Rate Limiting

GitHub Actions has built-in concurrency limits:
- **Free tier:** 20 concurrent jobs
- **Pro tier:** 40 concurrent jobs
- Workflow runs are queued if limit is reached

### Cost Control

Monitor your usage at: https://github.com/settings/billing

**Tips:**
- Use labels to control when Claude runs
- Set repository-level concurrency limits
- Monitor workflow runs in Actions tab

## Configuration Options

### Option 1: Label-Based Triggering (Recommended)

**Pros:**
- Full control over when Claude runs
- No accidental triggers
- Easy to see which issues have Claude enabled

**Usage:**
1. Create an issue
2. Add the `claude-help` label
3. Claude automatically starts working

**Create the label:**

```bash
gh label create claude-help \
  --repo grandinh/mcp-server-ori \
  --description "Automatically invoke Claude Code" \
  --color "1d76db"
```

### Option 2: User-Specific Auto-Trigger

Already configured for `grandinh`. To add more users, edit the workflow:

```yaml
if: |
  (github.event.issue.user.login == 'grandinh') ||
  (github.event.issue.user.login == 'teammate1') ||
  (github.event.issue.user.login == 'teammate2')
```

### Option 3: Repository Collaborators Only

Only trigger for users with write access:

```yaml
if: |
  contains(fromJSON('["OWNER", "MEMBER", "COLLABORATOR"]'), github.event.issue.author_association)
```

### Option 4: File Pattern-Based (PRs only)

Trigger only for PRs that modify specific files:

```yaml
on:
  pull_request:
    paths:
      - 'src/**/*.ts'
      - 'src/**/*.js'
      - 'lib/**'

jobs:
  claude:
    runs-on: ubuntu-latest
    # Auto-runs for all PRs matching the paths
```

### Option 5: Scheduled Auto-Reviews

Run Claude on a schedule to review all open PRs:

```yaml
on:
  schedule:
    - cron: '0 9 * * MON'  # Every Monday at 9 AM UTC

jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - name: Get open PRs
        # Fetch all open PRs and trigger Claude reviews
```

## Advanced: Concurrency Control

Limit concurrent Claude runs to prevent overwhelming the system:

```yaml
concurrency:
  group: claude-${{ github.event.issue.number || github.event.pull_request.number }}
  cancel-in-progress: false  # Don't cancel running jobs
```

## Advanced: Budget Limits

Set spending limits in your workflow:

```yaml
jobs:
  claude:
    if: |
      (contains(github.event.issue.labels.*.name, 'claude-help')) &&
      (github.event.repository.private == false)  # Only run on public repos
```

## Recommended Setup for Production

```yaml
name: Claude Code (Production)

on:
  issues:
    types: [labeled]
  pull_request:
    types: [labeled, opened]
  issue_comment:
    types: [created]

jobs:
  claude:
    if: |
      (contains(github.event.issue.labels.*.name, 'claude-help')) ||
      (contains(github.event.pull_request.labels.*.name, 'claude-review')) ||
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude'))

    concurrency:
      group: claude-${{ github.event.issue.number || github.event.pull_request.number }}
      cancel-in-progress: false

    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v5

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          claude_args: |
            --max-turns 15
```

**Benefits:**
- `claude-help` label for issues
- `claude-review` label for PRs
- `@claude` mention still works
- Concurrency control prevents overlapping runs
- 15 turn limit to control costs

## Usage Examples

### Example 1: Bug Report with Auto-Trigger

```
Title: Login button not working
Labels: bug, claude-help

Description:
Users are reporting that the login button doesn't respond when clicked.
Steps to reproduce: ...

Claude will automatically start investigating and proposing fixes.
```

### Example 2: PR Review

```
Title: Add JWT authentication
Labels: claude-review

Claude will automatically review the PR and suggest improvements.
```

### Example 3: Manual Override

```
Comment on any issue/PR:
@claude can you help with this specific part?

Works even without labels.
```

## Monitoring

Monitor Claude's activity:

1. **Actions tab:** https://github.com/grandinh/mcp-server-ori/actions
2. **Workflow runs:** Filter by "Claude Code"
3. **Billing:** https://github.com/settings/billing

## Disable Auto-Trigger

To disable auto-triggering temporarily:

1. Go to: https://github.com/grandinh/mcp-server-ori/actions/workflows/claude-auto.yml
2. Click "Disable workflow"
3. `@claude` mentions will still work via `claude-direct.yml`

## Choose Your Workflow

You now have **3 workflows:**

1. **`claude.yml`** - Reusable workflow (infrastructure)
2. **`claude-direct.yml`** - Manual @claude mentions only
3. **`claude-auto.yml`** - Auto-trigger with labels + manual mentions

**Recommendation:**
- Keep `claude-auto.yml` active for automatic help
- Disable `claude-direct.yml` to avoid duplicates
- Keep `claude.yml` as the base for other repos

---

**Created:** 2025-11-09
**Repository:** mcp-server-ori
