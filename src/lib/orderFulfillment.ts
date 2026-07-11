import { requestRappiCargoDelivery } from "./rappiCargo";
import { getOrder, updateOrderStatus } from "./sheetsClient";

/**
 * Punto único que se dispara cuando un pedido pasa a "pagado" (desde el IPN
 * de Izipay o la verificación manual de Yape): marca el pedido pagado y, si
 * es delivery, solicita el motorizado a Rappi Cargo. Si Rappi Cargo falla
 * (ej. credenciales aún no configuradas), el pedido igual queda pagado para
 * gestión manual -- nunca bloquea la confirmación del pago.
 */
export async function confirmOrderPaid(orderId: string): Promise<void> {
  await updateOrderStatus(orderId, "pagado");

  const order = await getOrder(orderId);
  if (!order) return;

  if (order.canal !== "delivery") {
    await updateOrderStatus(orderId, "en_preparacion");
    return;
  }

  try {
    const { rappiCargoId } = await requestRappiCargoDelivery({
      orderId,
      destino: {
        nombre: order.nombre,
        telefono: order.telefono,
        direccion: order.direccion ?? "",
        referencia: order.referencia,
      },
      paquete: { descripcion: `Pedido menulima #${orderId}`, valorDeclarado: order.total },
    });
    await updateOrderStatus(orderId, "en_preparacion", { rappiCargoId });
  } catch (err) {
    console.error("Rappi Cargo request falló:", err);
    await updateOrderStatus(orderId, "en_preparacion");
  }
}
