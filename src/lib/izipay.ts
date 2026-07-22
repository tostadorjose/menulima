import crypto from "node:crypto";

/**
 * Cliente Izipay (Lyra / MiCuentaWeb V4). Mismo formato de API que se usa en
 * producción en mercadodecafe.com (funcional, verificado).
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

function hmacMatches_(krAnswer: string, krHash: string, key: string): boolean {
  const computed = crypto.createHmac("sha256", key).update(krAnswer).digest("hex");
  const a = Buffer.from(computed);
  const b = Buffer.from(krHash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Verifica la firma del IPN de Izipay (Lyra V4). Detalle CLAVE de Lyra: según
 * el campo `kr-hash-key` del payload, el `kr-hash` se calcula con distinta llave:
 *   - "password"     → la CONTRASEÑA de la API REST (así firma Lyra el IPN
 *                      server-to-server). Es el caso que daba FAILED_SERVER_403.
 *   - "sha256_hmac"  → la clave HMAC-SHA256 (así firma la respuesta al navegador).
 * Verificamos con la llave indicada y, por robustez ante variantes del panel,
 * aceptamos también la otra (ambas son secretos solo conocidos por comercio+Lyra).
 */
export function verifyIzipayIpnSignature(
  krAnswer: string,
  krHash: string,
  krHashKey?: string
): boolean {
  const password = process.env.IZIPAY_PASSWORD;
  const hmacKey = process.env.IZIPAY_HMAC_SHA256_KEY;
  if (!password && !hmacKey) {
    throw new Error("Falta IZIPAY_PASSWORD y/o IZIPAY_HMAC_SHA256_KEY para verificar el IPN");
  }

  // Orden de preferencia según kr-hash-key; si no viene, probamos ambas.
  const candidatas =
    krHashKey === "password"
      ? [password, hmacKey]
      : krHashKey === "sha256_hmac"
        ? [hmacKey, password]
        : [password, hmacKey];

  return candidatas.some((k) => k && hmacMatches_(krAnswer, krHash, k));
}

export interface IzipayIpnAnswer {
  orderStatus: string; // ej. "PAID", "UNPAID", "RUNNING"
  orderDetails?: { orderId?: string };
  transactions?: unknown[];
}

export function parseIzipayIpnAnswer(krAnswer: string): IzipayIpnAnswer {
  return JSON.parse(krAnswer) as IzipayIpnAnswer;
}
