"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";

interface Report {
  fecha: string;
  totalVentas: number;
  cantidadPedidos: number;
  pedidos: Order[];
}

export default function SalesReport() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/sales-today")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setReport(data);
      })
      .catch(() => setError("No se pudo cargar el reporte."));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!report) return <p className="text-sm text-stone-400">Cargando...</p>;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm text-stone-500">Ventas de hoy ({report.fecha})</p>
          <p className="mt-1 text-3xl font-bold text-aji-600">S/ {report.totalVentas.toFixed(2)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-stone-500">Pedidos</p>
          <p className="mt-1 text-3xl font-bold text-stone-800">{report.cantidadPedidos}</p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {report.pedidos.map((p) => (
          <div key={p.orderId} className="flex items-center justify-between rounded-xl border border-stone-100 px-4 py-3 text-sm">
            <span>#{p.orderId} · {p.nombre}</span>
            <span className="font-semibold">S/ {p.total.toFixed(2)} · {p.estado}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
