"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { getGoogleAuthUrl } from "@/lib/auth/netlifyIdentity";

/** Botón "Continuar con Google": redirige al flujo OAuth de Netlify Identity. */
function GoogleButton() {
  function handleGoogle() {
    try {
      window.location.href = getGoogleAuthUrl();
    } catch {
      /* Identity no configurado en este entorno */
    }
  }
  return (
    <>
      <div className="flex items-center gap-3 py-1" aria-hidden="true">
        <span className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">o</span>
        <span className="h-px flex-1 bg-stone-200" />
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-3 font-semibold text-tinta-800 transition-colors hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-aji-400"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Continuar con Google
      </button>
    </>
  );
}

function syncProfile(nombre: string, telefono: string, email: string) {
  fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, telefono, email }),
  }).catch(() => {
    /* la sincronización de perfil es best-effort; no bloquea el login */
  });
}

export default function AuthModal() {
  const { isOpen, view, message, closeModal, setView, showMessage } = useAuthModal();
  const { login, signup, recover } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function resetFields() {
    setEmail("");
    setPassword("");
    setNombre("");
    setTelefono("");
    setError(null);
  }

  function handleClose() {
    resetFields();
    closeModal();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      resetFields();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { needsConfirmation } = await signup(email, password, { full_name: nombre, telefono });
      syncProfile(nombre, telefono, email);
      if (needsConfirmation) {
        showMessage("¡Listo! Revisa tu correo y confirma tu cuenta para iniciar sesión.");
      } else {
        resetFields();
        closeModal();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRecover(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await recover(email);
      showMessage("Te enviamos un correo con instrucciones para recuperar tu cuenta.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar la recuperación.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="card w-full max-w-md overflow-hidden"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-aji-400 via-aji-500 to-aji-700 px-6 py-5 text-white">
              <h2 className="font-display text-xl font-bold">
                {view === "login" && "Inicia sesión"}
                {view === "signup" && "Crea tu cuenta"}
                {view === "recover" && "Recuperar cuenta"}
                {view === "msg" && "menulima"}
              </h2>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
              )}

              {view === "msg" && (
                <div className="space-y-4 text-center">
                  <p className="text-stone-600">{message}</p>
                  <button className="btn-primary w-full" onClick={() => setView("login")}>
                    Ir a iniciar sesión
                  </button>
                </div>
              )}

              {view === "login" && (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <input
                    required
                    type="email"
                    placeholder="Correo electrónico"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-aji-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    required
                    type="password"
                    placeholder="Contraseña"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-aji-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button className="btn-primary w-full" type="submit" disabled={busy}>
                    {busy ? "Ingresando..." : "Iniciar sesión"}
                  </button>
                  <GoogleButton />
                  <div className="flex justify-between text-sm text-stone-500">
                    <button type="button" className="hover:text-aji-600" onClick={() => setView("recover")}>
                      Olvidé mi contraseña
                    </button>
                    <button type="button" className="hover:text-aji-600" onClick={() => setView("signup")}>
                      Crear cuenta
                    </button>
                  </div>
                </form>
              )}

              {view === "signup" && (
                <form className="space-y-4" onSubmit={handleSignup}>
                  <input
                    required
                    type="text"
                    placeholder="Nombre completo"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-aji-400"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Celular"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-aji-400"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Correo electrónico"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-aji-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    required
                    minLength={6}
                    type="password"
                    placeholder="Contraseña (mínimo 6 caracteres)"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-aji-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button className="btn-primary w-full" type="submit" disabled={busy}>
                    {busy ? "Creando cuenta..." : "Crear cuenta"}
                  </button>
                  <GoogleButton />
                  <div className="text-center text-sm text-stone-500">
                    ¿Ya tienes cuenta?{" "}
                    <button type="button" className="text-aji-600 hover:underline" onClick={() => setView("login")}>
                      Inicia sesión
                    </button>
                  </div>
                </form>
              )}

              {view === "recover" && (
                <form className="space-y-4" onSubmit={handleRecover}>
                  <input
                    required
                    type="email"
                    placeholder="Correo electrónico"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-aji-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="btn-primary w-full" type="submit" disabled={busy}>
                    {busy ? "Enviando..." : "Enviar instrucciones"}
                  </button>
                  <div className="text-center text-sm text-stone-500">
                    <button type="button" className="hover:text-aji-600" onClick={() => setView("login")}>
                      Volver a inicio de sesión
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
