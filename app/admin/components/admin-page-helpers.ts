import type {
  AdminCreateTaskPayload,
  NotificationSettings,
  NotificationSettingsPayload,
  TaskCategory,
  UserLevel,
} from "@/lib/client/types";

export type TaskFormState = {
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

export type NotificationFormState = {
  activeDays: number[];
  aiEnabled: boolean;
  dryRun: boolean;
  enabled: boolean;
  fallbackEnabled: boolean;
  maxUsersPerRun: string;
  subjectTemplate: string;
};

export type AdminTab = "users" | "taskInventory" | "addTask" | "notifications";

export const adminTabs: Array<{ id: AdminTab; label: string }> = [
  { id: "users", label: "Users" },
  { id: "taskInventory", label: "Task inventory" },
  { id: "addTask", label: "Add task" },
  { id: "notifications", label: "Notifications" },
];

export const initialTaskForm: TaskFormState = {
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

export const dayOptions = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export const initialNotificationForm: NotificationFormState = {
  activeDays: [0, 1, 2, 3, 4, 5, 6],
  aiEnabled: true,
  dryRun: true,
  enabled: false,
  fallbackEnabled: true,
  maxUsersPerRun: "100",
  subjectTemplate: "Your Practice Arena reminder",
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseActiveDays(value: string) {
  return value
    .split(",")
    .map((day) => Number.parseInt(day, 10))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
}

export function notificationFormFromSettings(settings: NotificationSettings): NotificationFormState {
  return {
    activeDays: parseActiveDays(settings.activeDays),
    aiEnabled: settings.aiEnabled,
    dryRun: settings.dryRun,
    enabled: settings.enabled,
    fallbackEnabled: settings.fallbackEnabled,
    maxUsersPerRun: String(settings.maxUsersPerRun),
    subjectTemplate: settings.subjectTemplate,
  };
}

export function notificationPayloadFromForm(form: NotificationFormState): NotificationSettingsPayload | null {
  const maxUsersPerRun = Number.parseInt(form.maxUsersPerRun, 10);
  const subjectTemplate = form.subjectTemplate.trim();

  if (!Number.isFinite(maxUsersPerRun) || maxUsersPerRun < 1 || maxUsersPerRun > 500) {
    return null;
  }

  if (form.activeDays.length === 0 || !subjectTemplate) {
    return null;
  }

  return {
    activeDays: Array.from(new Set(form.activeDays)).sort((a, b) => a - b),
    aiEnabled: form.aiEnabled,
    dryRun: form.dryRun,
    enabled: form.enabled,
    fallbackEnabled: form.fallbackEnabled,
    maxUsersPerRun,
    subjectTemplate,
  };
}

export function taskPayloadFromForm(form: TaskFormState): AdminCreateTaskPayload | null {
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
