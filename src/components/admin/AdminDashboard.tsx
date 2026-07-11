"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SalesReport from "./SalesReport";
import ProductManager from "./ProductManager";
import OrdersToVerify from "./OrdersToVerify";

type Tab = "ventas" | "productos" | "yape";

export default function AdminDashboard({ adminUser }: { adminUser: string }) {
  const [tab, setTab] = useState<Tab>("ventas");
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "ventas", label: "Ventas" },
    { id: "productos", label: "Productos" },
    { id: "yape", label: "Pedidos por verificar (Yape)" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-stone-800">Backoffice — {adminUser}</h1>
        <button className="text-sm text-stone-400 hover:text-aji-600" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-max gap-2 border-b border-stone-200" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.id ? "border-aji-500 text-aji-600" : "border-transparent text-stone-500 hover:text-tinta-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {tab === "ventas" && <SalesReport />}
        {tab === "productos" && <ProductManager />}
        {tab === "yape" && <OrdersToVerify />}
      </div>
    </div>
  );
}
