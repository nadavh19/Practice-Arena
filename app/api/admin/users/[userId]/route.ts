import { apiError, apiSuccess } from "@/lib/api-response";
import { getAdminFromRequest } from "@/lib/auth";
import { getAdminUserDetail } from "@/services/admin.service";

export async function GET(request: Request, context: { params: Promise<{ userId: string }> }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid admin token" });
  }

  const { userId } = await context.params;
  const user = await getAdminUserDetail(userId);
  if (!user) {
    return apiError(404, { code: "USER_NOT_FOUND", message: "User not found" });
  }

  return apiSuccess(user);
}
