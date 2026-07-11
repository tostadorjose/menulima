import type { ReactNode } from "react";

interface Seccion {
  titulo: string;
  contenido: ReactNode;
}

/**
 * Plantilla compartida de las páginas legales (políticas, privacidad,
 * términos): misma jerarquía tipográfica y espaciado en las tres.
 */
export default function PaginaLegal({
  categoria,
  titulo,
  intro,
  actualizado,
  secciones,
}: {
  categoria: string;
  titulo: string;
  intro: string;
  actualizado: string;
  secciones: Seccion[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-aji-500">{categoria}</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-tinta-900 md:text-4xl">
        {titulo}
      </h1>
      <p className="mt-2 text-sm text-stone-500">Última actualización: {actualizado}</p>
      <p className="mt-4 max-w-2xl leading-relaxed text-stone-600">{intro}</p>

      <div className="mt-10 space-y-8">
        {secciones.map((s, i) => (
          <section key={s.titulo}>
            <h2 className="font-display text-lg font-bold text-tinta-900">
              {i + 1}. {s.titulo}
            </h2>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-stone-600">{s.contenido}</div>
          </section>
        ))}
      </div>

      <p className="mt-12 rounded-2xl bg-crema-100 px-5 py-4 text-sm text-stone-600">
        ¿Tienes dudas sobre este documento? Escríbenos por WhatsApp con el botón verde de la esquina inferior y te
        respondemos en horario de tienda.
      </p>
    </div>
  );
}
