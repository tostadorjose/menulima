"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";

export default function OrdersToVerify() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/orders/pending-yape");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders ?? []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleVerify(orderId: string) {
    setBusyId(orderId);
    try {
      await fetch(`/api/admin/orders/${orderId}/verify-yape`, { method: "POST" });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (orders.length === 0) {
    return <p className="text-sm text-stone-400">No hay pagos Yape pendientes de verificar.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.orderId} className="flex items-center justify-between rounded-xl border border-stone-100 px-4 py-3">
          <div>
            <p className="font-semibold text-stone-800">#{o.orderId} · {o.nombre}</p>
            <p className="text-sm text-stone-500">S/ {o.total.toFixed(2)} · {o.telefono}</p>
          </div>
          <button
            className="rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            disabled={busyId === o.orderId}
            onClick={() => handleVerify(o.orderId)}
          >
            {busyId === o.orderId ? "..." : "Marcar como pagado"}
          </button>
        </div>
      ))}
    </div>
  );
}
