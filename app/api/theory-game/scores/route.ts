import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getRegularUserFromRequest } from "@/lib/auth";
import { THEORY_PHASE_BY_ID } from "@/lib/theory-game/definitions";
import { saveTheoryPhaseScore } from "@/services/theory-game.service";

const scorePayloadSchema = z.object({
  levelId: z.number().int().min(1).max(5),
  phaseId: z.string().min(1).max(100),
  correctAnswers: z.number().int().min(0).max(15),
});

export async function POST(request: Request) {
  const user = await getRegularUserFromRequest(request);
  if (!user) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid token" });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return apiError(400, { code: "INVALID_JSON", message: "Request body must be valid JSON" });
  }

  const parsed = scorePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return apiError(400, { code: "INVALID_SCORE", message: "Score submission is invalid" });
  }

  const phase = THEORY_PHASE_BY_ID[parsed.data.phaseId];
  if (
    !phase ||
    phase.levelId !== parsed.data.levelId ||
    parsed.data.correctAnswers > phase.roundCount
  ) {
    return apiError(400, { code: "INVALID_PHASE_SCORE", message: "Phase or score does not match the game rules" });
  }

  const progress = await saveTheoryPhaseScore({
    userId: user.id,
    level: parsed.data.levelId,
    phaseId: parsed.data.phaseId,
    correctAnswers: parsed.data.correctAnswers,
  });

  if (!progress) {
    return apiError(400, { code: "INVALID_PHASE", message: "Unknown theory-game phase" });
  }

  return apiSuccess(progress);
}
