"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartCartaItem, CartItem, CartMenuItem } from "@/lib/types";

const STORAGE_KEY = "menulima_cart";

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  subtotal: number;
  cantidadTotal: number;
  addMenuItem: (item: Omit<CartMenuItem, "id" | "kind" | "cantidad">, cantidad?: number) => void;
  addCartaItem: (item: Omit<CartCartaItem, "id" | "kind" | "cantidad">, cantidad?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, cantidad: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        /* carrito corrupto, se ignora */
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addMenuItem(item: Omit<CartMenuItem, "id" | "kind" | "cantidad">, cantidad = 1) {
    setItems((prev) => [...prev, { ...item, id: genId(), kind: "menu", cantidad }]);
    setIsOpen(true);
  }

  function addCartaItem(item: Omit<CartCartaItem, "id" | "kind" | "cantidad">, cantidad = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.kind === "carta" && i.key === item.key);
      if (existing) {
        return prev.map((i) => (i.id === existing.id ? { ...i, cantidad: i.cantidad + cantidad } : i));
      }
      return [...prev, { ...item, id: genId(), kind: "carta", cantidad }];
    });
    setIsOpen(true);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id: string, cantidad: number) {
    if (cantidad <= 0) return removeItem(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad } : i)));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.precioUnitario * i.cantidad, 0),
    [items]
  );
  const cantidadTotal = useMemo(() => items.reduce((sum, i) => sum + i.cantidad, 0), [items]);

  const value: CartContextValue = {
    items,
    isOpen,
    subtotal,
    cantidadTotal,
    addMenuItem,
    addCartaItem,
    removeItem,
    updateQty,
    clearCart,
    openDrawer: () => setIsOpen(true),
    closeDrawer: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
