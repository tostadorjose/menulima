import type { IdentitySession } from "./netlifyIdentity";

const STORAGE_KEY = "menulima_session";
const REFRESH_MARGIN_MS = 60_000; // refrescar si falta menos de 1 min para expirar

export function saveSession(session: IdentitySession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): IdentitySession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IdentitySession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function needsRefresh(session: IdentitySession): boolean {
  return Date.now() > session.expires_at - REFRESH_MARGIN_MS;
}
