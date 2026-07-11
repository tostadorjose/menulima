"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/lib/types";

function itemLabel(item: CartItem): string {
  if (item.kind === "menu") {
    return `Menú ${item.dia} — ${item.entradaElegida} + ${item.segundoElegido}`;
  }
  return item.nombre;
}

function itemSubLabel(item: CartItem): string | null {
  if (item.kind === "menu") {
    const fecha = item.fechaEntrega;
    return `${item.bebida} · entrega ${fecha}`;
  }
  return null;
}

export default function CartDrawer() {
  const { items, isOpen, subtotal, closeDrawer, removeItem, updateQty } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-stone-900/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="font-display text-lg font-bold text-stone-800">Tu pedido</h2>
              <button
                onClick={closeDrawer}
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
                aria-label="Cerrar carrito"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <p className="mt-10 text-center text-stone-400">Tu carrito está vacío.</p>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.id} className="rounded-xl border border-stone-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-stone-800">{itemLabel(item)}</p>
                          {itemSubLabel(item) && (
                            <p className="text-sm text-stone-500">{itemSubLabel(item)}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            className="h-7 w-7 rounded-full bg-stone-100 font-bold hover:bg-stone-200"
                            onClick={() => updateQty(item.id, item.cantidad - 1)}
                          >
                            −
                          </button>
                          <span className="w-6 text-center">{item.cantidad}</span>
                          <button
                            className="h-7 w-7 rounded-full bg-stone-100 font-bold hover:bg-stone-200"
                            onClick={() => updateQty(item.id, item.cantidad + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold text-aji-600">
                          S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-stone-100 px-6 py-4">
              <div className="mb-4 flex items-center justify-between text-lg font-bold text-stone-800">
                <span>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className={`btn-primary w-full ${items.length === 0 ? "pointer-events-none opacity-50" : ""}`}
                onClick={closeDrawer}
              >
                Ir a pagar
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
