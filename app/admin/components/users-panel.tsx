import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { formatDate } from "@/app/admin/components/admin-page-helpers";
import type { AdminUserDetail, AdminUserOverview } from "@/lib/client/types";

type UsersPanelProps = {
  active: boolean;
  detailLoading: boolean;
  onSelectUser: (userId: string) => void;
  selectedOverview: AdminUserOverview | null;
  selectedUser: AdminUserDetail | null;
  selectedUserId: string | null;
  users: AdminUserOverview[];
};

export function UsersPanel({
  active,
  detailLoading,
  onSelectUser,
  selectedOverview,
  selectedUser,
  selectedUserId,
  users,
}: UsersPanelProps) {
  return (
    <section
      id="users-panel"
      role="tabpanel"
      aria-labelledby="users-tab"
      hidden={!active}
      className="space-y-6"
    >
      <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <SurfaceCard className="rounded-[1.5rem] p-5">
          <PageHeading title="Users" description="Select a player to inspect their saved practice data." />
          <div className="mt-5 space-y-2">
            {users.length === 0 ? (
              <InlineStatus message="No regular users yet." variant="muted" />
            ) : (
              users.map((user) => {
                const selected = user.id === selectedUserId;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => onSelectUser(user.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.99] ${
                      selected
                        ? "border-violet-900 bg-violet-900 text-white"
                        : "border-violet-200 bg-white text-[#171326] hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user.nickname || user.email}</p>
                        <p className={`mt-1 truncate text-xs ${selected ? "text-violet-100" : "text-slate-500"}`}>
                          {user.email}
                        </p>
                      </div>
                      <p className={`font-mono text-xs ${selected ? "text-amber-100" : "text-slate-500"}`}>
                        {user.sessionCount} sessions
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-[1.5rem] p-5">
          <PageHeading
            title={selectedOverview ? selectedOverview.nickname || selectedOverview.email : "User detail"}
            description="Profile, session history, assigned tasks, and feedback."
          />
          {detailLoading ? <InlineStatus message="Loading user detail..." variant="muted" className="mt-5" /> : null}
          {!detailLoading && selectedUser ? (
            <div className="mt-5 space-y-5">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  ["Sessions", selectedOverview?.sessionCount ?? selectedUser.sessions.length],
                  ["Assigned", selectedOverview?.assignedTaskCount ?? 0],
                  ["Completed", selectedOverview?.completedTaskCount ?? 0],
                  ["Feedback", selectedOverview?.feedbackCount ?? 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-500">{label}</p>
                    <p className="mt-2 font-mono text-2xl font-semibold text-[#171326]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-violet-200 bg-white p-4">
                <p className="text-sm font-semibold text-[#171326]">{selectedUser.email}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedUser.level} / {selectedUser.instrument} / joined {formatDate(selectedUser.createdAt)}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{selectedUser.goals}</p>
              </div>
              <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                {selectedUser.sessions.length === 0 ? (
                  <InlineStatus message="This user has no sessions yet." variant="muted" />
                ) : (
                  selectedUser.sessions.map((session) => (
                    <article
                      key={session.id}
                      className="rounded-2xl border border-violet-200 bg-white p-4 shadow-[0_12px_30px_-28px_rgba(76,29,149,0.3)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#171326]">
                            {session.availableTime} min / {session.mood}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{formatDate(session.createdAt)}</p>
                        </div>
                        <p className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 ring-1 ring-violet-200/70">
                          {session.feedback
                            ? `Focus ${session.feedback.focusRating}, difficulty ${session.feedback.difficultyRating}`
                            : "No feedback"}
                        </p>
                      </div>
                      {session.goal ? <p className="mt-3 text-sm leading-6 text-slate-600">{session.goal}</p> : null}
                      <ul className="mt-3 grid gap-2">
                        {session.tasks.map((item) => (
                          <li key={item.taskId} className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900">
                            <span className="font-semibold text-[#171326]">{item.task.name}</span>
                            <span className="text-slate-500"> / {item.completed ? "completed" : "pending"}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </SurfaceCard>
      </div>
    </section>
  );
}
