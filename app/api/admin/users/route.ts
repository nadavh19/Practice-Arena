import { apiError, apiSuccess } from "@/lib/api-response";
import { getAdminFromRequest } from "@/lib/auth";
import { getAdminUsersOverview } from "@/services/admin.service";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid admin token" });
  }

  const users = await getAdminUsersOverview();
  return apiSuccess(users);
}
