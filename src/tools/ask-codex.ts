import type { CodexConfig } from "../types.js";
import type { AskCodexInput } from "../types.js";
import { runCodexSync } from "../codex/cli-wrapper.js";

export async function handleAskCodex(config: CodexConfig, input: AskCodexInput) {
  const workingDir = input.working_directory ?? config.defaultWorkingDir;
  const timeoutMs = (input.timeout_seconds ?? 120) * 1000;

  const startTime = Date.now();

  try {
    const result = await runCodexSync(
      config,
      input.prompt,
      workingDir,
      timeoutMs,
    );

    const elapsed = (Date.now() - startTime) / 1000;

    if (result.exitCode !== 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: "Codex returned a non-zero exit code.",
                exitCode: result.exitCode,
                stderr: result.stderr,
                stdout: result.stdout,
                elapsed_seconds: Math.round(elapsed),
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              response: result.resultMessage ?? result.stdout,
              elapsed_seconds: Math.round(elapsed),
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (err) {
    const elapsed = (Date.now() - startTime) / 1000;
    const message =
      err instanceof Error ? err.message : "Unknown error";

    const isAuthError =
      message.includes("auth") ||
      message.includes("token") ||
      message.includes("login");

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: isAuthError
                ? `Codex authentication issue: ${message}. Run "codex" in your terminal to re-authenticate.`
                : message,
              elapsed_seconds: Math.round(elapsed),
            },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }
}
