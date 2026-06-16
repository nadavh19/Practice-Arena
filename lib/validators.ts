import { z } from "zod";

const levelSchema = z.enum(["beginner", "intermediate", "advanced"]);
const taskCategorySchema = z.enum(["exercise", "scale", "chord", "song_chords", "riff", "solo", "rhythm", "technique"]);
const guitarOnlySchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((value) => value === "guitar", {
    message: "Only guitar is currently supported",
  });

const baseEmailSchema = z.email().toLowerCase();
const basePasswordSchema = z.string().min(8).max(100);

export const signupSchema = z.object({
  email: baseEmailSchema,
  password: basePasswordSchema,
  instrument: guitarOnlySchema,
  level: levelSchema,
  goals: z.string().trim().min(1).max(1000),
});

export const loginSchema = z.object({
  email: baseEmailSchema,
  password: basePasswordSchema,
});

export const adminLoginSchema = z.object({
  email: z.string().trim().min(1).max(254).toLowerCase(),
  password: z.string().min(1).max(100),
});

export const profileUpdateSchema = z
  .object({
    nickname: z.string().trim().min(2).max(40).nullable().optional(),
    instrument: guitarOnlySchema.optional(),
    level: levelSchema.optional(),
    goals: z.string().trim().min(1).max(1000).optional(),
  })
  .refine(
    (payload) =>
      payload.nickname !== undefined ||
      payload.instrument !== undefined ||
      payload.level !== undefined ||
      payload.goals !== undefined,
    {
      message: "At least one profile field must be provided",
    },
  );

export const generateSessionSchema = z.object({
  mood: z.string().trim().min(1).max(100),
  availableTime: z.int().min(5).max(240),
  goal: z.string().trim().min(1).max(300).optional(),
});

export const completeSessionSchema = z.object({
  sessionId: z.uuid(),
  difficultyRating: z.int().min(1).max(5),
  focusRating: z.int().min(1).max(5),
  completedTaskIds: z.array(z.uuid()).max(100).optional(),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(20),
});

export const songLearnerSchema = z.object({
  title: z.string().trim().min(1).max(160),
  artist: z
    .string()
    .trim()
    .max(160)
    .transform((value) => (value ? value : undefined))
    .optional(),
});

const optionalTextSchema = z
  .string()
  .trim()
  .max(2000)
  .transform((value) => (value ? value : null))
  .nullable()
  .optional();

export const adminCreateTaskSchema = z.object({
  name: z.string().trim().min(1).max(120),
  difficulty: levelSchema,
  duration: z.int().min(1).max(240),
  category: taskCategorySchema,
  description: optionalTextSchema,
  instrument: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .transform((value) => value.toLowerCase())
    .optional()
    .default("guitar"),
  key: optionalTextSchema,
  bpm: z.int().min(1).max(300).nullable().optional(),
  tab: optionalTextSchema,
  chords: optionalTextSchema,
  scale: optionalTextSchema,
  songName: optionalTextSchema,
  artistName: optionalTextSchema,
});

export const notificationSettingsSchema = z.object({
  enabled: z.boolean(),
  activeDays: z
    .array(z.int().min(0).max(6))
    .min(1)
    .max(7)
    .transform((days) => Array.from(new Set(days)).sort((a, b) => a - b).join(",")),
  maxUsersPerRun: z.int().min(1).max(500),
  dryRun: z.boolean(),
  aiEnabled: z.boolean(),
  fallbackEnabled: z.boolean(),
  subjectTemplate: z.string().trim().min(1).max(160),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type GenerateSessionInput = z.infer<typeof generateSessionSchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type SongLearnerInput = z.infer<typeof songLearnerSchema>;
export type AdminCreateTaskInput = z.infer<typeof adminCreateTaskSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
