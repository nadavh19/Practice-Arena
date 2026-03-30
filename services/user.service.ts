import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { LoginInput, ProfileUpdateInput, SignupInput } from "@/lib/validators";

const safeUserSelect = {
  id: true,
  email: true,
  nickname: true,
  instrument: true,
  level: true,
  goals: true,
  createdAt: true,
} as const;

export type SafeUser = Awaited<ReturnType<typeof getUserById>>;

export async function createUser(input: SignupInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  return prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      nickname: null,
      instrument: input.instrument,
      level: input.level,
      goals: input.goals,
    },
    select: safeUserSelect,
  });
}

export async function getUserByEmail(email: LoginInput["email"]) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });
}

export async function updateUserProfile(userId: string, updates: ProfileUpdateInput) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      nickname: updates.nickname,
      instrument: updates.instrument,
      level: updates.level,
      goals: updates.goals,
    },
    select: safeUserSelect,
  });
}
