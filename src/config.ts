import type { CodexConfig, SandboxMode } from "./types.js";
import { execSync } from "node:child_process";

function findCodexPath(): string {
  const envPath = process.env.CODEX_PATH;
  if (envPath) return envPath;

  try {
    return execSync("which codex", { encoding: "utf-8" }).trim();
  } catch {
    return "codex";
  }
}

function parseSandbox(value: string | undefined): SandboxMode {
  const valid: SandboxMode[] = ["read-only", "workspace-write", "danger-full-access"];
  if (value && valid.includes(value as SandboxMode)) {
    return value as SandboxMode;
  }
  return "read-only";
}

export function loadConfig(): CodexConfig {
  return {
    codexPath: findCodexPath(),
    defaultModel: process.env.CODEX_MODEL ?? "o4-mini",
    defaultSandbox: parseSandbox(process.env.CODEX_SANDBOX),
    defaultWorkingDir: process.env.CODEX_WORKING_DIR ?? process.cwd(),
    taskTimeoutMs: parseInt(process.env.CODEX_TASK_TIMEOUT_MS ?? "600000", 10),
    maxTaskAge: parseInt(process.env.CODEX_MAX_TASK_AGE_MS ?? "3600000", 10),
    maxConcurrentTasks: parseInt(process.env.CODEX_MAX_TASKS ?? "5", 10),
  };
}
