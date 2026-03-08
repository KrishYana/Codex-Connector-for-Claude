import { spawn, type ChildProcess } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { readFile, unlink } from "node:fs/promises";
import type { CodexConfig, SandboxMode } from "../types.js";

export interface SpawnResult {
  process: ChildProcess;
  pid: number;
}

export interface SyncResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  resultMessage: string | null;
}

export function spawnCodexTask(
  config: CodexConfig,
  prompt: string,
  workingDir: string,
  model: string,
  sandbox: SandboxMode,
  resultFilePath: string,
): SpawnResult {
  const args = [
    "exec",
    "--json",
    "--ephemeral",
    "--output-last-message", resultFilePath,
    "-a", "never",
    "-s", sandbox,
    "--model", model,
    prompt,
  ];

  const child = spawn(config.codexPath, args, {
    cwd: workingDir,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  return {
    process: child,
    pid: child.pid ?? -1,
  };
}

export async function runCodexSync(
  config: CodexConfig,
  prompt: string,
  workingDir: string,
  timeoutMs: number,
): Promise<SyncResult> {
  const resultFile = join(tmpdir(), `codex-ask-${randomUUID()}.md`);
  const args = [
    "exec",
    "--json",
    "--ephemeral",
    "--output-last-message", resultFile,
    "-a", "never",
    "-s", "read-only",
    "--model", config.defaultModel,
    prompt,
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(config.codexPath, args, {
      cwd: workingDir,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5000);
    }, timeoutMs);

    child.stdout?.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("close", async (code) => {
      clearTimeout(timer);

      if (timedOut) {
        await unlink(resultFile).catch(() => {});
        reject(new Error(`Codex task timed out after ${timeoutMs / 1000}s`));
        return;
      }

      let resultMessage: string | null = null;
      try {
        resultMessage = await readFile(resultFile, "utf-8");
      } catch {
        // File may not exist if Codex crashed before writing
      }
      await unlink(resultFile).catch(() => {});

      resolve({ stdout, stderr, exitCode: code, resultMessage });
    });

    child.on("error", async (err) => {
      clearTimeout(timer);
      await unlink(resultFile).catch(() => {});
      reject(err);
    });
  });
}

export function verifyCodexInstalled(config: CodexConfig): string | null {
  try {
    const child = spawn(config.codexPath, ["--version"], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    return new Promise((resolve) => {
      let output = "";
      child.stdout?.on("data", (data: Buffer) => {
        output += data.toString();
      });
      child.on("close", (code) => {
        if (code === 0) {
          resolve(null);
        } else {
          resolve(`Codex CLI exited with code ${code}`);
        }
      });
      child.on("error", () => {
        resolve(
          `Codex CLI not found at "${config.codexPath}". Install it from https://github.com/openai/codex or set CODEX_PATH.`,
        );
      });

      setTimeout(() => resolve(null), 5000);
    }) as unknown as string | null;
  } catch {
    return `Codex CLI not found at "${config.codexPath}".`;
  }
}
