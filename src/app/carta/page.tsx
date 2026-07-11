"use client";

import { useEffect, useMemo, useState } from "react";
import { CARTA_CATEGORIAS, computeCartaPrice } from "@/lib/cartaData";
import { useCart } from "@/context/CartContext";
import type { CartaItem } from "@/lib/types";

export default function CartaPage() {
  const { addCartaItem } = useCart();
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/prices")
      .then((r) => r.json())
      .then((data: { prices?: { key: string; precioBase: number }[] }) => {
        const map: Record<string, number> = {};
        for (const p of data.prices ?? []) map[p.key] = p.precioBase;
        setPriceOverrides(map);
      })
      .catch(() => {
        /* si falla, se usan los precios base por defecto */
      });
  }, []);

  const categorias = useMemo(
    () =>
      CARTA_CATEGORIAS.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({
          ...item,
          precioBase: priceOverrides[item.key] ?? item.precioBase,
        })),
      })),
    [priceOverrides]
  );

  function handleAdd(item: CartaItem) {
    const precioUnitario = computeCartaPrice(item);
    addCartaItem({ key: item.key, nombre: item.plato, precioUnitario });
    setJustAdded(item.key);
    setTimeout(() => setJustAdded(null), 1200);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold text-stone-800">Carta</h1>
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
                    className="flex items-center justify-between rounded-xl border border-stone-100 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <p className="font-medium text-stone-800">{item.plato}</p>
                      <p className="text-sm text-stone-500">S/ {precio.toFixed(2)}</p>
                    </div>
                    <button
                      className="rounded-full bg-tinta-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-aji-500 hover:shadow-cta active:scale-95"
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
