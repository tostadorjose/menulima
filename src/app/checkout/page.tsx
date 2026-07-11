"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { computeFlete } from "@/lib/pricing";
import type { CanalEntrega, MetodoPago } from "@/lib/types";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [canal, setCanal] = useState<CanalEntrega>("delivery");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("izipay");
  const [comprobanteTipo, setComprobanteTipo] = useState<"boleta" | "factura">("boleta");
  const [nombre, setNombre] = useState((user?.user_metadata?.full_name as string) ?? "");
  const [telefono, setTelefono] = useState((user?.user_metadata?.telefono as string) ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [dni, setDni] = useState("");
  const [ruc, setRuc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [direccion, setDireccion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [distrito, setDistrito] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const flete = computeFlete(canal);
  const total = subtotal + flete;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          canal,
          metodoPago,
          direccion:
            canal === "delivery" ? { direccion, referencia, distrito } : undefined,
          comprobante: {
            tipo: comprobanteTipo,
            dni: comprobanteTipo === "boleta" ? dni : undefined,
            ruc: comprobanteTipo === "factura" ? ruc : undefined,
            razonSocial: comprobanteTipo === "factura" ? razonSocial : undefined,
            nombre,
            telefono,
            email,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear el pedido.");

      clearCart();
      router.push(`/checkout/confirmacion/${data.orderId}?metodoPago=${metodoPago}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pedido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold text-stone-800">Checkout</h1>

      <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
        <section className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-stone-800">Entrega</h2>
          <div className="flex gap-3">
            {(["delivery", "recojo"] as CanalEntrega[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCanal(c)}
                className={`flex-1 rounded-xl border-2 py-3 font-semibold ${
                  canal === c ? "border-aji-500 bg-aji-50 text-aji-700" : "border-stone-200 text-stone-500"
                }`}
              >
                {c === "delivery" ? "Delivery" : "Recojo en tienda"}
              </button>
            ))}
          </div>

          {canal === "delivery" && (
            <div className="mt-4 space-y-3">
              <input
                required
                placeholder="Dirección completa"
                className="w-full rounded-xl border border-stone-200 px-4 py-3"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Distrito"
                  className="rounded-xl border border-stone-200 px-4 py-3"
                  value={distrito}
                  onChange={(e) => setDistrito(e.target.value)}
                />
                <input
                  placeholder="Referencia"
                  className="rounded-xl border border-stone-200 px-4 py-3"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                />
              </div>
            </div>
          )}
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-stone-800">Datos de contacto y comprobante</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Nombre completo"
              className="rounded-xl border border-stone-200 px-4 py-3"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <input
              required
              placeholder="Celular"
              className="rounded-xl border border-stone-200 px-4 py-3"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <input
              required
              type="email"
              placeholder="Correo electrónico"
              className="rounded-xl border border-stone-200 px-4 py-3 sm:col-span-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mt-4 flex gap-3">
            {(["boleta", "factura"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setComprobanteTipo(t)}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold capitalize ${
                  comprobanteTipo === t ? "border-aji-500 bg-aji-50 text-aji-700" : "border-stone-200 text-stone-500"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {comprobanteTipo === "boleta" ? (
            <input
              placeholder="DNI (opcional)"
              className="mt-3 w-full rounded-xl border border-stone-200 px-4 py-3"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="RUC"
                className="rounded-xl border border-stone-200 px-4 py-3"
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
              />
              <input
                required
                placeholder="Razón social"
                className="rounded-xl border border-stone-200 px-4 py-3"
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
              />
            </div>
          )}
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-stone-800">Método de pago</h2>
          <div className="flex gap-3">
            {(["izipay", "yape"] as MetodoPago[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodoPago(m)}
                className={`flex-1 rounded-xl border-2 py-3 font-semibold capitalize ${
                  metodoPago === m ? "border-aji-500 bg-aji-50 text-aji-700" : "border-stone-200 text-stone-500"
                }`}
              >
                {m === "izipay" ? "Tarjeta (Izipay)" : "Yape"}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Flete</span>
            <span>S/ {flete.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-stone-100 pt-2 text-lg font-bold text-stone-800">
            <span>Total</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </section>

        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <button className="btn-primary w-full" type="submit" disabled={busy || items.length === 0}>
          {busy ? "Procesando..." : `Pagar S/ ${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
