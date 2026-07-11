"use client";

import { useEffect, useMemo, useState } from "react";
import { ALL_CARTA_ITEMS } from "@/lib/cartaData";
import { MENU_PRICE_DEFAULT } from "@/lib/menuData";

interface Row {
  key: string;
  nombre: string;
  precioBase: number;
}

export default function PriceEditor() {
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/prices")
      .then((r) => r.json())
      .then((data: { prices?: { key: string; precioBase: number }[] }) => {
        const map: Record<string, number> = {};
        for (const p of data.prices ?? []) map[p.key] = p.precioBase;
        setOverrides(map);
      });
  }, []);

  const rows: Row[] = useMemo(() => {
    const base: Row[] = [
      { key: "menu", nombre: "Menú del día", precioBase: overrides.menu ?? MENU_PRICE_DEFAULT },
      ...ALL_CARTA_ITEMS.map((item) => ({
        key: item.key,
        nombre: item.plato,
        precioBase: overrides[item.key] ?? item.precioBase,
      })),
    ];
    return base;
  }, [overrides]);

  async function handleSave(key: string) {
    const value = Number(drafts[key]);
    if (Number.isNaN(value) || value <= 0) return;
    setSaving(key);
    try {
      await fetch("/api/admin/prices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, precioBase: value }),
      });
      setOverrides((prev) => ({ ...prev, [key]: value }));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 px-4 py-3">
          <span className="text-sm text-stone-700">{row.nombre}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-400">S/</span>
            <input
              type="number"
              step="0.5"
              className="w-24 rounded-lg border border-stone-200 px-2 py-1 text-right"
              defaultValue={row.precioBase}
              onChange={(e) => setDrafts((prev) => ({ ...prev, [row.key]: e.target.value }))}
            />
            <button
              className="rounded-lg bg-aji-500 px-3 py-1 text-sm font-semibold text-white hover:bg-aji-600 disabled:opacity-50"
              disabled={saving === row.key || drafts[row.key] === undefined}
              onClick={() => handleSave(row.key)}
            >
              {saving === row.key ? "..." : "Guardar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
