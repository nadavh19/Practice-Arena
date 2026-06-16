import { apiError, apiSuccess } from "@/lib/api-response";
import { getAdminFromRequest } from "@/lib/auth";
import { getValidationErrorMessage } from "@/lib/validation-error";
import { notificationSettingsSchema } from "@/lib/validators";
import { getNotificationSettings, updateNotificationSettings } from "@/services/notification.service";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid admin token" });
  }

  const settings = await getNotificationSettings();
  return apiSuccess(settings);
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid admin token" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, { code: "INVALID_JSON", message: "Request body must be valid JSON" });
  }

  const parsed = notificationSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, { code: "VALIDATION_ERROR", message: getValidationErrorMessage(parsed.error) });
  }

  const settings = await updateNotificationSettings(parsed.data);
  return apiSuccess(settings);
}
