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

export type UserProfile = {
  id: string;
  email: string;
  nickname: string | null;
  instrument: "guitar";
  level: UserLevel;
  goals: string;
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

export type GenerateSessionResponse = {
  session: {
    id: string;
  };
};
