"use client";

import { useState } from "react";
import { TaskDetails } from "@/app/components/tasks/task-details";
import type { SessionHistoryItem } from "@/lib/client/types";

type HistoryListItemProps = {
  session: SessionHistoryItem;
};

function formatSessionDate(createdAt: string) {
  const date = new Date(createdAt);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} UTC`;
}

export function HistoryListItem({ session }: HistoryListItemProps) {
  const [open, setOpen] = useState(false);
  const completedCount = session.tasks.filter((task) => task.completed).length;

  return (
    <li className="rounded-lg border border-zinc-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{formatSessionDate(session.createdAt)}</p>
          <p className="text-xs text-zinc-600">
            Mood: {session.mood} | Time: {session.availableTime} min
          </p>
          {session.goal ? <p className="mt-1 text-xs text-zinc-600">Goal: {session.goal}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-zinc-700">
            {completedCount}/{session.tasks.length} tasks completed
          </p>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
            aria-expanded={open}
          >
            {open ? "Hide details" : "View details"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mt-4 space-y-3">
          {session.feedback ? (
            <p className="text-xs text-zinc-700">
              Feedback: difficulty {session.feedback.difficultyRating}/5, focus {session.feedback.focusRating}/5
            </p>
          ) : (
            <p className="text-xs text-zinc-500">No feedback submitted.</p>
          )}
          <ul className="space-y-3">
            {session.tasks.map((item) => (
              <li key={item.taskId}>
                <TaskDetails
                  task={item.task}
                  completionLabel={item.completed ? "Completed" : "Not completed"}
                  completionVariant={item.completed ? "done" : "pending"}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
