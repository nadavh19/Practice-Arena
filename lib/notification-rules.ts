export const NOTIFICATION_SETTINGS_ID = "global";
export const DEFAULT_ACTIVE_DAYS = "0,1,2,3,4,5,6";
export const DEFAULT_NOTIFICATION_SUBJECT = "Your Practice Arena reminder";
export const MAX_NOTIFICATION_USERS_PER_RUN = 500;

export type ReminderSettingsInput = {
  activeDays: string;
  aiEnabled: boolean;
  dryRun: boolean;
  enabled: boolean;
  fallbackEnabled: boolean;
  maxUsersPerRun: number;
  subjectTemplate: string;
};

export type ReminderUserContext = {
  email: string;
  goals: string;
  level: string;
  nickname: string | null;
  stats: {
    avgDifficultyRating: number;
    avgFocusRating: number;
    completionRate: number;
    sessionCount: number;
  };
  sessions: Array<{
    availableTime: number;
    createdAt: Date;
    goal: string | null;
    mood: string;
    feedback: {
      difficultyRating: number;
      focusRating: number;
    } | null;
    tasks: Array<{
      completed: boolean;
      task: {
        category: string;
        difficulty: string;
        duration: number;
        name: string;
      };
    }>;
  }>;
};

export function normalizeActiveDays(value: string) {
  const days = Array.from(
    new Set(
      value
        .split(",")
        .map((day) => Number.parseInt(day.trim(), 10))
        .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6),
    ),
  ).sort((a, b) => a - b);

  return days.length > 0 ? days.join(",") : DEFAULT_ACTIVE_DAYS;
}

export function parseActiveDays(value: string) {
  return normalizeActiveDays(value)
    .split(",")
    .map((day) => Number.parseInt(day, 10));
}

export function clampMaxUsersPerRun(value: number) {
  if (!Number.isFinite(value)) {
    return 100;
  }

  return Math.min(Math.max(Math.trunc(value), 1), MAX_NOTIFICATION_USERS_PER_RUN);
}

export function normalizeSubjectTemplate(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 160) : DEFAULT_NOTIFICATION_SUBJECT;
}

export function normalizeReminderSettings(input: ReminderSettingsInput): ReminderSettingsInput {
  return {
    activeDays: normalizeActiveDays(input.activeDays),
    aiEnabled: input.aiEnabled,
    dryRun: input.dryRun,
    enabled: input.enabled,
    fallbackEnabled: input.fallbackEnabled,
    maxUsersPerRun: clampMaxUsersPerRun(input.maxUsersPerRun),
    subjectTemplate: normalizeSubjectTemplate(input.subjectTemplate),
  };
}

export function getUtcSendDate(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function isActiveReminderDay(activeDays: string, now: Date) {
  return parseActiveDays(activeDays).includes(now.getUTCDay());
}

export function buildFallbackReminder(user: ReminderUserContext) {
  const name = user.nickname?.trim() || "there";
  const latestSession = user.sessions[0];
  const completionPercent = Math.round(user.stats.completionRate * 100);

  if (!latestSession) {
    return [
      `Hi ${name}, your guitar practice is waiting for you today.`,
      `Start small: pick one exercise that supports your ${user.level} goal and play for 10 focused minutes.`,
      `Your current goal: ${user.goals}`,
    ].join("\n\n");
  }

  const pendingTask = latestSession.tasks.find((item) => !item.completed)?.task ?? latestSession.tasks[0]?.task;
  const taskLine = pendingTask
    ? `A useful next step is ${pendingTask.name} for ${pendingTask.duration} minutes.`
    : "A useful next step is repeating one thing from your last session with cleaner timing.";

  return [
    `Hi ${name}, here is your Practice Arena reminder for today.`,
    `Your last session was ${latestSession.availableTime} minutes with the mood "${latestSession.mood}". ${taskLine}`,
    `You have completed ${completionPercent}% of assigned tasks so far. Keep it light, specific, and consistent.`,
  ].join("\n\n");
}

export function buildReminderSubject(subjectTemplate: string, user: { nickname: string | null }) {
  const name = user.nickname?.trim() || "musician";
  return normalizeSubjectTemplate(subjectTemplate).replaceAll("{name}", name);
}
