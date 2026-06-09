"use client";

import { useState, type CSSProperties } from "react";
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
    <li className="rounded-[1.75rem] border border-violet-200/70 bg-white p-5 shadow-[0_18px_42px_-34px_rgba(76,29,149,0.28)] transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-violet-300 hover:shadow-[0_24px_52px_-38px_rgba(76,29,149,0.34)] sm:p-6">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="min-w-0 space-y-2">
          <p className="truncate font-mono text-xs text-slate-500">{formatSessionDate(session.createdAt)}</p>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-[#171326]">{session.mood} practice session</h3>
            <p className="mt-1 text-sm text-slate-600">{session.availableTime} minutes planned</p>
          </div>
          {session.goal ? <p className="max-w-[65ch] text-sm leading-6 text-slate-700">Goal: {session.goal}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <p className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 ring-1 ring-violet-200/70">
            {completedCount}/{session.tasks.length} tasks completed
          </p>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-semibold text-violet-950 shadow-[0_10px_24px_-20px_rgba(76,29,149,0.35)] transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-violet-300 hover:bg-violet-50 active:scale-[0.98]"
            aria-expanded={open}
          >
            {open ? "Hide details" : "View details"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mt-6 space-y-4 border-t border-violet-200/70 pt-5 animate-[taskFadeIn_320ms_cubic-bezier(0.16,1,0.3,1)_both]">
          {session.feedback ? (
            <p className="text-sm text-slate-700">
              Feedback: difficulty {session.feedback.difficultyRating}/5, focus {session.feedback.focusRating}/5
            </p>
          ) : (
            <p className="text-sm text-slate-500">No feedback submitted.</p>
          )}
          <ul className="space-y-4">
            {session.tasks.map((item, index) => (
              <li
                key={item.taskId}
                className="practice-task-reveal"
                style={{ "--task-index": index } as CSSProperties}
              >
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
