import { apiError, apiSuccess } from "@/lib/api-response";
import { getAdminFromRequest } from "@/lib/auth";
import { sendAdminNotificationTestEmail } from "@/services/notification.service";

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid admin token" });
  }

  const result = await sendAdminNotificationTestEmail(admin.id);
  if (result.error) {
    return apiError(502, { code: "TEST_EMAIL_FAILED", message: result.error });
  }

  return apiSuccess(result);
}
