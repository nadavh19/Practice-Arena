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
  if (!result) {
    return apiError(404, { code: "USER_NOT_FOUND", message: "User not found" });
  }

  return apiSuccess(result, 201);
}
