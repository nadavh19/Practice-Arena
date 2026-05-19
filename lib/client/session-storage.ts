const CURRENT_SESSION_KEY = "practiceArenaCurrentSessionId";

export function getCurrentSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CURRENT_SESSION_KEY);
}

export function setCurrentSessionId(sessionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
}

export function clearCurrentSessionId() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CURRENT_SESSION_KEY);
}
