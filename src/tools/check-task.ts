import type { TaskStore } from "../codex/task-store.js";
import type { CheckTaskInput } from "../types.js";

export function handleCheckTask(store: TaskStore, input: CheckTaskInput) {
  const task = store.get(input.task_id);

  if (!task) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: `Task "${input.task_id}" not found.`,
            available_tasks: store.list().map((t) => t.id),
          }),
        },
      ],
      isError: true,
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
            elapsed_seconds: Math.round(elapsed),
            prompt_summary: task.prompt.slice(0, 100),
          },
          null,
          2,
        ),
      },
    ],
  };
}
