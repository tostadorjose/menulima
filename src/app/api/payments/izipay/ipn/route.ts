import { NextResponse } from "next/server";
import { parseIzipayIpnAnswer, verifyIzipayIpnSignature } from "@/lib/izipay";
import { confirmOrderPaid } from "@/lib/orderFulfillment";

/**
 * IPN (server-to-server) de Izipay. Lyra V4 envía `kr-answer` + `kr-hash` ya
 * sea como form-urlencoded o JSON según la configuración del comercio;
 * aceptamos ambos formatos. Verifica el nombre exacto de estos campos contra
 * la documentación vigente una vez la cuenta esté activa.
 */
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  let krAnswer: string | null = null;
  let krHash: string | null = null;
  let krHashKey: string | undefined;

  if (contentType.includes("application/json")) {
    const json = await req.json().catch(() => ({}));
    krAnswer = json["kr-answer"] ?? null;
    krHash = json["kr-hash"] ?? null;
    krHashKey = json["kr-hash-key"] ?? undefined;
  } else {
    const form = await req.formData().catch(() => null);
    krAnswer = (form?.get("kr-answer") as string) ?? null;
    krHash = (form?.get("kr-hash") as string) ?? null;
    krHashKey = (form?.get("kr-hash-key") as string) ?? undefined;
  }

  if (!krAnswer || !krHash) {
    return NextResponse.json({ error: "Payload de IPN incompleto" }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = verifyIzipayIpnSignature(krAnswer, krHash, krHashKey);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
  if (!valid) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 403 });
  }

  const answer = parseIzipayIpnAnswer(krAnswer);
  const orderId = answer.orderDetails?.orderId;
  if (!orderId) {
    return NextResponse.json({ error: "orderId ausente en la respuesta de Izipay" }, { status: 400 });
  }

  if (answer.orderStatus !== "PAID") {
    // Otros estados (UNPAID, RUNNING, etc.) no requieren acción aquí.
    return NextResponse.json({ ok: true });
  }

  await confirmOrderPaid(orderId);
  return NextResponse.json({ ok: true });
}
