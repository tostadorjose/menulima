import type { Metadata } from "next";
import Link from "next/link";
import FaqList from "@/components/FaqList";

export const metadata: Metadata = {
  title: "Preguntas frecuentes — menulima",
  description:
    "Resuelve tus dudas sobre cómo comprar, pagar con Yape o tarjeta, horarios del menú del día, delivery, preventa y reembolsos en menulima.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-aji-500">Ayuda</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-tinta-900 md:text-4xl">
        Preguntas frecuentes
      </h1>
      <p className="mt-2 max-w-xl text-stone-500">
        Todo lo que necesitas saber para pedir sin complicaciones. ¿No encuentras tu respuesta? Escríbenos por
        WhatsApp con el botón verde de abajo.
      </p>

      <div className="mt-8">
        <FaqList />
      </div>

      <div className="card mt-10 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-lg font-bold text-tinta-900">¿Listo para pedir?</p>
          <p className="text-sm text-stone-500">El menú de hoy te está esperando.</p>
        </div>
        <Link href="/menu" className="btn-primary flex-shrink-0">
          Ver el menú de hoy
        </Link>
      </div>
    </div>
  );
}
