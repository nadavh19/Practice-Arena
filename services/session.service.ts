import { prisma } from "@/lib/prisma";
import type { CompleteSessionInput, GenerateSessionInput } from "@/lib/validators";
import { generatePracticeSession } from "@/algorithms/generatePracticeSession";

export async function generateAndSaveSession(userId: string, input: GenerateSessionInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, level: true, goals: true },
  });

  if (!user) {
    return null;
  }

  const [tasks, recentFeedbackSessions] = await Promise.all([
    prisma.task.findMany({
      select: {
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
      },
    }),
    prisma.session.findMany({
      where: {
        userId,
        feedback: {
          isNot: null,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        feedback: {
          select: {
            difficultyRating: true,
            focusRating: true,
          },
        },
      },
    }),
  ]);

  const feedbackRatings = recentFeedbackSessions
    .map((session) => session.feedback)
    .filter((feedback): feedback is { difficultyRating: number; focusRating: number } => feedback !== null);

  const feedbackSummary =
    feedbackRatings.length === 0
      ? undefined
      : {
          averageDifficultyRating:
            feedbackRatings.reduce((sum, feedback) => sum + feedback.difficultyRating, 0) /
            feedbackRatings.length,
          averageFocusRating:
            feedbackRatings.reduce((sum, feedback) => sum + feedback.focusRating, 0) / feedbackRatings.length,
        };

  const generated = generatePracticeSession({
    userLevel: user.level,
    availableTime: input.availableTime,
    mood: input.mood,
    sessionGoal: input.goal ?? null,
    profileGoals: user.goals,
    feedbackSummary,
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

export async function getSessionHistory(userId: string) {
  return prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        select: {
          taskId: true,
          completed: true,
          task: {
            select: {
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
            },
          },
        },
      },
      feedback: {
        select: {
          difficultyRating: true,
          focusRating: true,
        },
      },
    },
  });
}

export async function getSessionStats(userId: string) {
  const [sessionCount, feedbackAggregate, totalTasks, completedTasks] = await Promise.all([
    prisma.session.count({
      where: { userId },
    }),
    prisma.feedback.aggregate({
      where: {
        session: {
          userId,
        },
      },
      _avg: {
        focusRating: true,
        difficultyRating: true,
      },
    }),
    prisma.sessionTask.count({
      where: {
        session: {
          userId,
        },
      },
    }),
    prisma.sessionTask.count({
      where: {
        session: {
          userId,
        },
        completed: true,
      },
    }),
  ]);

  return {
    sessionCount,
    avgFocusRating: feedbackAggregate._avg.focusRating ?? 0,
    avgDifficultyRating: feedbackAggregate._avg.difficultyRating ?? 0,
    completionRate: totalTasks === 0 ? 0 : completedTasks / totalTasks,
  };
}
