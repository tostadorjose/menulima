import { NextResponse } from "next/server";
import { z } from "zod";
import { createIzipayPayment, getIzipayClientConfig, izipayConfigured } from "@/lib/izipay";
import { getOrder } from "@/lib/sheetsClient";

const bodySchema = z.object({ orderId: z.string().min(1) });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
  }

  if (!izipayConfigured) {
    return NextResponse.json(
      { error: "Izipay aún no está configurado en este entorno (faltan credenciales de producción)." },
      { status: 200 }
    );
  }

  const order = await getOrder(parsed.data.orderId);
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  try {
    const { formToken } = await createIzipayPayment({
      orderId: order.orderId,
      amountSoles: order.total,
      customerEmail: order.emailCliente,
    });
    const { publicKey } = getIzipayClientConfig();
    return NextResponse.json({ formToken, publicKey });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo iniciar el pago." },
      { status: 200 }
    );
  }
}
