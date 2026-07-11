import { NextResponse } from "next/server";
import { getOrder } from "@/lib/sheetsClient";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const order = await getOrder(params.id);
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ order: null, error: err instanceof Error ? err.message : "Error" }, { status: 200 });
  }
}
