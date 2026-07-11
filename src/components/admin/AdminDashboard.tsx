"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SalesReport from "./SalesReport";
import PriceEditor from "./PriceEditor";
import OrdersToVerify from "./OrdersToVerify";

type Tab = "ventas" | "precios" | "yape";

export default function AdminDashboard({ adminUser }: { adminUser: string }) {
  const [tab, setTab] = useState<Tab>("ventas");
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "ventas", label: "Ventas de hoy" },
    { id: "precios", label: "Precios" },
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

      <div className="mt-6 flex gap-2 border-b border-stone-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              tab === t.id ? "border-aji-500 text-aji-600" : "border-transparent text-stone-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "ventas" && <SalesReport />}
        {tab === "precios" && <PriceEditor />}
        {tab === "yape" && <OrdersToVerify />}
      </div>
    </div>
  );
}
