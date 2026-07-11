"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  apiLoginPassword,
  apiRecover,
  apiRefreshToken,
  apiSignup,
  apiUpdateUser,
  apiVerify,
  type IdentitySession,
  type IdentityUser,
} from "@/lib/auth/netlifyIdentity";
import { clearSession, loadSession, needsRefresh, saveSession } from "@/lib/auth/session";

interface AuthContextValue {
  user: IdentityUser | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => Promise<{ needsConfirmation: boolean }>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  recover: (email: string) => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<IdentitySession | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((s: IdentitySession | null) => {
    setSession(s);
    if (s) saveSession(s);
    else clearSession();
  }, []);

  const ensureFreshSession = useCallback(
    async (s: IdentitySession): Promise<IdentitySession> => {
      if (!needsRefresh(s)) return s;
      const refreshed = await apiRefreshToken(s.refresh_token);
      persist(refreshed);
      return refreshed;
    },
    [persist]
  );

  useEffect(() => {
    async function handleAuthHash(): Promise<boolean> {
      if (typeof window === "undefined") return false;
      const hash = window.location.hash;
      if (!hash) return false;
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const confirmationToken = params.get("confirmation_token");
      const recoveryToken = params.get("recovery_token");
      if (!confirmationToken && !recoveryToken) return false;

      try {
        const s = confirmationToken
          ? await apiVerify("signup", confirmationToken)
          : await apiVerify("recovery", recoveryToken as string);
        persist(s);
      } finally {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      return true;
    }

    (async () => {
      try {
        const handled = await handleAuthHash().catch(() => false);
        if (!handled) {
          const stored = loadSession();
          if (stored) {
            const fresh = await ensureFreshSession(stored).catch(() => null);
            if (fresh) setSession(fresh);
            else clearSession();
          }
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signup = useCallback(
    async (email: string, password: string, metadata: Record<string, unknown> = {}) => {
      await apiSignup(email, password, metadata);
      // autoconfirm=false por defecto: si el login inmediato falla, es porque falta confirmar por correo.
      try {
        const s = await apiLoginPassword(email, password);
        persist(s);
        return { needsConfirmation: false };
      } catch {
        return { needsConfirmation: true };
      }
    },
    [persist]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const s = await apiLoginPassword(email, password);
      persist(s);
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const recover = useCallback(async (email: string) => {
    await apiRecover(email);
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!session) return null;
    const fresh = await ensureFreshSession(session).catch(() => null);
    return fresh?.access_token ?? null;
  }, [session, ensureFreshSession]);

  const updateProfile = useCallback(
    async (data: Record<string, unknown>) => {
      const token = await getAccessToken();
      if (!token) throw new Error("No hay sesión activa");
      const updated = await apiUpdateUser(token, data);
      setSession((prev) => {
        if (!prev) return prev;
        const next = { ...prev, user: updated };
        saveSession(next);
        return next;
      });
    },
    [getAccessToken]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user: session?.user ?? null, loading, signup, login, logout, recover, updateProfile, getAccessToken }),
    [session, loading, signup, login, logout, recover, updateProfile, getAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
