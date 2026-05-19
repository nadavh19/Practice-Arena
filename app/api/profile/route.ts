import { apiError, apiSuccess } from "@/lib/api-response";
import { getUserFromRequest } from "@/lib/auth";
import { getValidationErrorMessage } from "@/lib/validation-error";
import { profileUpdateSchema } from "@/lib/validators";
import { getUserById, updateUserProfile } from "@/services/user.service";

export async function GET(request: Request) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return apiError(401, { code: "UNAUTHORIZED", message: "Missing or invalid token" });
  }

  const user = await getUserById(authUser.id);
  if (!user) {
    return apiError(404, { code: "USER_NOT_FOUND", message: "User not found" });
  }

  return apiSuccess(user);
}

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

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, { code: "VALIDATION_ERROR", message: getValidationErrorMessage(parsed.error) });
  }

  try {
    const updatedUser = await updateUserProfile(authUser.id, parsed.data);
    return apiSuccess(updatedUser);
  } catch {
    return apiError(404, { code: "USER_NOT_FOUND", message: "User not found" });
  }
}
