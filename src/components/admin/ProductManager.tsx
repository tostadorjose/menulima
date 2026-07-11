"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PriceEntry } from "@/lib/types";

const CATEGORIA_LABEL: Record<string, string> = {
  menu: "Menú del día",
  comida_criolla_carnes: "Comida criolla y carnes",
  pescados_mariscos: "Pescados y mariscos",
  sopas: "Sopas",
  guarniciones: "Guarniciones",
  bebidas: "Bebidas",
};

const CATEGORIAS_NUEVO = [
  "comida_criolla_carnes",
  "pescados_mariscos",
  "sopas",
  "guarniciones",
  "bebidas",
];

const ORDEN_CATEGORIAS = ["menu", ...CATEGORIAS_NUEVO];

interface Draft {
  nombre: string;
  precioBase: string;
  imagenUrl: string;
}

export default function ProductManager() {
  const [products, setProducts] = useState<PriceEntry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Formulario de producto nuevo
  const [nuevo, setNuevo] = useState({ nombre: "", categoria: "comida_criolla_carnes", precio: "", imagenUrl: "" });
  const [creando, setCreando] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/prices")
      .then((r) => r.json())
      .then((data: { prices?: PriceEntry[]; error?: string }) => {
        if (data.error) setError(data.error);
        else setProducts(data.prices ?? []);
      })
      .catch(() => setError("No se pudo cargar el catálogo."));
  }, []);

  useEffect(load, [load]);

  const porCategoria = useMemo(() => {
    const grupos = new Map<string, PriceEntry[]>();
    for (const p of products) {
      const cat = p.categoria || "otros";
      if (!grupos.has(cat)) grupos.set(cat, []);
      grupos.get(cat)!.push(p);
    }
    return ORDEN_CATEGORIAS.filter((c) => grupos.has(c)).map((c) => ({
      id: c,
      nombre: CATEGORIA_LABEL[c] ?? c,
      items: grupos.get(c)!,
    }));
  }, [products]);

  function flash(msg: string) {
    setOkMsg(msg);
    setError(null);
    setTimeout(() => setOkMsg(null), 2500);
  }

  function getDraft(p: PriceEntry): Draft {
    return (
      drafts[p.key] ?? {
        nombre: p.nombre,
        precioBase: String(p.precioBase),
        imagenUrl: p.imagenUrl ?? "",
      }
    );
  }

  function setDraft(key: string, patch: Partial<Draft>, base: PriceEntry) {
    setDrafts((prev) => ({ ...prev, [key]: { ...getDraftFrom(prev, base), ...patch } }));
    function getDraftFrom(prev: Record<string, Draft>, p: PriceEntry): Draft {
      return prev[p.key] ?? { nombre: p.nombre, precioBase: String(p.precioBase), imagenUrl: p.imagenUrl ?? "" };
    }
  }

  async function callApi(method: "POST" | "DELETE", body?: unknown, query = ""): Promise<boolean> {
    const res = await fetch(`/api/admin/products${query}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      setError(data.error ?? "No se pudo guardar.");
      return false;
    }
    return true;
  }

  async function handleGuardar(p: PriceEntry) {
    const d = getDraft(p);
    const precio = Number(d.precioBase);
    if (!d.nombre.trim() || Number.isNaN(precio) || precio <= 0) {
      setError("Nombre y precio válido son obligatorios.");
      return;
    }
    setBusyKey(p.key);
    try {
      const ok = await callApi("POST", {
        key: p.key,
        nombre: d.nombre.trim(),
        categoria: p.categoria,
        precioBase: precio,
        activo: p.activo !== false,
        imagenUrl: d.imagenUrl.trim(),
      });
      if (ok) {
        flash(`"${d.nombre.trim()}" guardado.`);
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[p.key];
          return next;
        });
        load();
      }
    } finally {
      setBusyKey(null);
    }
  }

  async function handleToggleActivo(p: PriceEntry) {
    setBusyKey(p.key);
    try {
      const ok = await callApi("POST", {
        key: p.key,
        nombre: p.nombre,
        categoria: p.categoria,
        precioBase: p.precioBase,
        activo: p.activo === false, // invierte
        imagenUrl: p.imagenUrl ?? "",
      });
      if (ok) {
        flash(p.activo === false ? `"${p.nombre}" activado.` : `"${p.nombre}" desactivado (oculto de la carta).`);
        load();
      }
    } finally {
      setBusyKey(null);
    }
  }

  async function handleEliminar(p: PriceEntry) {
    if (!window.confirm(`¿Eliminar "${p.nombre}" del catálogo? Esta acción no se puede deshacer.`)) return;
    setBusyKey(p.key);
    try {
      const ok = await callApi("DELETE", undefined, `?key=${encodeURIComponent(p.key)}`);
      if (ok) {
        flash(`"${p.nombre}" eliminado.`);
        load();
      }
    } finally {
      setBusyKey(null);
    }
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    const precio = Number(nuevo.precio);
    if (!nuevo.nombre.trim() || Number.isNaN(precio) || precio <= 0) {
      setError("Para crear un producto: nombre y precio válido.");
      return;
    }
    setCreando(true);
    try {
      const ok = await callApi("POST", {
        nombre: nuevo.nombre.trim(),
        categoria: nuevo.categoria,
        precioBase: precio,
        activo: true,
        imagenUrl: nuevo.imagenUrl.trim(),
      });
      if (ok) {
        flash(`"${nuevo.nombre.trim()}" agregado a la carta.`);
        setNuevo({ nombre: "", categoria: nuevo.categoria, precio: "", imagenUrl: "" });
        load();
      }
    } finally {
      setCreando(false);
    }
  }

  return (
    <div>
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {okMsg && <div className="mb-4 rounded-xl bg-lima-100 px-4 py-2 text-sm text-lima-700">{okMsg}</div>}

      {/* ── Agregar producto ── */}
      <form className="card mb-8 p-5" onSubmit={handleCrear}>
        <h3 className="font-display text-base font-bold text-tinta-900">Agregar producto</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
            placeholder="Nombre del plato"
            value={nuevo.nombre}
            onChange={(e) => setNuevo((n) => ({ ...n, nombre: e.target.value }))}
          />
          <select
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
            value={nuevo.categoria}
            onChange={(e) => setNuevo((n) => ({ ...n, categoria: e.target.value }))}
          >
            {CATEGORIAS_NUEVO.map((c) => (
              <option key={c} value={c}>
                {CATEGORIA_LABEL[c]}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.5"
            min="0"
            className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
            placeholder="Precio base S/"
            value={nuevo.precio}
            onChange={(e) => setNuevo((n) => ({ ...n, precio: e.target.value }))}
          />
          <input
            className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
            placeholder="URL de imagen (opcional)"
            value={nuevo.imagenUrl}
            onChange={(e) => setNuevo((n) => ({ ...n, imagenUrl: e.target.value }))}
          />
        </div>
        <p className="mt-2 text-xs text-stone-400">
          A los platos (criollos, pescados y sopas) se les suma automáticamente el recargo de S/ 2.00 en la carta
          pública. La imagen es opcional: pega la dirección de una foto ya subida a internet.
        </p>
        <button className="btn-primary mt-3 !px-5 !py-2 text-sm" type="submit" disabled={creando}>
          {creando ? "Agregando..." : "Agregar a la carta"}
        </button>
      </form>

      {/* ── Catálogo ── */}
      {porCategoria.map((cat) => (
        <section key={cat.id} className="mb-8">
          <h3 className="mb-2 font-display text-base font-bold text-aji-600">{cat.nombre}</h3>
          <div className="space-y-2">
            {cat.items.map((p) => {
              const d = getDraft(p);
              const inactivo = p.activo === false;
              const esMenu = p.key === "menu";
              return (
                <div
                  key={p.key}
                  className={`rounded-xl border px-4 py-3 ${
                    inactivo ? "border-stone-200 bg-stone-50 opacity-70" : "border-stone-100 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="min-w-40 flex-1 rounded-lg border border-stone-200 px-2 py-1 text-sm disabled:border-transparent disabled:bg-transparent"
                      value={d.nombre}
                      disabled={esMenu}
                      onChange={(e) => setDraft(p.key, { nombre: e.target.value }, p)}
                    />
                    <span className="text-sm text-stone-400">S/</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="w-24 rounded-lg border border-stone-200 px-2 py-1 text-right text-sm"
                      value={d.precioBase}
                      onChange={(e) => setDraft(p.key, { precioBase: e.target.value }, p)}
                    />
                    <button
                      className="rounded-full bg-tinta-900 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-aji-500 disabled:opacity-40"
                      disabled={busyKey === p.key}
                      onClick={() => handleGuardar(p)}
                    >
                      {busyKey === p.key ? "..." : "Guardar"}
                    </button>
                    {!esMenu && (
                      <>
                        <button
                          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                            inactivo
                              ? "bg-lima-100 text-lima-700 hover:bg-lima-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                          disabled={busyKey === p.key}
                          onClick={() => handleToggleActivo(p)}
                        >
                          {inactivo ? "Activar" : "Desactivar"}
                        </button>
                        <button
                          className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-40"
                          disabled={busyKey === p.key}
                          onClick={() => handleEliminar(p)}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                    {inactivo && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Oculto de la carta
                      </span>
                    )}
                  </div>
                  {!esMenu && (
                    <input
                      className="mt-2 w-full rounded-lg border border-stone-100 px-2 py-1 text-xs text-stone-500"
                      placeholder="URL de imagen (opcional)"
                      value={d.imagenUrl}
                      onChange={(e) => setDraft(p.key, { imagenUrl: e.target.value }, p)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
