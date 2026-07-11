"use client";

import { useEffect, useState } from "react";
import {
  getMenuDayKey,
  isMenuWindowOpen,
  minutesUntilWindowCloses,
  minutesUntilWindowOpens,
} from "@/lib/time";

/**
 * Countdown en vivo, solo para UX (se calcula en el navegador del cliente).
 * La validación que realmente decide si se puede comprar vive en el
 * servidor (ver /api/checkout/create-order), no aquí.
 */
export default function MenuWindowBanner() {
  const [, forceTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => forceTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // El contenido depende de la hora: no se renderiza en el HTML estático
  // del servidor para evitar mismatch de hidratación.
  if (!mounted) {
    return <div className="h-9 w-64 animate-pulse rounded-full bg-stone-100" />;
  }

  const now = new Date();
  const diaHoy = getMenuDayKey(now);
  const abierto = isMenuWindowOpen(now);

  if (diaHoy && abierto) {
    const mins = minutesUntilWindowCloses(now);
    return (
      <div className="flex items-center gap-2 rounded-full bg-lima-100 px-4 py-2 text-sm font-semibold text-lima-700">
        <span className="h-2 w-2 animate-pulse-slow rounded-full bg-lima-500" />
        Menú disponible ahora · cierra en {mins} min
      </div>
    );
  }

  if (diaHoy && !abierto) {
    const mins = minutesUntilWindowOpens(now);
    const abreHoy = mins > 0 && mins < 24 * 60;
    return (
      <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        {abreHoy ? `El menú abre en ${mins} min (11:30 a. m.)` : "El menú de hoy ya cerró (11:30 a. m. – 3:00 p. m.)"}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600">
      <span className="h-2 w-2 rounded-full bg-stone-400" />
      Hoy no hay menú (fin de semana) — puedes reservar para el próximo día hábil
    </div>
  );
}
