import Link from "next/link";
import MenuWindowBanner from "@/components/MenuWindowBanner";
import HeroMenuCard from "@/components/HeroMenuCard";

export default function HomePage() {
  return (
    <div>
      <section className="gradient-hero px-4 pb-20 pt-14 md:pb-28 md:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <MenuWindowBanner />
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-tinta-900 md:text-6xl">
              El menú del día,
              <br />
              <span className="text-aji-500">listo para pedir.</span>
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-stone-500">
              Cada día un menú diferente que rota semana a semana: entrada + segundo a tu
              elección y refresco del día incluido. Delivery a tu puerta o recojo en tienda.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/menu" className="btn-primary">
                Ver el menú de hoy
              </Link>
              <Link href="/carta" className="btn-secondary">
                Explorar la carta
              </Link>
            </div>
            <div className="mt-2 flex items-center gap-6 text-sm text-stone-400">
              <span className="flex items-center gap-2">
                <span className="text-lima-500">●</span> Lunes a viernes, 11:30 – 3:00 p.m.
              </span>
              <span className="flex items-center gap-2">
                <span className="text-lima-500">●</span> Preventa para el día siguiente
              </span>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroMenuCard />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold tracking-tight text-tinta-900">
          Así funciona
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="card p-7 transition-transform duration-200 hover:-translate-y-1">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aji-50 text-2xl">
              🍽️
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-tinta-900">Un menú nuevo cada día</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
              Rotación de 4 semanas: nunca repites la misma semana dos veces seguidas. Eliges
              tu entrada y tu segundo entre dos opciones diarias.
            </p>
          </div>
          <div className="card p-7 transition-transform duration-200 hover:-translate-y-1">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lima-50 text-2xl">
              🛵
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-tinta-900">Llega caliente, llega rápido</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
              Pide antes de las 3:00 p.m. y sigue tu pedido en tiempo real desde que sale de
              cocina hasta tu puerta. O recógelo tú mismo sin costo de envío.
            </p>
          </div>
          <div className="card p-7 transition-transform duration-200 hover:-translate-y-1">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-crema-100 text-2xl">
              🥢
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-tinta-900">¿Se te pasó la hora?</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
              La carta completa te espera todo el día: criollos, pescados, sopas y más. O
              reserva en preventa el menú del día siguiente.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
