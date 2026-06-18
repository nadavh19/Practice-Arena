import { apiError, apiSuccess } from "@/lib/api-response";
import { getRegularUserFromRequest } from "@/lib/auth";
import { getTheoryGameProgress } from "@/services/theory-game.service";

export async function GET(request: Request) {
  const user = await getRegularUserFromRequest(request);
  if (!user) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid token" });
  }

  return apiSuccess(await getTheoryGameProgress(user.id));
}
