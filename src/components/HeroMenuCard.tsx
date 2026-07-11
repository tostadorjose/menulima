"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getMenuAvailability } from "@/lib/menuAvailability";

const DIA_LABEL: Record<string, string> = {
  Lunes: "lunes",
  Martes: "martes",
  Miercoles: "miércoles",
  Jueves: "jueves",
  Viernes: "viernes",
};

/** Chip de una opción del menú (entrada o segundo). */
function Opcion({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-crema-100 px-4 py-2 font-display text-sm font-semibold text-tinta-900 ring-1 ring-crema-200">
      {children}
    </span>
  );
}

/**
 * Tarjeta protagonista del hero: el menú del día real, calculado en vivo.
 * Se renderiza recién tras montar en el navegador: la home se pre-renderiza
 * estática y este contenido depende de la hora, así que renderizarlo en el
 * servidor causaría un mismatch de hidratación.
 *
 * Nota de negocio: la semana del ciclo (1-4) es control interno y NO se
 * muestra al cliente; el sabor del refresco tampoco (solo "refresco del día").
 */
export default function HeroMenuCard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="card h-[380px] w-full max-w-md animate-pulse bg-white/60" />;
  }

  const a = getMenuAvailability();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 160, delay: 0.15 }}
      className="card relative w-full max-w-md p-7"
    >
      <div className="absolute -top-3 right-6">
        <span
          className={`chip ${
            a.disponibleHoy ? "bg-lima-100 text-lima-700" : "bg-crema-100 text-tinta-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${a.disponibleHoy ? "animate-pulse-slow bg-lima-500" : "bg-aji-400"}`}
          />
          {a.disponibleHoy ? "Disponible ahora" : "Preventa abierta"}
        </span>
      </div>

      <p className="font-display text-xl font-extrabold tracking-tight text-tinta-900">
        Menú del <span className="text-aji-500">{DIA_LABEL[a.dia]}</span>
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Entrada — elige una</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Opcion>{a.menu.entrada[0]}</Opcion>
            <span className="text-xs font-bold uppercase text-stone-400" aria-hidden="true">
              o
            </span>
            <Opcion>{a.menu.entrada[1]}</Opcion>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Segundo — elige uno</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Opcion>{a.menu.segundo[0]}</Opcion>
            <span className="text-xs font-bold uppercase text-stone-400" aria-hidden="true">
              o
            </span>
            <Opcion>{a.menu.segundo[1]}</Opcion>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
          <span className="text-base" aria-hidden="true">🥤</span> Incluye refresco del día
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-5">
        <div>
          <p className="font-display text-3xl font-extrabold tracking-tight text-tinta-900">
            S/ {a.precioMenu.toFixed(0)}
          </p>
          <p className="text-xs text-stone-500">todo incluido</p>
        </div>
        <Link href="/menu" className="btn-primary !px-6 !py-3">
          Pedir ahora
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <p className="mt-4 text-center text-xs text-stone-500">
        🍳 Preparado el mismo día, en cocina propia
      </p>
    </motion.div>
  );
}
