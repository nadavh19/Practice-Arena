import { apiError, apiSuccess } from "@/lib/api-response";
import { getAdminFromRequest } from "@/lib/auth";
import { getValidationErrorMessage } from "@/lib/validation-error";
import { adminCreateTaskSchema } from "@/lib/validators";
import { createAdminTask, getAdminTasks } from "@/services/admin.service";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid admin token" });
  }

  const tasks = await getAdminTasks();
  return apiSuccess(tasks);
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

  const parsed = adminCreateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, { code: "VALIDATION_ERROR", message: getValidationErrorMessage(parsed.error) });
  }

  const task = await createAdminTask(parsed.data);
  return apiSuccess(task, 201);
}
