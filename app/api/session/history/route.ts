import { apiError, apiSuccess } from "@/lib/api-response";
import { getUserFromRequest } from "@/lib/auth";
import { getSessionHistory } from "@/services/session.service";

export async function GET(request: Request) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid token" });
  }

  const history = await getSessionHistory(authUser.id);
  return apiSuccess(history);
}
