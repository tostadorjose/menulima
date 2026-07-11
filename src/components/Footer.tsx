import Link from "next/link";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

const EXPLORA = [
  { href: "/menu", label: "Menú del día" },
  { href: "/carta", label: "Carta" },
  { href: "/cuenta", label: "Mi cuenta" },
];

const AYUDA_LEGAL = [
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/politicas", label: "Políticas de la tienda" },
  { href: "/privacidad", label: "Política de privacidad" },
  { href: "/terminos", label: "Términos y condiciones" },
];

function IconoRed({ nombre }: { nombre: "instagram" | "facebook" | "tiktok" }) {
  const paths: Record<string, string> = {
    instagram:
      "M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.26.07 1.64.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.26.06-1.64.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.52 0-4.76.07-1.08.05-1.53.23-1.89.37-.44.17-.76.38-1.1.71-.33.34-.54.66-.71 1.1-.14.36-.32.81-.37 1.9C3.1 8.47 3.1 8.84 3.1 12s0 3.52.07 4.76c.05 1.08.23 1.53.37 1.89.17.44.38.76.71 1.1.34.33.66.54 1.1.71.36.14.81.32 1.9.37 1.23.06 1.6.07 4.75.07s3.52 0 4.76-.07c1.08-.05 1.53-.23 1.89-.37.44-.17.76-.38 1.1-.71.33-.34.54-.66.71-1.1.14-.36.32-.81.37-1.9.06-1.23.07-1.6.07-4.75s0-3.52-.07-4.76c-.05-1.08-.23-1.53-.37-1.89a2.9 2.9 0 0 0-.71-1.1 2.9 2.9 0 0 0-1.1-.71c-.36-.14-.81-.32-1.9-.37-1.23-.06-1.6-.07-4.75-.07Zm0 3.06a4.94 4.94 0 1 1 0 9.88 4.94 4.94 0 0 1 0-9.88Zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28Zm5.14-2.98a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z",
    facebook:
      "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z",
    tiktok:
      "M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12V9.77a5.76 5.76 0 0 0-.78-.05 5.68 5.68 0 1 0 5.68 5.68V9.29a7.35 7.35 0 0 0 4.3 1.38V7.58a4.34 4.34 0 0 1-3.24-1.76Z",
  };
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d={paths[nombre]} />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-crema-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div>
            <p className="font-display text-xl font-extrabold tracking-tight text-tinta-900">
              menu<span className="text-lima-500">lima</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-500">
              El menú del día y platos a la carta, con delivery y recojo en tienda.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href="#"
                aria-label="Instagram de menulima"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-crema-100 text-stone-500 transition-colors hover:bg-aji-50 hover:text-aji-600"
              >
                <IconoRed nombre="instagram" />
              </a>
              <a
                href="#"
                aria-label="Facebook de menulima"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-crema-100 text-stone-500 transition-colors hover:bg-aji-50 hover:text-aji-600"
              >
                <IconoRed nombre="facebook" />
              </a>
              <a
                href="#"
                aria-label="TikTok de menulima"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-crema-100 text-stone-500 transition-colors hover:bg-aji-50 hover:text-aji-600"
              >
                <IconoRed nombre="tiktok" />
              </a>
            </div>
          </div>

          {/* Explora */}
          <nav aria-label="Explora">
            <p className="text-sm font-bold uppercase tracking-wider text-tinta-900">Explora</p>
            <ul className="mt-3 space-y-2 text-sm">
              {EXPLORA.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-stone-500 transition-colors hover:text-aji-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Ayuda y legal */}
          <nav aria-label="Ayuda y legal">
            <p className="text-sm font-bold uppercase tracking-wider text-tinta-900">Ayuda y legal</p>
            <ul className="mt-3 space-y-2 text-sm">
              {AYUDA_LEGAL.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-stone-500 transition-colors hover:text-aji-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-tinta-900">Contacto</p>
            <ul className="mt-3 space-y-2 text-sm text-stone-500">
              {WHATSAPP && (
                <li>
                  <a
                    href={`https://wa.me/${WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-aji-600"
                  >
                    WhatsApp: +{WHATSAPP}
                  </a>
                </li>
              )}
              <li>Lima, Perú</li>
              <li>
                Menú del día: lun–vie,
                <br />
                11:30 a.m. – 3:00 p.m.
              </li>
              <li>Carta: todo el día</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-crema-200 pt-6 text-xs text-stone-500">
          <p>
            menulima es una tienda aliada de <span className="font-semibold text-stone-600">Nakachi Restaurantes</span>,
            líderes en comida japonesa en el Perú.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} menulima.pe — Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
