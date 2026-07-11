import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getOrdersByStatus } from "@/lib/sheetsClient";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const orders = await getOrdersByStatus("pendiente_verificacion");
    return NextResponse.json({ orders: orders.filter((o) => o.metodoPago === "yape") });
  } catch (err) {
    return NextResponse.json({ orders: [], error: err instanceof Error ? err.message : "Error" }, { status: 200 });
  }
}
