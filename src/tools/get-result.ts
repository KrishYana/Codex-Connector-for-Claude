import type { TaskStore } from "../codex/task-store.js";
import type { GetResultInput } from "../types.js";

export function handleGetResult(store: TaskStore, input: GetResultInput) {
  const task = store.get(input.task_id);

  if (!task) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: `Task "${input.task_id}" not found.`,
          }),
        },
      ],
      isError: true,
    };
  }

  if (task.status === "running") {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            taskId: task.id,
            status: "running",
            message: "Task is still running. Use codex_check to monitor progress.",
            partial_output: task.output.slice(-500),
          }),
        },
      ],
    };
  }

  const elapsed = ((task.endTime ?? Date.now()) - task.startTime) / 1000;

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            taskId: task.id,
            status: task.status,
            output: task.output,
            error: task.errorOutput || undefined,
            elapsed_seconds: Math.round(elapsed),
          },
          null,
          2,
        ),
      },
    ],
  };
}
