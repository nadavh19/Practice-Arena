import { apiError, apiSuccess } from "@/lib/api-response";
import { getRegularUserFromRequest } from "@/lib/auth";
import { getSessionStats } from "@/services/session.service";

export async function GET(request: Request) {
  const authUser = await getRegularUserFromRequest(request);
  if (!authUser) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid token" });
  }

  const stats = await getSessionStats(authUser.id);
  return apiSuccess(stats);
}
