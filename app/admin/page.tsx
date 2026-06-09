"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/app/components/ui/app-button";
import { AppSelect, type AppSelectOption } from "@/app/components/ui/app-select";
import { AutoResizeTextarea } from "@/app/components/ui/auto-resize-textarea";
import { FormField, fieldControlClassName } from "@/app/components/ui/form-field";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageHeading } from "@/app/components/ui/page-heading";
import { PageShell } from "@/app/components/ui/page-shell";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { adminApiGet, adminApiPost } from "@/lib/client/admin-api-client";
import { clearAdminToken, getAdminToken } from "@/lib/client/admin-auth-storage";
import type {
  AdminCreateTaskPayload,
  AdminPracticeTask,
  AdminUserDetail,
  AdminUserOverview,
  TaskCategory,
  UserLevel,
} from "@/lib/client/types";

type TaskFormState = {
  artistName: string;
  bpm: string;
  category: TaskCategory;
  chords: string;
  description: string;
  difficulty: UserLevel;
  duration: string;
  instrument: string;
  key: string;
  name: string;
  scale: string;
  songName: string;
  tab: string;
};

type AdminTab = "users" | "taskInventory" | "addTask";

const adminTabs: Array<{ id: AdminTab; label: string }> = [
  { id: "users", label: "Users" },
  { id: "taskInventory", label: "Task inventory" },
  { id: "addTask", label: "Add task" },
];

const difficultyOptions: AppSelectOption<UserLevel>[] = [
  { value: "beginner", label: "Beginner", description: "Simple and approachable" },
  { value: "intermediate", label: "Intermediate", description: "More moving parts" },
  { value: "advanced", label: "Advanced", description: "Demanding practice material" },
];

const categoryOptions: AppSelectOption<TaskCategory>[] = [
  { value: "exercise", label: "Exercise", description: "General practice drill" },
  { value: "scale", label: "Scale", description: "Scale or mode study" },
  { value: "chord", label: "Chord", description: "Single chord or voicing work" },
  { value: "song_chords", label: "Song chords", description: "Progression or song harmony" },
  { value: "riff", label: "Riff", description: "Short repeated musical idea" },
  { value: "solo", label: "Solo", description: "Lead guitar phrase" },
  { value: "rhythm", label: "Rhythm", description: "Timing and strumming work" },
  { value: "technique", label: "Technique", description: "Coordination and control" },
];

const initialTaskForm: TaskFormState = {
  artistName: "",
  bpm: "",
  category: "exercise",
  chords: "",
  description: "",
  difficulty: "beginner",
  duration: "5",
  instrument: "guitar",
  key: "",
  name: "",
  scale: "",
  songName: "",
  tab: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function taskPayloadFromForm(form: TaskFormState): AdminCreateTaskPayload | null {
  const duration = Number.parseInt(form.duration, 10);
  if (!form.name.trim() || !Number.isFinite(duration) || duration < 1) {
    return null;
  }

  const bpm = form.bpm.trim() ? Number.parseInt(form.bpm, 10) : null;
  if (bpm !== null && (!Number.isFinite(bpm) || bpm < 1)) {
    return null;
  }

  return {
    name: form.name.trim(),
    difficulty: form.difficulty,
    duration,
    category: form.category,
    description: optionalText(form.description),
    instrument: form.instrument.trim() || "guitar",
    key: optionalText(form.key),
    bpm,
    tab: optionalText(form.tab),
    chords: optionalText(form.chords),
    scale: optionalText(form.scale),
    songName: optionalText(form.songName),
    artistName: optionalText(form.artistName),
  };
}

function TaskPreview({ task }: { task: AdminPracticeTask }) {
  return (
    <li className="rounded-2xl border border-violet-200/70 bg-white px-4 py-3 shadow-[0_12px_28px_-26px_rgba(76,29,149,0.28)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#171326]">{task.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {formatLabel(task.category)} / {task.difficulty} / {task.duration} min
          </p>
        </div>
        <p className="font-mono text-xs text-slate-500">{task.bpm ? `${task.bpm} BPM` : "No BPM"}</p>
      </div>
    </li>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserOverview[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [tasks, setTasks] = useState<AdminPracticeTask[]>([]);
  const [taskForm, setTaskForm] = useState<TaskFormState>(initialTaskForm);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskMessage, setTaskMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  const selectedOverview = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }

    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      const [usersResult, tasksResult] = await Promise.all([
        adminApiGet<AdminUserOverview[]>("/api/admin/users"),
        adminApiGet<AdminPracticeTask[]>("/api/admin/tasks"),
      ]);

      if (!active) {
        return;
      }

      if (!usersResult.success) {
        setError(usersResult.error.message);
        setLoading(false);
        return;
      }

      if (!tasksResult.success) {
        setError(tasksResult.error.message);
        setLoading(false);
        return;
      }

      setUsers(usersResult.data);
      setTasks(tasksResult.data);
      setSelectedUserId(usersResult.data[0]?.id ?? null);
      setLoading(false);
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      return;
    }

    let active = true;

    async function loadUserDetail() {
      setDetailLoading(true);
      const result = await adminApiGet<AdminUserDetail>(`/api/admin/users/${selectedUserId}`);

      if (!active) {
        return;
      }

      setDetailLoading(false);
      if (!result.success) {
        setError(result.error.message);
        setSelectedUser(null);
        return;
      }

      setSelectedUser(result.data);
    }

    void loadUserDetail();

    return () => {
      active = false;
    };
  }, [selectedUserId]);

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTaskMessage(null);
    setError(null);

    const payload = taskPayloadFromForm(taskForm);
    if (!payload) {
      setError("Task name, duration, and BPM must be valid.");
      return;
    }

    setSavingTask(true);
    const result = await adminApiPost<AdminPracticeTask>("/api/admin/tasks", payload);
    setSavingTask(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setTasks((current) => [result.data, ...current]);
    setTaskForm(initialTaskForm);
    setTaskMessage("Task added to the practice pool.");
  }

  if (loading) {
    return (
      <PageShell width="7xl" fullHeight className="flex items-center justify-center">
        <InlineStatus message="Loading admin data..." variant="muted" />
      </PageShell>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#fbfaff]">
      <header className="border-b border-violet-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold tracking-tight text-[#171326]">Practice Arena Admin</p>
            <p className="text-xs text-slate-500">Users, sessions, feedback, and task content</p>
          </div>
          <AppButton
            type="button"
            variant="secondary"
            onClick={() => {
              clearAdminToken();
              router.replace("/admin/login");
            }}
          >
            Log out
          </AppButton>
        </div>
      </header>

      <PageShell width="7xl" className="space-y-6 py-6">
        <div
          role="tablist"
          aria-label="Admin panel sections"
          className="flex gap-2 overflow-x-auto rounded-full border border-violet-200 bg-white p-1 shadow-[0_16px_40px_-34px_rgba(76,29,149,0.35)]"
        >
          {adminTabs.map((tab) => {
            const active = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`${tab.id}-panel`}
                id={`${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${
                  active
                    ? "bg-violet-900 text-white shadow-[0_14px_30px_-24px_rgba(76,29,149,0.9)]"
                    : "text-violet-700 hover:bg-violet-50 hover:text-violet-950"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <section
          id="users-panel"
          role="tabpanel"
          aria-labelledby="users-tab"
          hidden={activeTab !== "users"}
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
                    const active = user.id === selectedUserId;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setSelectedUserId(user.id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.99] ${
                          active
                            ? "border-violet-900 bg-violet-900 text-white"
                            : "border-violet-200 bg-white text-[#171326] hover:border-violet-300 hover:bg-violet-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{user.nickname || user.email}</p>
                            <p className={`mt-1 truncate text-xs ${active ? "text-violet-100" : "text-slate-500"}`}>
                              {user.email}
                            </p>
                          </div>
                          <p className={`font-mono text-xs ${active ? "text-amber-100" : "text-slate-500"}`}>
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
                        <article key={session.id} className="rounded-2xl border border-violet-200 bg-white p-4 shadow-[0_12px_30px_-28px_rgba(76,29,149,0.3)]">
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

        <section
          id="taskInventory-panel"
          role="tabpanel"
          aria-labelledby="taskInventory-tab"
          hidden={activeTab !== "taskInventory"}
        >
          <SurfaceCard className="rounded-[1.5rem] p-5">
            <PageHeading title="Task inventory" description="Reusable tasks available to session generation." />
            <ul className="mt-5 max-h-[42rem] space-y-2 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <TaskPreview key={task.id} task={task} />
              ))}
            </ul>
          </SurfaceCard>
        </section>

        <section
          id="addTask-panel"
          role="tabpanel"
          aria-labelledby="addTask-tab"
          hidden={activeTab !== "addTask"}
        >
          <SurfaceCard className="rounded-[1.5rem] p-5">
            <PageHeading title="Add task" description="Create a reusable task for future generated sessions." />
            <form className="mt-5 space-y-4" onSubmit={handleCreateTask}>
              <FormField label="Name" helperText="Short, specific task title.">
                <input
                  required
                  value={taskForm.name}
                  onChange={(event) => setTaskForm((current) => ({ ...current, name: event.target.value }))}
                  className={fieldControlClassName}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-3">
                <AppSelect
                  label="Difficulty"
                  value={taskForm.difficulty}
                  options={difficultyOptions}
                  onChange={(difficulty) => setTaskForm((current) => ({ ...current, difficulty }))}
                />
                <AppSelect
                  label="Category"
                  value={taskForm.category}
                  options={categoryOptions}
                  onChange={(category) => setTaskForm((current) => ({ ...current, category }))}
                />
                <FormField label="Duration" helperText="Minutes.">
                  <input
                    required
                    min={1}
                    max={240}
                    type="number"
                    value={taskForm.duration}
                    onChange={(event) => setTaskForm((current) => ({ ...current, duration: event.target.value }))}
                    className={fieldControlClassName}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Instrument" helperText="Defaults to guitar.">
                  <input
                    value={taskForm.instrument}
                    onChange={(event) => setTaskForm((current) => ({ ...current, instrument: event.target.value }))}
                    className={fieldControlClassName}
                  />
                </FormField>
                <FormField label="Key" helperText="Optional.">
                  <input
                    value={taskForm.key}
                    onChange={(event) => setTaskForm((current) => ({ ...current, key: event.target.value }))}
                    className={fieldControlClassName}
                  />
                </FormField>
                <FormField label="BPM" helperText="Optional.">
                  <input
                    min={1}
                    max={300}
                    type="number"
                    value={taskForm.bpm}
                    onChange={(event) => setTaskForm((current) => ({ ...current, bpm: event.target.value }))}
                    className={fieldControlClassName}
                  />
                </FormField>
              </div>
              <FormField label="Description" helperText="Practice instructions.">
                <AutoResizeTextarea
                  value={taskForm.description}
                  onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-24"
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Chords" helperText="Optional.">
                  <AutoResizeTextarea
                    value={taskForm.chords}
                    onChange={(event) => setTaskForm((current) => ({ ...current, chords: event.target.value }))}
                    className="min-h-20"
                  />
                </FormField>
                <FormField label="Scale" helperText="Optional.">
                  <AutoResizeTextarea
                    value={taskForm.scale}
                    onChange={(event) => setTaskForm((current) => ({ ...current, scale: event.target.value }))}
                    className="min-h-20"
                  />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Song name" helperText="Optional.">
                  <input
                    value={taskForm.songName}
                    onChange={(event) => setTaskForm((current) => ({ ...current, songName: event.target.value }))}
                    className={fieldControlClassName}
                  />
                </FormField>
                <FormField label="Artist name" helperText="Optional.">
                  <input
                    value={taskForm.artistName}
                    onChange={(event) => setTaskForm((current) => ({ ...current, artistName: event.target.value }))}
                    className={fieldControlClassName}
                  />
                </FormField>
              </div>
              <FormField label="Tab" helperText="Optional plain-text tablature.">
                <AutoResizeTextarea
                  value={taskForm.tab}
                  onChange={(event) => setTaskForm((current) => ({ ...current, tab: event.target.value }))}
                  className="min-h-28 font-mono"
                />
              </FormField>
              <AppButton disabled={savingTask} type="submit">
                {savingTask ? "Adding task..." : "Add task"}
              </AppButton>
            </form>
            {taskMessage ? <InlineStatus message={taskMessage} variant="success" className="mt-5" /> : null}
          </SurfaceCard>
        </section>

        {error ? <InlineStatus message={error} variant="error" /> : null}
      </PageShell>
    </div>
  );
}
