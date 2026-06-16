import { apiError, apiSuccess } from "@/lib/api-response";
import { runDailyEmailReminders } from "@/services/notification.service";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid cron secret" });
  }

  const summary = await runDailyEmailReminders();
  return apiSuccess(summary);
}
