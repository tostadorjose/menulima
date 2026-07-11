"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import type { EstadoPedido, Order } from "@/lib/types";

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendiente_pago: "Pendiente de pago",
  pendiente_verificacion: "Pago en verificación",
  pagado: "Pago confirmado",
  en_preparacion: "En preparación",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const ESTADOS_ACTIVOS: EstadoPedido[] = [
  "pendiente_pago",
  "pendiente_verificacion",
  "pagado",
  "en_preparacion",
  "en_camino",
];

export default function CuentaPage() {
  const { user, loading, updateProfile } = useAuth();
  const { openModal } = useAuthModal();
  const [orders, setOrders] = useState<Order[]>([]);
  const [telefono, setTelefono] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders ?? []);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setTelefono((user.user_metadata?.telefono as string) ?? "");
    loadOrders();
    // Intervalo fijo: mientras haya sesión, refresca cada 10s (barato y
    // simple; evitar un intervalo "adaptativo" que dependa de `orders`
    // dentro de este mismo efecto, ya que causaría loops de recreación).
    const id = setInterval(loadOrders, 10_000);
    return () => clearInterval(id);
  }, [user, loadOrders]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await updateProfile({ telefono });
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, nombre: user.user_metadata?.full_name ?? "", telefono }),
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-stone-400">Cargando...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-stone-800">Mi cuenta</h1>
        <p className="mt-2 text-stone-500">Inicia sesión para ver tus pedidos y datos de facturación.</p>
        <button className="btn-primary mt-6" onClick={() => openModal("login")}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  const activos = orders.filter((o) => ESTADOS_ACTIVOS.includes(o.estado));
  const historial = orders.filter((o) => !ESTADOS_ACTIVOS.includes(o.estado));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold text-stone-800">Mi cuenta</h1>
      <p className="mt-1 text-stone-500">{user.email}</p>

      {activos.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-bold text-stone-800">Pedido(s) en curso</h2>
          <div className="mt-3 space-y-3">
            {activos.map((o) => (
              <div key={o.orderId} className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-stone-800">#{o.orderId}</p>
                  <span className="rounded-full bg-aji-50 px-3 py-1 text-xs font-bold text-aji-600">
                    {ESTADO_LABEL[o.estado]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone-500">
                  {o.canal === "delivery" ? "Delivery" : "Recojo en tienda"} · S/ {o.total.toFixed(2)}
                </p>
                {o.rappiCargoId && (
                  <p className="mt-1 text-xs text-stone-400">Motorizado asignado: {o.rappiCargoId}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-stone-800">Historial de compras</h2>
        {historial.length === 0 ? (
          <p className="mt-2 text-sm text-stone-400">Aún no tienes pedidos completados.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {historial.map((o) => (
              <div key={o.orderId} className="flex items-center justify-between rounded-xl border border-stone-100 px-4 py-3">
                <span className="text-sm text-stone-600">
                  #{o.orderId} · {o.fecha}
                </span>
                <span className="text-sm font-semibold text-stone-700">
                  {ESTADO_LABEL[o.estado]} · S/ {o.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-stone-800">Datos de contacto</h2>
        <form className="card mt-3 flex flex-col gap-3 p-5 sm:flex-row sm:items-center" onSubmit={handleSaveProfile}>
          <input
            className="flex-1 rounded-xl border border-stone-200 px-4 py-3"
            placeholder="Celular"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <button className="btn-primary sm:w-auto" type="submit" disabled={savingProfile}>
            {savedMsg ? "Guardado ✓" : savingProfile ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </section>
    </div>
  );
}
