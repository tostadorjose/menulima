/**
 * Cliente de logística para Rappi Cargo (https://cargo.rappi.com.pe/home).
 * Rappi Cargo no expone una API pública de autoservicio: el endpoint,
 * autenticación y forma exacta del payload dependen del convenio de partner
 * que aún no existe. Este módulo queda aislado y con la forma estándar de
 * una API de last-mile (origen/destino/paquete + Bearer token) para poder
 * ajustarlo rápido en cuanto llegue la documentación real -- todo lo demás
 * del checkout (pago, creación de pedido) NO depende de que esto funcione.
 */

export const rappiCargoConfigured = Boolean(
  process.env.RAPPI_CARGO_BASE_URL && process.env.RAPPI_CARGO_API_KEY
);

export interface RappiCargoOrigen {
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
}

export interface RappiCargoDestino {
  nombre: string;
  telefono: string;
  direccion: string;
  referencia?: string;
  lat?: number;
  lng?: number;
}

export interface RappiCargoPaquete {
  descripcion: string;
  valorDeclarado: number;
}

export function getLocalOrigen(): RappiCargoOrigen {
  return {
    nombre: process.env.LOCAL_ORIGEN_NOMBRE || "menulima",
    direccion: process.env.LOCAL_ORIGEN_DIRECCION || "",
    lat: Number(process.env.LOCAL_ORIGEN_LAT || 0),
    lng: Number(process.env.LOCAL_ORIGEN_LNG || 0),
  };
}

export interface RequestRappiCargoParams {
  orderId: string;
  destino: RappiCargoDestino;
  paquete: RappiCargoPaquete;
}

export interface RequestRappiCargoResult {
  rappiCargoId: string;
  raw: unknown;
}

/**
 * Solicita un motorizado. Se dispara automáticamente al confirmarse el pago
 * de un pedido canal=delivery (ver api/payments/izipay/ipn y
 * api/admin/orders/[id]/verify-yape). El request/response se loguea siempre
 * en la pestaña RappiCargoLog vía sheetsClient, incluso si falla.
 */
export async function requestRappiCargoDelivery(
  params: RequestRappiCargoParams
): Promise<RequestRappiCargoResult> {
  const baseUrl = process.env.RAPPI_CARGO_BASE_URL;
  const apiKey = process.env.RAPPI_CARGO_API_KEY;
  const clientId = process.env.RAPPI_CARGO_CLIENT_ID;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Rappi Cargo no configurado: define RAPPI_CARGO_BASE_URL y RAPPI_CARGO_API_KEY. " +
        "Consigue estas credenciales a través del convenio de partner de Rappi Cargo " +
        "(https://cargo.rappi.com.pe/home) y ajusta el endpoint/payload en este archivo " +
        "según la documentación que te entreguen."
    );
  }

  const payload = {
    external_order_id: params.orderId,
    client_id: clientId,
    pickup: getLocalOrigen(),
    dropoff: params.destino,
    package: params.paquete,
  };

  // TODO: confirmar el path exacto del endpoint con la documentación de partner.
  const res = await fetch(`${baseUrl}/v1/deliveries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Rappi Cargo request falló (${res.status}): ${JSON.stringify(json)}`);
  }

  // TODO: el nombre exacto del campo de id de envío depende de la respuesta real de Rappi Cargo.
  const rappiCargoId = json.id ?? json.delivery_id ?? json.tracking_id ?? "unknown";
  return { rappiCargoId: String(rappiCargoId), raw: json };
}
