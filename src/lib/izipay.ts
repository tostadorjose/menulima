import crypto from "node:crypto";

/**
 * Cliente Izipay (Lyra / MiCuentaWeb V4). Mismo formato de API que se usa en
 * producción en mercadodecafe.com (funcional, verificado). Aquí no hay
 * credenciales de menulima.pe todavía -- solo falta definir
 * IZIPAY_SHOP_ID/USERNAME/PASSWORD/PUBLIC_KEY/HMAC_SHA256_KEY en Netlify.
 */

export const izipayConfigured = Boolean(
  process.env.IZIPAY_SHOP_ID && process.env.IZIPAY_USERNAME && process.env.IZIPAY_PASSWORD
);

function getConfig() {
  const shopId = process.env.IZIPAY_SHOP_ID;
  const username = process.env.IZIPAY_USERNAME;
  const password = process.env.IZIPAY_PASSWORD;
  const baseUrl = process.env.IZIPAY_API_BASE_URL || "https://api.micuentaweb.pe";
  if (!shopId || !username || !password) {
    throw new Error(
      "Izipay no configurado: define IZIPAY_SHOP_ID, IZIPAY_USERNAME e IZIPAY_PASSWORD en las env vars de Netlify."
    );
  }
  return { shopId, username, password, baseUrl };
}

export interface IzipayCreatePaymentParams {
  orderId: string;
  amountSoles: number;
  customerEmail: string;
}

export interface IzipayCreatePaymentResult {
  formToken: string;
  raw: unknown;
}

/** Crea el formToken (POST /api-payment/V4/Charge/CreatePayment) para renderizar el formulario embebido. */
export async function createIzipayPayment(
  params: IzipayCreatePaymentParams
): Promise<IzipayCreatePaymentResult> {
  const { shopId, username, password, baseUrl } = getConfig();
  const amountCents = Math.round(params.amountSoles * 100);
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  const res = await fetch(`${baseUrl}/api-payment/V4/Charge/CreatePayment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountCents,
      currency: "PEN",
      orderId: params.orderId,
      customer: { email: params.customerEmail },
    }),
  });

  const json = await res.json();
  if (!res.ok || json.status !== "SUCCESS") {
    throw new Error(`Izipay CreatePayment falló: ${JSON.stringify(json)}`);
  }

  return { formToken: json.answer.formToken, raw: json };
}

/** shopId + IZIPAY_PUBLIC_KEY que el cliente necesita para inicializar KR (el formulario embebido). */
export function getIzipayClientConfig() {
  return {
    shopId: process.env.IZIPAY_SHOP_ID ?? "",
    publicKey: process.env.IZIPAY_PUBLIC_KEY ?? "",
  };
}

/**
 * Verifica la firma HMAC-SHA256 del IPN de Izipay: el payload trae
 * `kr-answer` (JSON string) y `kr-hash` (hex). NOTA: verifica el nombre
 * exacto de estos campos contra la documentación V4 vigente cuando la
 * cuenta esté activa -- Lyra ha usado variantes de este esquema entre
 * versiones de su API.
 */
export function verifyIzipayIpnSignature(krAnswer: string, krHash: string): boolean {
  const key = process.env.IZIPAY_HMAC_SHA256_KEY;
  if (!key) {
    throw new Error("IZIPAY_HMAC_SHA256_KEY no configurado");
  }
  const computed = crypto.createHmac("sha256", key).update(krAnswer).digest("hex");
  const a = Buffer.from(computed);
  const b = Buffer.from(krHash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export interface IzipayIpnAnswer {
  orderStatus: string; // ej. "PAID", "UNPAID", "RUNNING"
  orderDetails?: { orderId?: string };
  transactions?: unknown[];
}

export function parseIzipayIpnAnswer(krAnswer: string): IzipayIpnAnswer {
  return JSON.parse(krAnswer) as IzipayIpnAnswer;
}
