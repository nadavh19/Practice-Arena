import { apiError, apiSuccess } from "@/lib/api-response";
import { getUserFromRequest } from "@/lib/auth";
import { getValidationErrorMessage } from "@/lib/validation-error";
import { completeSessionSchema } from "@/lib/validators";
import { completeSession } from "@/services/session.service";

export async function POST(request: Request) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid token" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, { code: "INVALID_JSON", message: "Request body must be valid JSON" });
  }

  const parsed = completeSessionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, { code: "VALIDATION_ERROR", message: getValidationErrorMessage(parsed.error) });
  }

  const result = await completeSession(authUser.id, parsed.data);
  if (!result) {
    return apiError(404, { code: "SESSION_NOT_FOUND", message: "Session not found for this user" });
  }

  return apiSuccess(result);
}
