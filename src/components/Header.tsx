"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/menu", label: "Menú del día" },
  { href: "/carta", label: "Carta" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { openModal } = useAuthModal();
  const { cantidadTotal, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-crema-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-tight text-tinta-900">
          menu<span className="text-lima-500">lima</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="font-medium text-stone-600 hover:text-aji-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={openDrawer}
            className="relative rounded-full p-2 text-stone-600 hover:bg-crema-100"
            aria-label="Ver carrito"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
              <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="21" r="1.4" />
              <circle cx="18" cy="21" r="1.4" />
            </svg>
            {cantidadTotal > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-aji-500 text-xs font-bold text-white">
                {cantidadTotal}
              </span>
            )}
          </button>

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/cuenta" className="font-medium text-stone-600 hover:text-aji-600">
                Mi cuenta
              </Link>
              <button onClick={logout} className="text-sm text-stone-400 hover:text-aji-600">
                Salir
              </button>
            </div>
          ) : (
            <button onClick={() => openModal("login")} className="btn-secondary hidden !px-4 !py-2 md:inline-flex">
              Iniciar sesión
            </button>
          )}

          <button
            className="rounded-full p-2 text-stone-600 hover:bg-crema-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menú"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-crema-200 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-stone-600"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/cuenta" className="font-medium text-stone-600" onClick={() => setMobileOpen(false)}>
                  Mi cuenta
                </Link>
                <button className="text-left text-stone-400" onClick={logout}>
                  Salir
                </button>
              </>
            ) : (
              <button
                className="text-left font-medium text-aji-600"
                onClick={() => {
                  setMobileOpen(false);
                  openModal("login");
                }}
              >
                Iniciar sesión
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
