import { NextResponse } from "next/server";
import { z } from "zod";
import { updateOrderStatus } from "@/lib/sheetsClient";

const bodySchema = z.object({
  orderId: z.string().min(1),
  operationNumber: z.string().min(1),
});

/**
 * MVP sin convenio Yape Empresas: el cliente reporta el N° de operación y el
 * pedido queda "pendiente_verificacion" hasta que un admin lo confirme
 * manualmente en el backoffice (ver /api/admin/orders/[id]/verify-yape).
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    await updateOrderStatus(parsed.data.orderId, "pendiente_verificacion", {
      operacionYape: parsed.data.operationNumber,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo registrar el pago." },
      { status: 500 }
    );
  }
}
