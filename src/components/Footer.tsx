import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-crema-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-xl font-extrabold tracking-tight text-tinta-900">
              menu<span className="text-lima-500">lima</span>
            </p>
            <p className="mt-2 max-w-xs text-sm text-stone-500">
              El menú del día y platos a la carta, con delivery y recojo en tienda.
            </p>
          </div>

          <div>
            <p className="font-semibold text-stone-700">Navegación</p>
            <ul className="mt-2 space-y-1 text-sm text-stone-500">
              <li><Link href="/menu" className="hover:text-aji-600">Menú del día</Link></li>
              <li><Link href="/carta" className="hover:text-aji-600">Carta</Link></li>
              <li><Link href="/cuenta" className="hover:text-aji-600">Mi cuenta</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-stone-700">Síguenos</p>
            <div className="mt-2 flex gap-3">
              <a href="#" aria-label="Instagram" className="text-stone-400 hover:text-aji-600">Instagram</a>
              <a href="#" aria-label="Facebook" className="text-stone-400 hover:text-aji-600">Facebook</a>
              <a href="#" aria-label="TikTok" className="text-stone-400 hover:text-aji-600">TikTok</a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-crema-200 pt-6 text-xs text-stone-400">
          <p>
            menulima es una tienda aliada de <span className="font-semibold text-stone-500">Nakachi Restaurantes</span>,
            líderes en comida japonesa en el Perú.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} menulima.pe — Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
