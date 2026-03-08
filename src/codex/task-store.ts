import { v4 as uuidv4 } from "uuid";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink } from "node:fs/promises";
import type { TaskRecord, TaskStatus, CodexConfig, SandboxMode } from "../types.js";
import { spawnCodexTask } from "./cli-wrapper.js";

export class TaskStore {
  private tasks = new Map<string, TaskRecord>();
  private config: CodexConfig;

  constructor(config: CodexConfig) {
    this.config = config;
  }

  submit(
    prompt: string,
    workingDir?: string,
    model?: string,
    sandbox?: SandboxMode,
  ): TaskRecord {
    // Enforce concurrency limit
    const runningCount = this.list("running").length;
    if (runningCount >= this.config.maxConcurrentTasks) {
      throw new Error(
        `Concurrency limit reached (${this.config.maxConcurrentTasks} tasks running). ` +
        `Cancel or wait for a task to finish before submitting more.`,
      );
    }

    const id = uuidv4();
    const dir = workingDir ?? this.config.defaultWorkingDir;
    const mdl = model ?? this.config.defaultModel;
    const sb = sandbox ?? this.config.defaultSandbox;
    const resultFilePath = join(tmpdir(), `codex-result-${id}.md`);

    const { process: child, pid } = spawnCodexTask(
      this.config,
      prompt,
      dir,
      mdl,
      sb,
      resultFilePath,
    );

    const record: TaskRecord = {
      id,
      pid,
      status: "running",
      prompt,
      output: "",
      errorOutput: "",
      startTime: Date.now(),
      endTime: null,
      childProcess: child,
      workingDirectory: dir,
      model: mdl,
      sandbox: sb,
      resultFilePath,
    };

    child.stdout?.on("data", (data: Buffer) => {
      record.output += data.toString();
    });

    child.stderr?.on("data", (data: Buffer) => {
      record.errorOutput += data.toString();
    });

    child.on("close", (code) => {
      record.endTime = Date.now();
      record.childProcess = null;
      if (record.status === "cancelled" || record.status === "timed_out") return;
      record.status = code === 0 ? "completed" : "failed";
    });

    child.on("error", (err) => {
      record.endTime = Date.now();
      record.childProcess = null;
      if (record.status === "cancelled" || record.status === "timed_out") return;
      record.status = "failed";
      record.errorOutput += `\nProcess error: ${err.message}`;
    });

    // Auto-timeout with distinct timed_out status
    setTimeout(() => {
      if (record.status === "running") {
        record.status = "timed_out";
        record.endTime = Date.now();
        record.errorOutput += `\nTask timed out after ${this.config.taskTimeoutMs / 1000}s`;
        if (record.childProcess) {
          record.childProcess.kill("SIGTERM");
          const cp = record.childProcess;
          setTimeout(() => {
            try { cp.kill("SIGKILL"); } catch { /* already exited */ }
          }, 5000);
          record.childProcess = null;
        }
      }
    }, this.config.taskTimeoutMs);

    this.tasks.set(id, record);
    this.cleanup();
    return record;
  }

  get(id: string): TaskRecord | undefined {
    return this.tasks.get(id);
  }

  list(statusFilter?: string): TaskRecord[] {
    const all = Array.from(this.tasks.values());
    if (!statusFilter || statusFilter === "all") return all;
    return all.filter((t) => t.status === statusFilter);
  }

  cancel(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task || task.status !== "running") return false;

    task.status = "cancelled";
    task.endTime = Date.now();
    if (task.childProcess) {
      task.childProcess.kill("SIGTERM");
      const cp = task.childProcess;
      setTimeout(() => {
        try { cp.kill("SIGKILL"); } catch { /* already exited */ }
      }, 5000);
      task.childProcess = null;
    }
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, task] of this.tasks) {
      if (
        task.endTime &&
        now - task.endTime > this.config.maxTaskAge
      ) {
        if (task.resultFilePath) {
          unlink(task.resultFilePath).catch(() => {});
        }
        this.tasks.delete(id);
      }
    }
  }
}
