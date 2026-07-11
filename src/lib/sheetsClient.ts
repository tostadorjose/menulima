import type { Order, PriceEntry } from "./types";

/**
 * Cliente server-side hacia el Google Apps Script Web App (ver
 * google-apps-script/Code.gs). La URL nunca se expone al cliente: todas las
 * llamadas pasan por las API routes de Next.js.
 *
 * Si GOOGLE_SHEETS_WEBAPP_URL no está configurada (deploy aún no hecho),
 * cae a un almacén en memoria de solo-desarrollo para poder probar el flujo
 * completo localmente. Esto se anuncia siempre por consola y NO debe usarse
 * en producción (no persiste entre invocaciones serverless).
 */

const BASE_URL = process.env.GOOGLE_SHEETS_WEBAPP_URL;
const ADMIN_TOKEN = process.env.GOOGLE_SHEETS_ADMIN_TOKEN;

export const sheetsConfigured = Boolean(BASE_URL);

async function callSheets<T = any>(
  action: string,
  params: Record<string, string> = {},
  opts: { method?: "GET" | "POST"; body?: unknown; protegido?: boolean } = {}
): Promise<T> {
  if (!BASE_URL) {
    throw new Error("GOOGLE_SHEETS_WEBAPP_URL no configurada");
  }
  const url = new URL(BASE_URL);
  url.searchParams.set("action", action);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (opts.protegido) {
    if (!ADMIN_TOKEN) throw new Error("GOOGLE_SHEETS_ADMIN_TOKEN no configurado");
    url.searchParams.set("token", ADMIN_TOKEN);
  }

  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: opts.body ? { "Content-Type": "application/json" } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Apps Script respondió ${res.status}`);
  }
  const json = await res.json();
  if (json && typeof json === "object" && "error" in json && json.error) {
    throw new Error(String(json.error));
  }
  return json as T;
}

// ── Fallback de solo-desarrollo (in-memory) ────────────────────────────────

export interface ProfileEntry {
  email: string;
  nombre: string;
  telefono: string;
  direccionesJson: string;
  datosFacturacionJson: string;
}

const devOrders = new Map<string, Order>();
const devPrices = new Map<string, PriceEntry>();
const devProfiles = new Map<string, ProfileEntry>();

function warnDevFallback(action: string) {
  console.warn(
    `[sheetsClient] GOOGLE_SHEETS_WEBAPP_URL no está configurada — usando almacén EN MEMORIA de desarrollo para "${action}". Esto no persiste en producción; despliega google-apps-script/Code.gs y define GOOGLE_SHEETS_WEBAPP_URL.`
  );
}

// ── API pública ─────────────────────────────────────────────────────────

export async function getPrices(): Promise<PriceEntry[]> {
  if (!sheetsConfigured) {
    warnDevFallback("prices");
    return Array.from(devPrices.values());
  }
  const json = await callSheets<{ prices: PriceEntry[] }>("prices");
  return json.prices;
}

export async function setPrice(key: string, precioBase: number): Promise<void> {
  if (!sheetsConfigured) {
    warnDevFallback("setprice");
    const existing = devPrices.get(key);
    devPrices.set(key, { key, nombre: existing?.nombre ?? key, categoria: existing?.categoria ?? "", precioBase });
    return;
  }
  await callSheets(
    "setprice",
    { key, precio: String(precioBase) },
    { protegido: true }
  );
}

export async function createOrder(order: Order): Promise<{ orderId: string }> {
  if (!sheetsConfigured) {
    warnDevFallback("createOrder");
    devOrders.set(order.orderId, order);
    return { orderId: order.orderId };
  }
  return callSheets<{ orderId: string }>("createOrder", {}, { method: "POST", body: order });
}

export async function getOrder(orderId: string): Promise<Order | null> {
  if (!sheetsConfigured) {
    warnDevFallback("getOrder");
    return devOrders.get(orderId) ?? null;
  }
  const json = await callSheets<{ order: Order | null }>("getOrder", { orderId });
  return json.order;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  if (!sheetsConfigured) {
    warnDevFallback("getOrdersByEmail");
    return Array.from(devOrders.values()).filter((o) => o.emailCliente === email);
  }
  const json = await callSheets<{ orders: Order[] }>("getOrdersByEmail", { email });
  return json.orders;
}

export async function getOrdersByStatus(estado: Order["estado"]): Promise<Order[]> {
  if (!sheetsConfigured) {
    warnDevFallback("getOrdersByStatus");
    return Array.from(devOrders.values()).filter((o) => o.estado === estado);
  }
  const json = await callSheets<{ orders: Order[] }>("ordersByStatus", { estado }, { protegido: true });
  return json.orders;
}

export async function updateOrderStatus(
  orderId: string,
  estado: Order["estado"],
  extra: Partial<Pick<Order, "rappiCargoId" | "operacionYape">> = {}
): Promise<void> {
  if (!sheetsConfigured) {
    warnDevFallback("updateOrderStatus");
    const existing = devOrders.get(orderId);
    if (existing) {
      devOrders.set(orderId, { ...existing, estado, ...extra, actualizadoEn: new Date().toISOString() });
    }
    return;
  }
  await callSheets(
    "updateOrderStatus",
    {
      orderId,
      estado,
      ...(extra.rappiCargoId ? { rappiCargoId: extra.rappiCargoId } : {}),
      ...(extra.operacionYape ? { operacionYape: extra.operacionYape } : {}),
    },
    { protegido: true }
  );
}

export async function saveProfile(profile: ProfileEntry): Promise<void> {
  if (!sheetsConfigured) {
    warnDevFallback("saveProfile");
    devProfiles.set(profile.email, profile);
    return;
  }
  await callSheets("saveProfile", {}, { method: "POST", body: profile });
}

export async function getProfile(email: string): Promise<ProfileEntry | null> {
  if (!sheetsConfigured) {
    warnDevFallback("getProfile");
    return devProfiles.get(email) ?? null;
  }
  const json = await callSheets<{ profile: ProfileEntry | null }>("getProfile", { email });
  return json.profile;
}

export interface SalesTodayReport {
  fecha: string;
  totalVentas: number;
  cantidadPedidos: number;
  pedidos: Order[];
}

export async function getSalesToday(): Promise<SalesTodayReport> {
  if (!sheetsConfigured) {
    warnDevFallback("salesToday");
    const hoy = new Date().toISOString().slice(0, 10);
    const pedidos = Array.from(devOrders.values()).filter(
      (o) => o.fecha === hoy && o.estado !== "cancelado" && o.estado !== "pendiente_pago"
    );
    return {
      fecha: hoy,
      totalVentas: pedidos.reduce((sum, o) => sum + o.total, 0),
      cantidadPedidos: pedidos.length,
      pedidos,
    };
  }
  return callSheets<SalesTodayReport>("salesToday", {}, { protegido: true });
}
