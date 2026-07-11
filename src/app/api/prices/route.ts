import { NextResponse } from "next/server";
import { getPrices } from "@/lib/sheetsClient";

export async function GET() {
  try {
    const prices = await getPrices();
    return NextResponse.json({ prices });
  } catch (err) {
    return NextResponse.json({ prices: [], error: err instanceof Error ? err.message : "Error" }, { status: 200 });
  }
}
