import { prisma } from "@/lib/prisma";
import type { CompleteSessionInput, GenerateSessionInput } from "@/lib/validators";
import { generatePracticeSession } from "@/algorithms/generatePracticeSession";

export async function generateAndSaveSession(userId: string, input: GenerateSessionInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, level: true },
  });

  if (!user) {
    return null;
  }

  const tasks = await prisma.task.findMany({
    select: {
      id: true,
      name: true,
      difficulty: true,
      duration: true,
      category: true,
    },
  });

  const generated = generatePracticeSession({
    userLevel: user.level,
    availableTime: input.availableTime,
    tasks,
  });

  const session = await prisma.session.create({
    data: {
      userId,
      mood: input.mood,
      availableTime: input.availableTime,
      goal: input.goal ?? null,
      tasks: {
        create: generated.selectedTasks.map((task) => ({
          task: {
            connect: { id: task.id },
          },
        })),
      },
    },
    include: {
      tasks: {
        include: {
          task: true,
        },
      },
      feedback: true,
    },
  });

  return {
    session,
    generation: {
      difficulty: generated.difficulty,
      timeBlocks: generated.timeBlocks,
      totalBlockMinutes: generated.totalBlockMinutes,
      totalPlannedMinutes: generated.totalPlannedMinutes,
    },
  };
}

export async function completeSession(userId: string, input: CompleteSessionInput) {
  const session = await prisma.session.findUnique({
    where: { id: input.sessionId },
    include: {
      tasks: true,
    },
  });

  if (!session || session.userId !== userId) {
    return null;
  }

  const completedTaskIds = input.completedTaskIds ?? [];
  const validTaskIds = new Set(session.tasks.map((task) => task.taskId));
  const idsToMarkCompleted = completedTaskIds.filter((taskId) => validTaskIds.has(taskId));

  if (idsToMarkCompleted.length > 0) {
    await prisma.sessionTask.updateMany({
      where: {
        sessionId: session.id,
        taskId: {
          in: idsToMarkCompleted,
        },
      },
      data: {
        completed: true,
      },
    });
  }

  const feedback = await prisma.feedback.upsert({
    where: { sessionId: session.id },
    update: {
      difficultyRating: input.difficultyRating,
      focusRating: input.focusRating,
    },
    create: {
      sessionId: session.id,
      difficultyRating: input.difficultyRating,
      focusRating: input.focusRating,
    },
  });

  const updatedSession = await prisma.session.findUnique({
    where: { id: session.id },
    include: {
      tasks: {
        include: {
          task: true,
        },
      },
      feedback: true,
    },
  });

  return {
    session: updatedSession,
    feedback,
    completedTaskIds: idsToMarkCompleted,
  };
}
