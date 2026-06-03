import { prisma } from "@/lib/prisma";
import type { AdminCreateTaskInput } from "@/lib/validators";

const taskSelect = {
  id: true,
  name: true,
  difficulty: true,
  duration: true,
  category: true,
  description: true,
  instrument: true,
  key: true,
  bpm: true,
  tab: true,
  chords: true,
  scale: true,
  songName: true,
  artistName: true,
  createdAt: true,
} as const;

const userProfileSelect = {
  id: true,
  email: true,
  nickname: true,
  instrument: true,
  level: true,
  goals: true,
  role: true,
  createdAt: true,
} as const;

export async function getAdminUsersOverview() {
  const users = await prisma.user.findMany({
    where: { role: "user" },
    orderBy: { createdAt: "desc" },
    select: {
      ...userProfileSelect,
      sessions: {
        select: {
          feedback: { select: { id: true } },
          tasks: { select: { completed: true } },
        },
      },
    },
  });

  return users.map((user) => {
    const assignedTaskCount = user.sessions.reduce((sum, session) => sum + session.tasks.length, 0);
    const completedTaskCount = user.sessions.reduce(
      (sum, session) => sum + session.tasks.filter((task) => task.completed).length,
      0,
    );
    const feedbackCount = user.sessions.filter((session) => session.feedback).length;

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      instrument: user.instrument,
      level: user.level,
      goals: user.goals,
      role: user.role,
      createdAt: user.createdAt,
      sessionCount: user.sessions.length,
      assignedTaskCount,
      completedTaskCount,
      feedbackCount,
    };
  });
}

export async function getAdminUserDetail(userId: string) {
  return prisma.user.findFirst({
    where: {
      id: userId,
      role: "user",
    },
    select: {
      ...userProfileSelect,
      sessions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          mood: true,
          availableTime: true,
          goal: true,
          createdAt: true,
          feedback: {
            select: {
              difficultyRating: true,
              focusRating: true,
            },
          },
          tasks: {
            select: {
              taskId: true,
              completed: true,
              task: {
                select: taskSelect,
              },
            },
          },
        },
      },
    },
  });
}

export async function getAdminTasks() {
  return prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    select: taskSelect,
  });
}

export async function createAdminTask(input: AdminCreateTaskInput) {
  return prisma.task.create({
    data: {
      name: input.name,
      difficulty: input.difficulty,
      duration: input.duration,
      category: input.category,
      description: input.description ?? null,
      instrument: input.instrument,
      key: input.key ?? null,
      bpm: input.bpm ?? null,
      tab: input.tab ?? null,
      chords: input.chords ?? null,
      scale: input.scale ?? null,
      songName: input.songName ?? null,
      artistName: input.artistName ?? null,
    },
    select: taskSelect,
  });
}
