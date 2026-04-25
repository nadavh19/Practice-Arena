import { clearToken, getToken } from "@/lib/client/auth-storage";
import { clearCurrentSessionId } from "@/lib/client/session-storage";
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

function redirectToAuthIfClient() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== "/auth") {
    window.location.href = "/auth";
  }
}

function handleUnauthorized() {
  clearToken();
  clearCurrentSessionId();
  redirectToAuthIfClient();
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const token = getToken();
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
    const result = payload as ApiResult<T>;
    if (!result.success) {
      return result;
    }

    return result;
  }

  if (!response.ok) {
    return toFallbackError("Request failed. Please try again.");
  }

  return toFallbackError("Unexpected response format.");
}

export function apiGet<T>(path: string) {
  return request<T>(path, {
    method: "GET",
  });
}

export function apiPost<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
