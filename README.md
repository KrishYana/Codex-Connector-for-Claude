# Codex Connector for Claude

An MCP (Model Context Protocol) server that connects Claude to OpenAI's Codex, enabling collaborative AI task orchestration. Claude handles reasoning and planning while Codex handles large code context ingestion and code-heavy tasks.

## Architecture

```
Claude Desktop (MCP Client)
    ↕ stdio (JSON-RPC)
Codex Connector MCP Server (this project)
    ↕ child_process
Codex CLI
    ↕
OpenAI Codex Cloud
```

## Prerequisites

- **Node.js** 18+
- **OpenAI Codex CLI** installed and authenticated ([github.com/openai/codex](https://github.com/openai/codex))
- **Claude Desktop** app

Verify Codex CLI is working:
```bash
codex --version
```

## Installation

```bash
git clone https://github.com/KrishYana/Codex-Connector-for-Claude.git
cd Codex-Connector-for-Claude
npm install
npm run build
```

## Setup in Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "codex-connector": {
      "command": "node",
      "args": ["/absolute/path/to/Codex-Connector-for-Claude/dist/index.js"],
      "env": {
        "CODEX_MODEL": "o4-mini",
        "CODEX_WORKING_DIR": "/path/to/your/project"
      }
    }
  }
}
```

Restart Claude Desktop after adding the configuration.

## Configuration

All configuration is via environment variables set in the Claude Desktop MCP config:

| Variable | Default | Description |
|----------|---------|-------------|
| `CODEX_PATH` | Auto-detected from PATH | Path to the `codex` binary |
| `CODEX_MODEL` | `o4-mini` | Default Codex model |
| `CODEX_SANDBOX` | `read-only` | Default sandbox mode: `read-only`, `workspace-write`, `danger-full-access` |
| `CODEX_WORKING_DIR` | Current directory | Default working directory for Codex tasks |
| `CODEX_TASK_TIMEOUT_MS` | `600000` (10 min) | Max time for a single task |
| `CODEX_MAX_TASK_AGE_MS` | `3600000` (1 hour) | How long to keep completed tasks in memory |

## Available Tools

### `codex_submit` — Submit async task
Send a code task to Codex that runs in the background. Returns a task ID immediately so Claude can continue working while Codex processes.

### `codex_check` — Check task status
Poll whether a submitted task is still running, completed, or failed.

### `codex_result` — Get task output
Retrieve the full output from a completed Codex task.

### `codex_list` — List all tasks
See all tracked tasks and their statuses. Useful when orchestrating multiple parallel tasks.

### `codex_cancel` — Cancel running task
Stop a running Codex task.

### `codex_ask` — Quick synchronous question
For short, fast queries where you need the answer immediately. Waits for completion with a configurable timeout.

## Usage Examples

Once configured, you can ask Claude things like:

> "Use Codex to analyze the entire src/ directory and summarize the architecture, while you review the README for documentation gaps."

> "Submit a task to Codex to refactor the database module to use connection pooling, and while it works on that, help me write the migration script."

> "Ask Codex what dependencies are used across all package.json files in this monorepo."

Claude will use the tools to delegate work to Codex and combine the results.

## Development

```bash
npm run dev    # Watch mode - recompile on changes
npm run build  # One-time build
npm start      # Run the MCP server directly
```

## License

MIT
