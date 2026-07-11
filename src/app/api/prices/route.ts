import { NextResponse } from "next/server";
import { getPrices } from "@/lib/sheetsClient";

/** Catálogo público: solo productos activos (la carta no muestra desactivados). */
export async function GET() {
  try {
    const prices = (await getPrices()).filter((p) => p.activo !== false);
    return NextResponse.json({ prices });
  } catch (err) {
    return NextResponse.json({ prices: [], error: err instanceof Error ? err.message : "Error" }, { status: 200 });
  }
}
