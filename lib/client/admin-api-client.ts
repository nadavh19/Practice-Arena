import { clearAdminToken, getAdminToken } from "@/lib/client/admin-auth-storage";
import type { ApiFailure, ApiResult } from "@/lib/client/types";

function toFallbackError(message: string): ApiFailure {
  return {
    success: false,
    error: {
      code: "REQUEST_FAILED",
      message,
    },
  };
}

function redirectToAdminLoginIfClient() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== "/admin/login") {
    window.location.href = "/admin/login";
  }
}

function handleUnauthorized() {
  clearAdminToken();
  redirectToAdminLoginIfClient();
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const token = getAdminToken();
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers,
    });
  } catch {
    return toFallbackError("Network error. Please try again.");
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    return payload as ApiResult<T>;
  }

  if (!response.ok) {
    return toFallbackError("Request failed. Please try again.");
  }

  return toFallbackError("Unexpected response format.");
}

export function adminApiGet<T>(path: string) {
  return request<T>(path, {
    method: "GET",
  });
}

export function adminApiPost<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
