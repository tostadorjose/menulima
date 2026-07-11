"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Credenciales inválidas.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 text-center font-display text-2xl font-bold text-stone-800">Backoffice</h1>
      <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
        <input
          required
          placeholder="Usuario"
          className="w-full rounded-xl border border-stone-200 px-4 py-3"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          autoComplete="username"
        />
        <input
          required
          type="password"
          placeholder="Contraseña"
          className="w-full rounded-xl border border-stone-200 px-4 py-3"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" type="submit" disabled={busy}>
          {busy ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
