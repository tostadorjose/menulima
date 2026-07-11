"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import IzipayEmbeddedForm from "@/components/IzipayEmbeddedForm";
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

export default function ConfirmacionPage() {
  const params = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const metodoPago = searchParams.get("metodoPago");
  const orderId = params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [izipay, setIzipay] = useState<{ formToken: string; publicKey: string } | null>(null);
  const [izipayError, setIzipayError] = useState<string | null>(null);
  const [operationNumber, setOperationNumber] = useState("");
  const [yapeSubmitting, setYapeSubmitting] = useState(false);
  const [yapeSent, setYapeSent] = useState(false);
  const [paidLocally, setPaidLocally] = useState(false);

  const refreshOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch {
      /* polling silencioso */
    }
  }, [orderId]);

  useEffect(() => {
    refreshOrder();
    const id = setInterval(refreshOrder, 10_000);
    return () => clearInterval(id);
  }, [refreshOrder]);

  useEffect(() => {
    if (metodoPago !== "izipay") return;
    fetch("/api/payments/izipay/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.formToken) setIzipay({ formToken: data.formToken, publicKey: data.publicKey });
        else setIzipayError(data.error ?? "Pago con tarjeta no disponible.");
      })
      .catch(() => setIzipayError("Pago con tarjeta no disponible."));
  }, [metodoPago, orderId]);

  async function handleYapeConfirm(e: React.FormEvent) {
    e.preventDefault();
    setYapeSubmitting(true);
    try {
      const res = await fetch("/api/payments/yape/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, operationNumber }),
      });
      if (res.ok) {
        setYapeSent(true);
        refreshOrder();
      }
    } finally {
      setYapeSubmitting(false);
    }
  }

  const estadoActual = order?.estado;
  const esTerminal = estadoActual === "entregado" || estadoActual === "cancelado";

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-2xl font-extrabold text-stone-800">Pedido #{orderId}</h1>

      {order && (
        <div className="card mt-4 p-5">
          <p className="text-sm text-stone-500">Estado del pedido</p>
          <p className="text-xl font-bold text-aji-600">{ESTADO_LABEL[order.estado]}</p>
          <p className="mt-2 text-sm text-stone-500">Total: S/ {order.total.toFixed(2)}</p>
        </div>
      )}

      {metodoPago === "izipay" && !paidLocally && !esTerminal && (
        <div className="card mt-6 p-6">
          <h2 className="mb-3 font-display text-lg font-bold text-stone-800">Pago con tarjeta</h2>
          {izipayError && <p className="text-sm text-amber-700">{izipayError}</p>}
          {izipay && (
            <IzipayEmbeddedForm
              formToken={izipay.formToken}
              publicKey={izipay.publicKey}
              onPaid={() => setPaidLocally(true)}
            />
          )}
        </div>
      )}

      {metodoPago === "yape" && !yapeSent && (
        <div className="card mt-6 p-6">
          <h2 className="mb-3 font-display text-lg font-bold text-stone-800">Paga con Yape</h2>
          <p className="text-sm text-stone-500">
            Escanea el QR o yapea al {process.env.NEXT_PUBLIC_YAPE_PHONE_NUMBER} y confirma el número de operación.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/yape-qr.png" alt="QR de Yape" className="mx-auto my-4 h-48 w-48 rounded-xl border border-stone-200 object-contain" />
          <form className="space-y-3" onSubmit={handleYapeConfirm}>
            <input
              required
              placeholder="N° de operación"
              className="w-full rounded-xl border border-stone-200 px-4 py-3"
              value={operationNumber}
              onChange={(e) => setOperationNumber(e.target.value)}
            />
            <button className="btn-primary w-full" type="submit" disabled={yapeSubmitting}>
              {yapeSubmitting ? "Enviando..." : "Confirmar pago"}
            </button>
          </form>
        </div>
      )}

      {(paidLocally || yapeSent) && (
        <div className="mt-6 rounded-xl bg-green-50 p-5 text-green-700">
          {yapeSent
            ? "¡Gracias! Tu pago quedó en verificación manual, te avisaremos apenas se confirme."
            : "¡Pago iniciado! Sigue el estado de tu pedido aquí o en Mi cuenta."}
        </div>
      )}

      <Link href="/cuenta" className="btn-secondary mt-6 inline-block">
        Ir a Mi cuenta
      </Link>
    </div>
  );
}
