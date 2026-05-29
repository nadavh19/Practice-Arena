import { apiError, apiSuccess } from "@/lib/api-response";
import { getUserFromRequest } from "@/lib/auth";
import { getValidationErrorMessage } from "@/lib/validation-error";
import { chatRequestSchema } from "@/lib/validators";
import { askMusicCoach } from "@/services/chat.service";

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

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, { code: "VALIDATION_ERROR", message: getValidationErrorMessage(parsed.error) });
  }

  try {
    const result = await askMusicCoach(authUser.id, parsed.data.messages);
    if (!result.success) {
      return apiError(result.status, { code: result.code, message: result.message });
    }

    return apiSuccess({ reply: result.reply });
  } catch {
    return apiError(500, {
      code: "CHAT_REQUEST_FAILED",
      message: "The AI coach could not answer right now. Please try again.",
    });
  }
}
