import type { ChildProcess } from "node:child_process";

export type TaskStatus =
  | "submitted"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "timed_out";

export type SandboxMode = "read-only" | "workspace-write" | "danger-full-access";

export interface TaskRecord {
  id: string;
  pid: number | null;
  status: TaskStatus;
  prompt: string;
  output: string;
  errorOutput: string;
  startTime: number;
  endTime: number | null;
  childProcess: ChildProcess | null;
  workingDirectory: string;
  model: string;
  sandbox: SandboxMode;
  resultFilePath: string | null;
}

export interface CodexConfig {
  codexPath: string;
  defaultModel: string;
  defaultSandbox: SandboxMode;
  defaultWorkingDir: string;
  taskTimeoutMs: number;
  maxTaskAge: number;
  maxConcurrentTasks: number;
}

export interface SubmitTaskInput {
  prompt: string;
  working_directory?: string;
  model?: string;
  sandbox?: SandboxMode;
}

export interface CheckTaskInput {
  task_id: string;
}

export interface GetResultInput {
  task_id: string;
}

export interface ListTasksInput {
  status_filter?: "all" | "running" | "completed" | "failed" | "cancelled" | "timed_out";
}

export interface CancelTaskInput {
  task_id: string;
}

export interface AskCodexInput {
  prompt: string;
  working_directory?: string;
  timeout_seconds?: number;
}
