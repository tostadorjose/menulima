import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { confirmOrderPaid } from "@/lib/orderFulfillment";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    await confirmOrderPaid(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
