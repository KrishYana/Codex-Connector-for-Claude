import type { TaskStore } from "../codex/task-store.js";
import type { SubmitTaskInput } from "../types.js";

export function handleSubmitTask(store: TaskStore, input: SubmitTaskInput) {
  const task = store.submit(
    input.prompt,
    input.working_directory,
    input.model,
    input.sandbox,
  );

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            taskId: task.id,
            status: task.status,
            message: `Task submitted to Codex. Use codex_check with task_id "${task.id}" to monitor progress.`,
            model: task.model,
            sandbox: task.sandbox,
            workingDirectory: task.workingDirectory,
          },
          null,
          2,
        ),
      },
    ],
  };
}
