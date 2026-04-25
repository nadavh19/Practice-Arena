import bcrypt from "bcryptjs";
import { apiError, apiSuccess } from "@/lib/api-response";
import { createToken } from "@/lib/auth";
import { getValidationErrorMessage } from "@/lib/validation-error";
import { loginSchema } from "@/lib/validators";
import { getUserByEmail, getUserById } from "@/services/user.service";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError(400, { code: "INVALID_JSON", message: "Request body must be valid JSON" });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, { code: "VALIDATION_ERROR", message: getValidationErrorMessage(parsed.error) });
  }

  const userWithPassword = await getUserByEmail(parsed.data.email);
  if (!userWithPassword) {
    return apiError(401, { code: "INVALID_CREDENTIALS", message: "Invalid email or password" });
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, userWithPassword.password);
  if (!passwordMatches) {
    return apiError(401, { code: "INVALID_CREDENTIALS", message: "Invalid email or password" });
  }

  const user = await getUserById(userWithPassword.id);
  if (!user) {
    return apiError(404, { code: "USER_NOT_FOUND", message: "User not found" });
  }

  const token = createToken(user.id);
  return apiSuccess({ token, user });
}
