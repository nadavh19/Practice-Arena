import { prisma } from "@/lib/prisma";
import { THEORY_PHASE_BY_ID, scoreForCorrectAnswers } from "@/lib/theory-game/definitions";
import { buildTheoryGameProgress } from "@/lib/theory-game/progress";

export async function getTheoryGameProgress(userId: string) {
  const scores = await prisma.theoryPhaseScore.findMany({
    where: { userId },
    select: { level: true, phaseId: true, bestScore: true },
  });

  return buildTheoryGameProgress(scores);
}

export async function saveTheoryPhaseScore(options: {
  userId: string;
  level: number;
  phaseId: string;
  correctAnswers: number;
}) {
  const phase = THEORY_PHASE_BY_ID[options.phaseId];
  if (!phase || phase.levelId !== options.level) {
    return null;
  }

  const score = scoreForCorrectAnswers(phase, options.correctAnswers);

  await prisma.theoryPhaseScore.upsert({
    where: {
      userId_level_phaseId: {
        userId: options.userId,
        level: options.level,
        phaseId: options.phaseId,
      },
    },
    create: {
      userId: options.userId,
      level: options.level,
      phaseId: options.phaseId,
      bestScore: score,
    },
    update: {},
  });

  await prisma.theoryPhaseScore.updateMany({
    where: {
      userId: options.userId,
      level: options.level,
      phaseId: options.phaseId,
      bestScore: { lt: score },
    },
    data: { bestScore: score },
  });

  return getTheoryGameProgress(options.userId);
}
