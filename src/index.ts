#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { TaskStore } from "./codex/task-store.js";
import { handleSubmitTask } from "./tools/submit-task.js";
import { handleCheckTask } from "./tools/check-task.js";
import { handleGetResult } from "./tools/get-result.js";
import { handleListTasks } from "./tools/list-tasks.js";
import { handleCancelTask } from "./tools/cancel-task.js";
import { handleAskCodex } from "./tools/ask-codex.js";

const config = loadConfig();
const taskStore = new TaskStore(config);

const server = new McpServer({
  name: "codex-connector",
  version: "1.0.0",
});

// Tool: codex_submit - Submit an async task to Codex
server.tool(
  "codex_submit",
  "Submit a code task to OpenAI Codex for async processing. Returns a task ID immediately. Use this for large code analysis, generation, or refactoring tasks that may take time. Codex excels at ingesting and working with large codebases.",
  {
    prompt: z.string().describe("The task/prompt to send to Codex"),
    working_directory: z
      .string()
      .optional()
      .describe("Working directory for Codex to operate in (defaults to configured dir)"),
    model: z
      .string()
      .optional()
      .describe("Codex model to use (defaults to configured model)"),
    sandbox: z
      .enum(["read-only", "workspace-write", "danger-full-access"])
      .optional()
      .describe("Sandbox mode for Codex execution (defaults to read-only)"),
  },
  async (input) => handleSubmitTask(taskStore, input),
);

// Tool: codex_check - Check task status
server.tool(
  "codex_check",
  "Check the status of a previously submitted Codex task. Returns whether the task is still running, completed, or failed.",
  {
    task_id: z.string().describe("The task ID returned by codex_submit"),
  },
  async (input) => handleCheckTask(taskStore, input),
);

// Tool: codex_result - Get completed task output
server.tool(
  "codex_result",
  "Retrieve the full output from a completed Codex task. If the task is still running, returns partial output and a message to wait.",
  {
    task_id: z.string().describe("The task ID returned by codex_submit"),
  },
  async (input) => handleGetResult(taskStore, input),
);

// Tool: codex_list - List all tasks
server.tool(
  "codex_list",
  "List all Codex tasks and their statuses. Useful for tracking multiple parallel tasks.",
  {
    status_filter: z
      .enum(["all", "running", "completed", "failed"])
      .optional()
      .describe("Filter tasks by status (defaults to all)"),
  },
  async (input) => handleListTasks(taskStore, input),
);

// Tool: codex_cancel - Cancel a running task
server.tool(
  "codex_cancel",
  "Cancel a running Codex task. Only works on tasks with status 'running'.",
  {
    task_id: z.string().describe("The task ID to cancel"),
  },
  async (input) => handleCancelTask(taskStore, input),
);

// Tool: codex_ask - Quick synchronous question
server.tool(
  "codex_ask",
  "Ask Codex a quick question and wait for the response. Use this for short, fast queries where you need the answer immediately. For longer tasks, use codex_submit instead.",
  {
    prompt: z.string().describe("The question/prompt to send to Codex"),
    working_directory: z
      .string()
      .optional()
      .describe("Working directory for Codex to operate in"),
    timeout_seconds: z
      .number()
      .optional()
      .describe("Max seconds to wait for response (default: 120)"),
  },
  async (input) => handleAskCodex(config, input),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Codex Connector MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting Codex Connector:", err);
  process.exit(1);
});
