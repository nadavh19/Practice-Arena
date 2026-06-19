export type ApiErrorPayload = {
  code: string;
  message: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: ApiErrorPayload;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type UserLevel = "beginner" | "intermediate" | "advanced";
export type UserRole = "user" | "admin";

export type UserProfile = {
  id: string;
  email: string;
  nickname: string | null;
  instrument: "guitar";
  level: UserLevel;
  goals: string;
  role: UserRole;
  createdAt: string;
};

export type TaskCategory =
  | "exercise"
  | "scale"
  | "chord"
  | "song_chords"
  | "riff"
  | "solo"
  | "rhythm"
  | "technique";

export type PracticeTask = {
  id: string;
  name: string;
  difficulty: string;
  duration: number;
  category: TaskCategory;
  description: string | null;
  instrument: string | null;
  key: string | null;
  bpm: number | null;
  tab: string | null;
  chords: string | null;
  scale: string | null;
  songName: string | null;
  artistName: string | null;
};

export type AdminPracticeTask = PracticeTask & {
  createdAt: string;
};

export type SessionTaskItem = {
  taskId: string;
  completed: boolean;
  task: PracticeTask;
};

export type SessionFeedback = {
  difficultyRating: number;
  focusRating: number;
} | null;

export type SessionHistoryItem = {
  id: string;
  createdAt: string;
  mood: string;
  availableTime: number;
  goal: string | null;
  tasks: SessionTaskItem[];
  feedback: SessionFeedback;
};

export type SessionStats = {
  sessionCount: number;
  avgFocusRating: number;
  avgDifficultyRating: number;
  completionRate: number;
};

export type AuthResponse = {
  token: string;
  user: UserProfile;
};

export type AdminUserOverview = UserProfile & {
  sessionCount: number;
  assignedTaskCount: number;
  completedTaskCount: number;
  feedbackCount: number;
};

export type AdminUserDetail = UserProfile & {
  sessions: Array<{
    id: string;
    createdAt: string;
    mood: string;
    availableTime: number;
    goal: string | null;
    tasks: Array<{
      taskId: string;
      completed: boolean;
      task: AdminPracticeTask;
    }>;
    feedback: SessionFeedback;
  }>;
};

export type AdminCreateTaskPayload = {
  name: string;
  difficulty: UserLevel;
  duration: number;
  category: TaskCategory;
  description?: string | null;
  instrument?: string;
  key?: string | null;
  bpm?: number | null;
  tab?: string | null;
  chords?: string | null;
  scale?: string | null;
  songName?: string | null;
  artistName?: string | null;
};

export type NotificationSettings = {
  id: string;
  enabled: boolean;
  activeDays: string;
  maxUsersPerRun: number;
  dryRun: boolean;
  aiEnabled: boolean;
  fallbackEnabled: boolean;
  subjectTemplate: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationSettingsPayload = {
  enabled: boolean;
  activeDays: number[];
  maxUsersPerRun: number;
  dryRun: boolean;
  aiEnabled: boolean;
  fallbackEnabled: boolean;
  subjectTemplate: string;
};

export type NotificationTestResponse = {
  error?: string | null;
  preview?: string;
  sent: boolean;
  subject?: string;
};

export type GenerateSessionResponse = {
  session: {
    id: string;
  };
};

export type CoachChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CoachChatResponse = {
  reply: string;
};

export type SongLearnerRequest = {
  title: string;
  artist?: string;
};

export type SongLearnerResponse = {
  ultimateGuitarUrl: string;
  youtubeUrl: string;
  ultimateGuitarIsFallback: boolean;
  youtubeIsFallback: boolean;
  learningGuide: string;
};
