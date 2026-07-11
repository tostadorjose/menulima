"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getMenuAvailability } from "@/lib/menuAvailability";
import { getLimaTodayISO, minutesUntilWindowOpens } from "@/lib/time";
import { MENU_PRICE_DEFAULT } from "@/lib/menuData";
import { useCart } from "@/context/CartContext";

export default function MenuPage() {
  const { addMenuItem } = useCart();
  const [precioMenu, setPrecioMenu] = useState(MENU_PRICE_DEFAULT);
  const [entrada, setEntrada] = useState(0);
  const [segundo, setSegundo] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);
  // El contenido depende de la hora de Lima: se calcula recién en el
  // navegador para no chocar con el HTML pre-renderizado (hidratación).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const availability = useMemo(
    () => (mounted ? getMenuAvailability(new Date(), precioMenu) : null),
    [mounted, precioMenu]
  );

  useEffect(() => {
    fetch("/api/prices")
      .then((r) => r.json())
      .then((data: { prices?: { key: string; precioBase: number }[] }) => {
        const menuPrice = data.prices?.find((p) => p.key === "menu");
        if (menuPrice) setPrecioMenu(menuPrice.precioBase);
      })
      .catch(() => {
        /* si falla, se queda el precio por defecto */
      });
  }, []);

  function handleAdd() {
    if (!availability) return;
    addMenuItem({
      semana: availability.semana,
      dia: availability.dia,
      fechaEntrega: availability.fechaEntrega,
      entradaElegida: availability.menu.entrada[entrada],
      segundoElegido: availability.menu.segundo[segundo],
      bebida: availability.bebida,
      precioUnitario: availability.precioMenu,
    }, cantidad);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-tinta-900">Menú del día</h1>
      {availability === null ? (
        <div className="card mt-6 h-96 animate-pulse bg-white/60" />
      ) : (
        <>
      <p className="mt-1 text-stone-500">
        Semana {availability.semana} del ciclo · {availability.dia}
      </p>

      {!availability.disponibleHoy && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5"
        >
          <p className="font-semibold text-amber-800">
            {availability.fechaEntrega === getLimaTodayISO() && minutesUntilWindowOpens() > 0
              ? `El menú de hoy abre a las 11:30 a.m. (en ${minutesUntilWindowOpens()} min).`
              : "El horario de menú de hoy (11:30 a.m. – 3:00 p.m.) ya cerró o no aplica hoy."}
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Puedes reservar desde ya el menú del {availability.fechaEntrega} (preventa), o ver la
            carta disponible ahora mismo.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/carta" className="btn-secondary !ring-amber-300 !text-amber-800">
              Ver la carta
            </Link>
          </div>
        </motion.div>
      )}

      <motion.div
        layout
        className="card mt-6 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {availability.esPreventa && (
          <p className="mb-4 inline-block rounded-full bg-aji-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-aji-600">
            Preventa · entrega {availability.fechaEntrega}
          </p>
        )}

        <fieldset className="mb-6">
          <legend className="mb-2 font-semibold text-stone-700">Entrada o sopa (elige una)</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {availability.menu.entrada.map((opcion, i) => (
              <label
                key={opcion}
                className={`cursor-pointer rounded-xl border-2 p-3 text-sm transition-colors ${
                  entrada === i ? "border-aji-500 bg-aji-50" : "border-stone-200"
                }`}
              >
                <input type="radio" name="entrada" className="mr-2" checked={entrada === i} onChange={() => setEntrada(i)} />
                {opcion}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-6">
          <legend className="mb-2 font-semibold text-stone-700">Segundo (elige uno)</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {availability.menu.segundo.map((opcion, i) => (
              <label
                key={opcion}
                className={`cursor-pointer rounded-xl border-2 p-3 text-sm transition-colors ${
                  segundo === i ? "border-aji-500 bg-aji-50" : "border-stone-200"
                }`}
              >
                <input type="radio" name="segundo" className="mr-2" checked={segundo === i} onChange={() => setSegundo(i)} />
                {opcion}
              </label>
            ))}
          </div>
        </fieldset>

        <p className="text-sm text-stone-500">
          Incluye <span className="font-semibold">{availability.bebida}</span> como refresco del día.
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="h-8 w-8 rounded-full bg-stone-100 font-bold hover:bg-stone-200"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            >
              −
            </button>
            <span className="w-6 text-center">{cantidad}</span>
            <button
              className="h-8 w-8 rounded-full bg-stone-100 font-bold hover:bg-stone-200"
              onClick={() => setCantidad((c) => c + 1)}
            >
              +
            </button>
          </div>
          <span className="text-2xl font-bold text-aji-600">S/ {availability.precioMenu.toFixed(2)}</span>
        </div>

        <button className="btn-primary mt-6 w-full" onClick={handleAdd}>
          {added ? "¡Agregado! 🎉" : availability.esPreventa ? "Reservar para preventa" : "Agregar al carrito"}
        </button>
      </motion.div>
        </>
      )}
    </div>
  );
}
