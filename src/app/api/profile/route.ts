import { NextResponse } from "next/server";
import { z } from "zod";
import { getProfile, saveProfile } from "@/lib/sheetsClient";

const bodySchema = z.object({
  email: z.string().email(),
  nombre: z.string().optional().default(""),
  telefono: z.string().optional().default(""),
  direccionesJson: z.string().optional().default("[]"),
  datosFacturacionJson: z.string().optional().default("{}"),
});

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email requerido" }, { status: 400 });
  try {
    const profile = await getProfile(email);
    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json({ profile: null, error: err instanceof Error ? err.message : "Error" }, { status: 200 });
  }
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  try {
    await saveProfile(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
