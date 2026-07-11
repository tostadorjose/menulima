"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/menu", label: "Menú del día" },
  { href: "/carta", label: "Carta" },
  { href: "/faq", label: "Ayuda" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { openModal } = useAuthModal();
  const { cantidadTotal, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Cierra el menú móvil al navegar a otra página.
  useEffect(() => setMobileOpen(false), [pathname]);

  function linkClass(href: string, base = "") {
    const activo = pathname === href;
    return `${base} rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      activo ? "bg-crema-100 text-aji-600" : "text-stone-600 hover:bg-crema-100 hover:text-tinta-900"
    }`;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-crema-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          className="flex-shrink-0 font-display text-2xl font-extrabold tracking-tight text-tinta-900"
          aria-label="menulima — inicio"
        >
          menu<span className="text-lima-500">lima</span>
        </Link>

        {/* Navegación de escritorio */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Carrito */}
          <button
            onClick={openDrawer}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-crema-100 hover:text-tinta-900"
            aria-label={cantidadTotal > 0 ? `Ver carrito (${cantidadTotal} producto${cantidadTotal > 1 ? "s" : ""})` : "Ver carrito (vacío)"}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2" aria-hidden="true">
              <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="21" r="1.4" />
              <circle cx="18" cy="21" r="1.4" />
            </svg>
            {cantidadTotal > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-aji-500 px-1 text-xs font-bold text-white"
                aria-hidden="true"
              >
                {cantidadTotal}
              </span>
            )}
          </button>

          {/* Sesión (escritorio) */}
          {user ? (
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/cuenta" className={linkClass("/cuenta")}>
                Mi cuenta
              </Link>
              <button
                onClick={logout}
                className="rounded-full px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-crema-100 hover:text-aji-600"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => openModal("login")}
              className="btn-primary hidden !px-5 !py-2.5 !text-sm md:inline-flex"
            >
              Iniciar sesión
            </button>
          )}

          {/* Burger móvil */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-crema-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            aria-controls="menu-movil"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2" aria-hidden="true">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="menu-movil"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-crema-200 bg-white md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Navegación móvil">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-4 py-3 font-semibold ${
                    pathname === link.href ? "bg-crema-100 text-aji-600" : "text-tinta-800 hover:bg-crema-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-crema-200 pt-3">
                {user ? (
                  <div className="flex flex-col gap-1">
                    <Link href="/cuenta" className="rounded-xl px-4 py-3 font-semibold text-tinta-800 hover:bg-crema-100">
                      Mi cuenta
                    </Link>
                    <button
                      className="rounded-xl px-4 py-3 text-left font-medium text-stone-500 hover:bg-crema-100"
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-primary w-full"
                    onClick={() => {
                      setMobileOpen(false);
                      openModal("login");
                    }}
                  >
                    Iniciar sesión
                  </button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
