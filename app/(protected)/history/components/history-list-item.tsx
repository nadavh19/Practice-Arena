import type { SessionHistoryItem } from "@/lib/client/types";

type HistoryListItemProps = {
  session: SessionHistoryItem;
};

export function HistoryListItem({ session }: HistoryListItemProps) {
  const completedCount = session.tasks.filter((task) => task.completed).length;

  return (
    <li className="rounded-lg border border-zinc-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{new Date(session.createdAt).toLocaleString()}</p>
          <p className="text-xs text-zinc-600">
            Mood: {session.mood} | Time: {session.availableTime} min
          </p>
          {session.goal ? <p className="mt-1 text-xs text-zinc-600">Goal: {session.goal}</p> : null}
        </div>
        <p className="text-xs font-medium text-zinc-700">
          {completedCount}/{session.tasks.length} tasks completed
        </p>
      </div>
      {session.feedback ? (
        <p className="mt-2 text-xs text-zinc-700">
          Feedback: difficulty {session.feedback.difficultyRating}/5, focus {session.feedback.focusRating}/5
        </p>
      ) : (
        <p className="mt-2 text-xs text-zinc-500">No feedback submitted.</p>
      )}
    </li>
  );
}
