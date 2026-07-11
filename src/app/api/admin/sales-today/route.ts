import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getSalesToday } from "@/lib/sheetsClient";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const report = await getSalesToday();
    return NextResponse.json(report);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
