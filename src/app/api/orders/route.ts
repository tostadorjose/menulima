import { NextResponse } from "next/server";
import { getOrdersByEmail } from "@/lib/sheetsClient";

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email requerido" }, { status: 400 });
  }
  try {
    const orders = await getOrdersByEmail(email);
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ orders: [], error: err instanceof Error ? err.message : "Error" }, { status: 200 });
  }
}
