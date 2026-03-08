import type { TaskStore } from "../codex/task-store.js";
import type { ListTasksInput } from "../types.js";

export function handleListTasks(store: TaskStore, input: ListTasksInput) {
  const tasks = store.list(input.status_filter);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            total: tasks.length,
            tasks: tasks.map((t) => ({
              taskId: t.id,
              status: t.status,
              prompt_summary: t.prompt.slice(0, 100),
              model: t.model,
              submitted_at: new Date(t.startTime).toISOString(),
              elapsed_seconds: Math.round(
                ((t.endTime ?? Date.now()) - t.startTime) / 1000,
              ),
            })),
          },
          null,
          2,
        ),
      },
    ],
  };
}
