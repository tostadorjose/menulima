import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/sheetsClient";
import type { EstadoPedido } from "@/lib/types";

/**
 * Receptor genérico de actualizaciones de estado de Rappi Cargo. La forma
 * real del payload (nombres de campos, autenticación del webhook) depende
 * del convenio de partner -- este endpoint queda listo para mapear esos
 * campos en cuanto llegue la documentación real de Rappi Cargo.
 */

// TODO: ajustar este mapeo contra los estados reales que envíe Rappi Cargo.
const STATUS_MAP: Record<string, EstadoPedido> = {
  assigned: "en_preparacion",
  picked_up: "en_camino",
  in_transit: "en_camino",
  delivered: "entregado",
  cancelled: "cancelado",
};

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  // TODO: verificar aquí la firma/autenticación del webhook una vez definida
  // por el partner (ej. header secreto, HMAC, IP allowlist).

  const orderId: string | undefined = json.external_order_id ?? json.orderId;
  const rawStatus: string | undefined = json.status ?? json.delivery_status;
  if (!orderId || !rawStatus) {
    return NextResponse.json({ error: "Faltan orderId/status en el payload" }, { status: 400 });
  }

  const estado = STATUS_MAP[rawStatus];
  if (!estado) {
    // Estado desconocido: se acepta el webhook sin romper, pero no se actualiza nada.
    return NextResponse.json({ ok: true, ignored: true });
  }

  await updateOrderStatus(orderId, estado);
  return NextResponse.json({ ok: true });
}
