import { apiError, apiSuccess } from "@/lib/api-response";
import { createToken } from "@/lib/auth";
import { signupSchema } from "@/lib/validators";
import { createUser } from "@/services/user.service";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError(400, { code: "INVALID_JSON", message: "Request body must be valid JSON" });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, { code: "VALIDATION_ERROR", message: parsed.error.message });
  }

  const user = await createUser(parsed.data);
  if (!user) {
    return apiError(409, { code: "EMAIL_EXISTS", message: "Email is already registered" });
  }

  const token = createToken(user.id);
  return apiSuccess({ token, user }, 201);
}
