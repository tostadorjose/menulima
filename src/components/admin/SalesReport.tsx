"use client";

import { useCallback, useEffect, useState } from "react";
import type { SalesTodayReport } from "@/lib/sheetsClient";
import type { EstadoPedido } from "@/lib/types";

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendiente_pago: "Pendiente de pago",
  pendiente_verificacion: "En verificación",
  pagado: "Pagado",
  en_preparacion: "En preparación",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

function Indicador({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-stone-500">{titulo}</p>
      <p className="mt-1 text-2xl font-bold text-tinta-900">{valor}</p>
      {detalle && <p className="mt-0.5 text-xs text-stone-400">{detalle}</p>}
    </div>
  );
}

export default function SalesReport() {
  const [report, setReport] = useState<SalesTodayReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/sales-today")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setReport(data);
          setError(null);
          setUpdatedAt(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }));
        }
      })
      .catch(() => setError("No se pudo cargar el reporte."));
  }, []);

  useEffect(() => {
    load();
    // Refresco automático cada 60s para que el panel siempre esté al día.
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!report) return <p className="text-sm text-stone-400">Cargando...</p>;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Indicador
          titulo={`Ventas de hoy (${report.fecha})`}
          valor={`S/ ${report.totalVentas.toFixed(2)}`}
          detalle={`${report.cantidadPedidos} pedido(s) pagado(s)`}
        />
        <Indicador
          titulo={`Ventas del mes (${report.mes.periodo})`}
          valor={`S/ ${report.mes.totalVentas.toFixed(2)}`}
          detalle={`${report.mes.cantidadPedidos} pedido(s)`}
        />
        <Indicador
          titulo="Total recaudado (histórico)"
          valor={`S/ ${report.historico.totalVentas.toFixed(2)}`}
          detalle={`${report.historico.cantidadPedidos} pedido(s) en total`}
        />
        <Indicador titulo="Ticket promedio" valor={`S/ ${report.ticketPromedio.toFixed(2)}`} />
        <div className="card p-5 sm:col-span-2">
          <p className="text-sm text-stone-500">Productos más vendidos</p>
          {report.topProductos.length === 0 ? (
            <p className="mt-2 text-sm text-stone-400">Aún no hay ventas registradas.</p>
          ) : (
            <ol className="mt-2 space-y-1">
              {report.topProductos.map((p, i) => (
                <li key={p.nombre} className="flex items-center justify-between text-sm">
                  <span className="text-tinta-800">
                    <span className="mr-2 font-bold text-aji-500">{i + 1}.</span>
                    {p.nombre}
                  </span>
                  <span className="font-semibold text-stone-600">{p.cantidad} und.</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-tinta-900">Pedidos de hoy</h3>
        <button className="text-sm font-semibold text-aji-600 hover:underline" onClick={load}>
          Actualizar {updatedAt ? `(últ. ${updatedAt})` : ""}
        </button>
      </div>
      {report.pedidos.length === 0 ? (
        <p className="mt-2 text-sm text-stone-400">Todavía no hay ventas pagadas hoy.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {report.pedidos.map((p) => (
            <div
              key={p.orderId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-100 bg-white px-4 py-3 text-sm"
            >
              <span className="text-stone-600">
                <span className="font-semibold text-tinta-900">#{p.orderId}</span> · {p.hora} · {p.nombre}
              </span>
              <span className="flex items-center gap-3">
                <span className="rounded-full bg-lima-100 px-3 py-0.5 text-xs font-bold text-lima-700">
                  {ESTADO_LABEL[p.estado]}
                </span>
                <span className="font-semibold">S/ {p.total.toFixed(2)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
