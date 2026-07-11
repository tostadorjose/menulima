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

/**
 * Tarjeta protagonista del hero: el menú del día real, calculado en vivo.
 * Se renderiza recién tras montar en el navegador: la home se pre-renderiza
 * estática y este contenido depende de la hora, así que renderizarlo en el
 * servidor causaría un mismatch de hidratación.
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

      <p className="text-sm font-semibold uppercase tracking-widest text-aji-500">
        Menú del {DIA_LABEL[a.dia]}
      </p>
      <p className="mt-0.5 text-xs text-stone-400">Semana {a.semana} del ciclo</p>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Entrada a elección</p>
          <p className="mt-1 font-display text-lg font-semibold text-tinta-900">
            {a.menu.entrada[0]} <span className="font-normal text-stone-300">·</span> {a.menu.entrada[1]}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Segundo a elección</p>
          <p className="mt-1 font-display text-lg font-semibold text-tinta-900">
            {a.menu.segundo[0]} <span className="font-normal text-stone-300">·</span> {a.menu.segundo[1]}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span className="text-base">🥤</span> Incluye {a.bebida.toLowerCase()}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-5">
        <div>
          <p className="font-display text-3xl font-extrabold tracking-tight text-tinta-900">
            S/ {a.precioMenu.toFixed(0)}
          </p>
          <p className="text-xs text-stone-400">entrada + segundo + refresco</p>
        </div>
        <Link href="/menu" className="btn-primary !px-6 !py-3">
          Pedir ahora
        </Link>
      </div>
    </motion.div>
  );
}
