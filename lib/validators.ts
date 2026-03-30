import { z } from "zod";

const levelSchema = z.enum(["beginner", "intermediate", "advanced"]);

const baseEmailSchema = z.email().toLowerCase();
const basePasswordSchema = z.string().min(8).max(100);

export const signupSchema = z.object({
  email: baseEmailSchema,
  password: basePasswordSchema,
  instrument: z.string().trim().min(1).max(100),
  level: levelSchema,
  goals: z.string().trim().min(1).max(1000),
});

export const loginSchema = z.object({
  email: baseEmailSchema,
  password: basePasswordSchema,
});

export const profileUpdateSchema = z
  .object({
    instrument: z.string().trim().min(1).max(100).optional(),
    level: levelSchema.optional(),
    goals: z.string().trim().min(1).max(1000).optional(),
  })
  .refine(
    (payload) =>
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

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type GenerateSessionInput = z.infer<typeof generateSessionSchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;
