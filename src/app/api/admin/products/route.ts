import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminGuard";
import { deleteProduct, saveProduct } from "@/lib/sheetsClient";

const CATEGORIAS_VALIDAS = [
  "comida_criolla_carnes",
  "pescados_mariscos",
  "sopas",
  "guarniciones",
  "bebidas",
] as const;

const saveSchema = z.object({
  key: z.string().optional(),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  categoria: z.enum(CATEGORIAS_VALIDAS),
  precioBase: z.number().positive("El precio debe ser mayor a 0"),
  activo: z.boolean(),
  imagenUrl: z.string().url("La imagen debe ser una URL válida").or(z.literal("")).optional(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = saveSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  try {
    const { key } = await saveProduct(parsed.data);
    return NextResponse.json({ ok: true, key });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const key = new URL(req.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Falta el parámetro key" }, { status: 400 });
  if (key === "menu") {
    return NextResponse.json({ error: "El menú del día no se puede eliminar." }, { status: 400 });
  }

  try {
    await deleteProduct(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
