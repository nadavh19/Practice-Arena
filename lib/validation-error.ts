import type { ZodError } from "zod";

export function getValidationErrorMessage(error: ZodError) {
  const firstIssue = error.issues[0];
  if (!firstIssue) {
    return "Invalid request payload";
  }

  return firstIssue.message;
}
