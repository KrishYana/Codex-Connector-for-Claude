import { v4 as uuidv4 } from "uuid";
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
    const id = uuidv4();
    const dir = workingDir ?? this.config.defaultWorkingDir;
    const mdl = model ?? this.config.defaultModel;
    const sb = sandbox ?? this.config.defaultSandbox;

    const { process: child, pid } = spawnCodexTask(
      this.config,
      prompt,
      dir,
      mdl,
      sb,
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
      if (record.status === "cancelled") return;
      record.status = code === 0 ? "completed" : "failed";
    });

    child.on("error", (err) => {
      record.endTime = Date.now();
      record.childProcess = null;
      if (record.status === "cancelled") return;
      record.status = "failed";
      record.errorOutput += `\nProcess error: ${err.message}`;
    });

    // Auto-timeout
    setTimeout(() => {
      if (record.status === "running") {
        this.cancel(id);
        record.status = "failed";
        record.errorOutput += `\nTask timed out after ${this.config.taskTimeoutMs / 1000}s`;
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
      setTimeout(() => {
        if (task.childProcess) {
          task.childProcess.kill("SIGKILL");
        }
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
        this.tasks.delete(id);
      }
    }
  }
}
