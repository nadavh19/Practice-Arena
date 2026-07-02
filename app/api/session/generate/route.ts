import { apiError, apiSuccess } from "@/lib/api-response";
import { getRegularUserFromRequest } from "@/lib/auth";
import { getValidationErrorMessage } from "@/lib/validation-error";
import { generateSessionSchema } from "@/lib/validators";
import { generateAndSaveSession } from "@/services/session.service";

export async function POST(request: Request) {
  const authUser = await getRegularUserFromRequest(request);
  if (!authUser) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid token" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, { code: "INVALID_JSON", message: "Request body must be valid JSON" });
  }

  const parsed = generateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, { code: "VALIDATION_ERROR", message: getValidationErrorMessage(parsed.error) });
  }

  const result = await generateAndSaveSession(authUser.id, parsed.data);
  if (result.status === "user_not_found") {
    return apiError(404, { code: "USER_NOT_FOUND", message: "User not found" });
  }

  if (result.status === "no_available_tasks") {
    return apiError(409, {
      code: "NO_AVAILABLE_TASKS",
      message: "No new practice tasks are available for this user.",
    });
  }

  return apiSuccess(result, 201);
}
