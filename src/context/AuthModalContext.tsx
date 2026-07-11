"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type AuthModalView = "login" | "signup" | "recover" | "msg";

interface AuthModalState {
  isOpen: boolean;
  view: AuthModalView;
  message: string | null;
}

interface AuthModalContextValue extends AuthModalState {
  openModal: (view?: AuthModalView) => void;
  closeModal: () => void;
  setView: (view: AuthModalView) => void;
  showMessage: (message: string) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthModalState>({ isOpen: false, view: "login", message: null });

  const value = useMemo<AuthModalContextValue>(
    () => ({
      ...state,
      openModal: (view: AuthModalView = "login") => setState({ isOpen: true, view, message: null }),
      closeModal: () => setState((s) => ({ ...s, isOpen: false })),
      setView: (view: AuthModalView) => setState((s) => ({ ...s, view, message: null })),
      showMessage: (message: string) => setState((s) => ({ ...s, view: "msg", message })),
    }),
    [state]
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal debe usarse dentro de <AuthModalProvider>");
  return ctx;
}
