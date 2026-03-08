import type { TaskStore } from "../codex/task-store.js";
import type { CancelTaskInput } from "../types.js";

export function handleCancelTask(store: TaskStore, input: CancelTaskInput) {
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

  if (task.status !== "running") {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            taskId: task.id,
            status: task.status,
            message: `Task is not running (status: ${task.status}). Cannot cancel.`,
          }),
        },
      ],
    };
  }

  const cancelled = store.cancel(input.task_id);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          taskId: task.id,
          status: "cancelled",
          message: cancelled
            ? "Task cancelled successfully."
            : "Failed to cancel task.",
        }),
      },
    ],
  };
}
