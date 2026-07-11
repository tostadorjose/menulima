"use client";

import { useEffect, useMemo, useState } from "react";
import { CARTA_CATEGORIAS, CATEGORIA_LABELS, computeCartaPrice } from "@/lib/cartaData";
import { useCart } from "@/context/CartContext";
import type { PriceEntry } from "@/lib/types";

interface CartaProducto {
  key: string;
  nombre: string;
  categoria: string;
  precioBase: number;
  imagenUrl?: string;
}

/** Catálogo por defecto (hardcodeado) como respaldo si Sheets no responde. */
const FALLBACK: CartaProducto[] = CARTA_CATEGORIAS.flatMap((cat) =>
  cat.items.map((i) => ({ key: i.key, nombre: i.plato, categoria: i.categoria, precioBase: i.precioBase }))
);

export default function CartaPage() {
  const { addCartaItem } = useCart();
  const [productos, setProductos] = useState<CartaProducto[]>(FALLBACK);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/prices")
      .then((r) => r.json())
      .then((data: { prices?: PriceEntry[] }) => {
        // El catálogo vivo viene de Sheets (ya filtrado a solo activos).
        const items = (data.prices ?? []).filter((p) => p.key !== "menu" && p.categoria);
        if (items.length > 0) {
          setProductos(
            items.map((p) => ({
              key: p.key,
              nombre: p.nombre,
              categoria: p.categoria,
              precioBase: p.precioBase,
              imagenUrl: p.imagenUrl || undefined,
            }))
          );
        }
      })
      .catch(() => {
        /* si falla, se queda el catálogo por defecto */
      });
  }, []);

  const categorias = useMemo(
    () =>
      CATEGORIA_LABELS.map((cat) => ({
        ...cat,
        items: productos.filter((p) => p.categoria === cat.id),
      })).filter((cat) => cat.items.length > 0),
    [productos]
  );

  function handleAdd(item: CartaProducto) {
    const precioUnitario = computeCartaPrice(item);
    addCartaItem({ key: item.key, nombre: item.nombre, precioUnitario });
    setJustAdded(item.key);
    setTimeout(() => setJustAdded(null), 1200);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-tinta-900">Carta</h1>
      <p className="mt-1 text-stone-500">Disponible todo el día, en horario comercial.</p>

      <div className="mt-8 space-y-10">
        {categorias.map((cat) => (
          <section key={cat.id}>
            <h2 className="font-display text-xl font-bold text-aji-600">{cat.nombre}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {cat.items.map((item) => {
                const precio = computeCartaPrice(item);
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.imagenUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imagenUrl}
                          alt={item.nombre}
                          className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-tinta-800">{item.nombre}</p>
                        <p className="text-sm text-stone-500">S/ {precio.toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      className="flex-shrink-0 rounded-full bg-tinta-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-aji-500 hover:shadow-cta active:scale-95"
                      onClick={() => handleAdd(item)}
                    >
                      {justAdded === item.key ? "✓" : "Agregar"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
